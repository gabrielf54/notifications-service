// src/providers/email/aws-ses.provider.ts
import AWS from 'aws-sdk';
import { EmailProviderInterface, EmailContent, EmailProviderResponse, EmailOptions } from '../../interfaces/email/email-provider.interface';
import config from '../../config';
import { formatEmail } from '../../utils/formatter';
import logger from '../../utils/logger';

export class AWSSESProvider implements EmailProviderInterface {
  private ses: AWS.SES;
  private fromEmail: string;

  constructor() {
    AWS.config.update({
      region: config.awsSes.region,
      accessKeyId: config.awsSes.accessKeyId,
      secretAccessKey: config.awsSes.secretAccessKey
    });
    
    this.ses = new AWS.SES();
    this.fromEmail = config.awsSes.fromEmail;
    logger.info('AWS SES email provider initialized');
  }

  async send(to: string, content: EmailContent, options: EmailOptions = {}): Promise<EmailProviderResponse> {
    try {
      const formattedEmail = formatEmail(to);
      
      // Preparar destinatários CC e BCC se fornecidos
      const ccAddresses = this.formatRecipientList(options.cc);
      const bccAddresses = this.formatRecipientList(options.bcc);
      
      // Preparar anexos se houver
      let rawMessage;
      if (content.attachments && content.attachments.length > 0) {
        // Para anexos, precisamos usar o SendRawEmail com MIME
        rawMessage = this.createRawEmailWithAttachments(
          formattedEmail, 
          content, 
          options,
          ccAddresses,
          bccAddresses
        );
      }
      
      let response;
      if (rawMessage) {
        // Enviar e-mail com anexos usando SendRawEmail
        response = await this.ses.sendRawEmail({
          RawMessage: { Data: rawMessage }
        }).promise();
      } else {
        // Enviar e-mail simples usando SendEmail
        response = await this.ses.sendEmail({
          Source: this.fromEmail,
          Destination: {
            ToAddresses: [formattedEmail],
            ...(ccAddresses.length > 0 ? { CcAddresses: ccAddresses } : {}),
            ...(bccAddresses.length > 0 ? { BccAddresses: bccAddresses } : {})
          },
          Message: {
            Subject: {
              Data: content.subject,
              Charset: 'UTF-8'
            },
            Body: {
              Text: {
                Data: content.text,
                Charset: 'UTF-8'
              },
              Html: {
                Data: content.html,
                Charset: 'UTF-8'
              }
            }
          },
          ...(options.replyTo ? { ReplyToAddresses: [options.replyTo] } : {})
        }).promise();
      }
      
      logger.debug('Email sent via AWS SES', { messageId: response.MessageId });
      
      return {
        success: true,
        provider: 'aws-ses',
        messageId: response.MessageId || '',
        timestamp: new Date().toISOString(),
        status: 'sent',
        details: {
          to: formattedEmail,
          subject: content.subject,
          providerResponse: response
        }
      };
    } catch (error) {
      logger.error('Failed to send email via AWS SES', { error: (error as Error).message });
      throw error;
    }
  }

  async getStatus(messageId: string): Promise<any> {
    // AWS SES não fornece uma API direta para verificar o status de uma mensagem específica
    // Seria necessário configurar o feedback de entrega para CloudWatch ou outro serviço
    logger.warn('Status check not directly supported for AWS SES', { messageId });
    
    return {
      messageId,
      status: 'unknown',
      updatedAt: new Date().toISOString(),
      details: { note: 'AWS SES requires delivery notifications setup for detailed status tracking' }
    };
  }

  async checkHealth(): Promise<boolean> {
    try {
      // Verificar se podemos acessar a API do SES
      const response = await this.ses.getSendQuota().promise();
      return !!response.Max24HourSend;
    } catch (error) {
      logger.error('AWS SES health check failed', { error: (error as Error).message });
      return false;
    }
  }

  private formatRecipientList(recipients?: string | string[]): string[] {
    if (!recipients) {
      return [];
    }
    
    if (typeof recipients === 'string') {
      return [formatEmail(recipients)];
    }
    
    return recipients.map(email => formatEmail(email));
  }

  private createRawEmailWithAttachments(
    to: string, 
    content: EmailContent, 
    options: EmailOptions,
    ccAddresses: string[],
    bccAddresses: string[]
  ): Buffer {
    // Nota: Esta é uma implementação simplificada. Para uma solução completa,
    // seria melhor usar uma biblioteca como nodemailer para criar mensagens MIME.
    
    // Aqui estamos apenas simulando a criação de uma mensagem MIME
    // Em um cenário real, usaríamos algo como:
    // const mail = new MailComposer({...}).compile().build()
    
    // Este é apenas um placeholder para demonstrar a estrutura
    const boundary = `----=${Math.random().toString(36).substring(2)}`;
    
    let rawEmail = '';
    rawEmail += `From: ${this.fromEmail}\r\n`;
    rawEmail += `To: ${to}\r\n`;
    
    if (ccAddresses.length > 0) {
      rawEmail += `Cc: ${ccAddresses.join(', ')}\r\n`;
    }
    
    if (bccAddresses.length > 0) {
      rawEmail += `Bcc: ${bccAddresses.join(', ')}\r\n`;
    }
    
    if (options.replyTo) {
      rawEmail += `Reply-To: ${options.replyTo}\r\n`;
    }
    
    rawEmail += `Subject: ${content.subject}\r\n`;
    rawEmail += 'MIME-Version: 1.0\r\n';
    rawEmail += `Content-Type: multipart/mixed; boundary="${boundary}"\r\n\r\n`;
    
    // Parte de texto
    rawEmail += `--${boundary}\r\n`;
    rawEmail += 'Content-Type: text/plain; charset=UTF-8\r\n\r\n';
    rawEmail += `${content.text}\r\n\r\n`;
    
    // Parte HTML
    rawEmail += `--${boundary}\r\n`;
    rawEmail += 'Content-Type: text/html; charset=UTF-8\r\n\r\n';
    rawEmail += `${content.html}\r\n\r\n`;
    
    // Anexos
    if (content.attachments) {
      for (const attachment of content.attachments) {
        rawEmail += `--${boundary}\r\n`;
        rawEmail += `Content-Type: ${attachment.contentType || 'application/octet-stream'}; name="${attachment.filename}"\r\n`;
        rawEmail += 'Content-Transfer-Encoding: base64\r\n';
        rawEmail += `Content-Disposition: attachment; filename="${attachment.filename}"\r\n\r\n`;
        
        const content = typeof attachment.content === 'string' 
          ? Buffer.from(attachment.content).toString('base64')
          : attachment.content.toString('base64');
        
        rawEmail += `${content}\r\n\r\n`;
      }
    }
    
    // Finalizar mensagem
    rawEmail += `--${boundary}--\r\n`;
    
    return Buffer.from(rawEmail);
  }
}
