// src/providers/email/sendgrid.provider.ts
import axios from 'axios';
import { EmailProviderInterface, EmailContent, EmailProviderResponse, EmailOptions } from '../../interfaces/email/email-provider.interface';
import config from '../../config';
import { formatEmail } from '../../utils/formatter';
import logger from '../../utils/logger';

export class SendGridProvider implements EmailProviderInterface {
  private apiKey: string;
  private fromEmail: string;
  private fromName: string;
  private baseUrl: string = 'https://api.sendgrid.com/v3';

  constructor() {
    this.apiKey = config.sendgrid.apiKey;
    this.fromEmail = config.sendgrid.fromEmail;
    this.fromName = config.sendgrid.fromName;
    logger.info('SendGrid email provider initialized');
  }

  async send(to: string, content: EmailContent, options: EmailOptions = {}): Promise<EmailProviderResponse> {
    try {
      const formattedEmail = formatEmail(to);
      
      const payload = {
        personalizations: [
          {
            to: [{ email: formattedEmail }],
            subject: content.subject,
            ...(options.cc ? { cc: this.formatRecipients(options.cc) } : {}),
            ...(options.bcc ? { bcc: this.formatRecipients(options.bcc) } : {})
          }
        ],
        from: {
          email: this.fromEmail,
          name: this.fromName
        },
        ...(options.replyTo ? { reply_to: { email: options.replyTo } } : {}),
        content: [
          {
            type: 'text/plain',
            value: content.text
          },
          {
            type: 'text/html',
            value: content.html
          }
        ],
        ...(content.attachments && content.attachments.length > 0
          ? {
              attachments: content.attachments.map(attachment => ({
                content: typeof attachment.content === 'string' 
                  ? Buffer.from(attachment.content).toString('base64')
                  : attachment.content.toString('base64'),
                filename: attachment.filename,
                type: attachment.contentType || 'application/octet-stream',
                disposition: 'attachment'
              }))
            }
          : {})
      };

      const response = await axios({
        method: 'POST',
        url: `${this.baseUrl}/mail/send`,
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        data: payload
      });
      
      // SendGrid não retorna um ID de mensagem diretamente na resposta,
      // mas podemos usar o X-Message-Id do cabeçalho de resposta se disponível
      const messageId = response.headers['x-message-id'] || `sendgrid-${Date.now()}`;
      
      logger.debug('Email sent via SendGrid', { messageId });
      
      return {
        success: true,
        provider: 'sendgrid',
        messageId,
        timestamp: new Date().toISOString(),
        status: 'sent',
        details: {
          to: formattedEmail,
          subject: content.subject,
          providerResponse: {
            statusCode: response.status,
            headers: response.headers
          }
        }
      };
    } catch (error: any) {
      logger.error('Failed to send email via SendGrid', { 
        error: error.message,
        response: error.response?.data
      });
      throw error;
    }
  }

  async getStatus(messageId: string): Promise<any> {
    try {
      // SendGrid não oferece uma API simples para verificar o status de uma mensagem específica
      // Seria necessário usar o Event Webhook ou a API de estatísticas para rastrear eventos
      logger.warn('Status check not directly supported for SendGrid', { messageId });
      
      return {
        messageId,
        status: 'unknown',
        updatedAt: new Date().toISOString(),
        details: { note: 'SendGrid requires Event Webhook setup for detailed status tracking' }
      };
    } catch (error) {
      logger.error('Failed to get message status from SendGrid', { 
        messageId, 
        error: (error as Error).message 
      });
      throw error;
    }
  }

  async checkHealth(): Promise<boolean> {
    try {
      // Verificar se podemos acessar a API do SendGrid
      const response = await axios({
        method: 'GET',
        url: `${this.baseUrl}/scopes`,
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });
      
      return response.status === 200;
    } catch (error) {
      logger.error('SendGrid health check failed', { error: (error as Error).message });
      return false;
    }
  }

  private formatRecipients(recipients: string | string[]): Array<{email: string}> {
    if (typeof recipients === 'string') {
      return [{ email: formatEmail(recipients) }];
    }
    
    return recipients.map(email => ({ email: formatEmail(email) }));
  }
}
