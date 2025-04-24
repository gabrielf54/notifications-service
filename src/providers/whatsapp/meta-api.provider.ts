// src/providers/whatsapp/meta-api.provider.ts
import axios from 'axios';
import { WhatsAppProviderInterface, WhatsAppProviderResponse, WhatsAppOptions } from '../../interfaces/whatsapp/whatsapp-provider.interface';
import config from '../../config';
import { formatPhoneNumber } from '../../utils/formatter';
import logger from '../../utils/logger';

export class MetaAPIProvider implements WhatsAppProviderInterface {
  private accessToken: string;
  private phoneNumberId: string;
  private baseUrl: string = 'https://graph.facebook.com/v16.0';

  constructor() {
    this.accessToken = config.metaApi.accessToken;
    this.phoneNumberId = config.metaApi.phoneNumberId;
    logger.info('Meta API WhatsApp provider initialized');
  }

  async send(to: string, message: string, options: WhatsAppOptions = {}): Promise<WhatsAppProviderResponse> {
    try {
      const formattedNumber = formatPhoneNumber(to);
      
      let payload;
      
      // Se um template foi especificado, usar a API de templates
      if (options.templateName) {
        payload = {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: formattedNumber,
          type: 'template',
          template: {
            name: options.templateName,
            language: {
              code: 'pt_BR' // Pode ser parametrizado se necessário
            },
            components: []
          }
        };
        
        // Adicionar parâmetros do template se fornecidos
        if (options.templateParams && Object.keys(options.templateParams).length > 0) {
          const parameters = Object.entries(options.templateParams).map(([_, value]) => ({
            type: 'text',
            text: value
          }));
          
          payload.template.components.push({
            type: 'body',
            parameters
          });
        }
      } 
      // Se uma mídia foi especificada, enviar mensagem com mídia
      else if (options.mediaUrl && options.mediaType) {
        payload = {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: formattedNumber,
          type: options.mediaType,
          [options.mediaType]: {
            link: options.mediaUrl,
            caption: message
          }
        };
      } 
      // Caso contrário, enviar mensagem de texto simples
      else {
        payload = {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: formattedNumber,
          type: 'text',
          text: {
            preview_url: false,
            body: message
          }
        };
      }
      
      const response = await axios({
        method: 'POST',
        url: `${this.baseUrl}/${this.phoneNumberId}/messages`,
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        },
        data: payload
      });
      
      const messageId = response.data.messages?.[0]?.id || '';
      
      logger.debug('WhatsApp message sent via Meta API', { messageId });
      
      return {
        success: true,
        provider: 'meta-api',
        messageId,
        timestamp: new Date().toISOString(),
        status: 'sent',
        details: {
          to: formattedNumber,
          message,
          providerResponse: response.data
        }
      };
    } catch (error: any) {
      logger.error('Failed to send WhatsApp message via Meta API', { 
        error: error.message,
        response: error.response?.data
      });
      throw error;
    }
  }

  async getStatus(messageId: string): Promise<any> {
    try {
      // A API da Meta não fornece um endpoint direto para verificar o status de uma mensagem específica
      // O status é enviado via webhooks
      logger.warn('Status check not directly supported for Meta API', { messageId });
      
      return {
        messageId,
        status: 'unknown',
        updatedAt: new Date().toISOString(),
        details: { note: 'Meta API requires webhook setup for status updates' }
      };
    } catch (error) {
      logger.error('Failed to get message status from Meta API', { 
        messageId, 
        error: (error as Error).message 
      });
      throw error;
    }
  }

  async checkHealth(): Promise<boolean> {
    try {
      // Verificar se podemos acessar a API da Meta
      const response = await axios({
        method: 'GET',
        url: `${this.baseUrl}/${this.phoneNumberId}`,
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      });
      
      return response.status === 200;
    } catch (error) {
      logger.error('Meta API health check failed', { error: (error as Error).message });
      return false;
    }
  }
}
