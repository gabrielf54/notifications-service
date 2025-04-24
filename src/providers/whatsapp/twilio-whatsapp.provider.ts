// src/providers/whatsapp/twilio-whatsapp.provider.ts
import { Twilio } from 'twilio';
import { WhatsAppProviderInterface, WhatsAppProviderResponse, WhatsAppOptions } from '../../interfaces/whatsapp/whatsapp-provider.interface';
import config from '../../config';
import { formatPhoneNumber } from '../../utils/formatter';
import logger from '../../utils/logger';

export class TwilioWhatsAppProvider implements WhatsAppProviderInterface {
  private client: Twilio;
  private phoneNumber: string;

  constructor() {
    this.client = new Twilio(
      config.twilio.accountSid,
      config.twilio.authToken
    );
    // Para WhatsApp via Twilio, o número precisa ter o prefixo 'whatsapp:'
    this.phoneNumber = `whatsapp:${config.twilio.phoneNumber.replace(/^\+/, '')}`;
    logger.info('Twilio WhatsApp provider initialized');
  }

  async send(to: string, message: string, options: WhatsAppOptions = {}): Promise<WhatsAppProviderResponse> {
    try {
      const formattedNumber = `whatsapp:${formatPhoneNumber(to).replace(/^\+/, '')}`;
      
      let mediaUrl;
      if (options.mediaUrl) {
        mediaUrl = [options.mediaUrl];
      }
      
      const response = await this.client.messages.create({
        body: message,
        from: this.phoneNumber,
        to: formattedNumber,
        ...(mediaUrl ? { mediaUrl } : {})
      });

      logger.debug('WhatsApp message sent via Twilio', { messageId: response.sid });
      
      return {
        success: true,
        provider: 'twilio-whatsapp',
        messageId: response.sid,
        timestamp: new Date().toISOString(),
        status: response.status,
        details: {
          to: formattedNumber,
          message: message,
          providerResponse: response
        }
      };
    } catch (error) {
      logger.error('Failed to send WhatsApp message via Twilio', { error: (error as Error).message });
      throw error;
    }
  }

  async getStatus(messageId: string): Promise<any> {
    try {
      const message = await this.client.messages(messageId).fetch();
      
      return {
        messageId: message.sid,
        status: message.status,
        updatedAt: new Date().toISOString(),
        details: message
      };
    } catch (error) {
      logger.error('Failed to get message status from Twilio WhatsApp', { 
        messageId, 
        error: (error as Error).message 
      });
      throw error;
    }
  }

  async checkHealth(): Promise<boolean> {
    try {
      // Verificar se podemos acessar a API do Twilio
      await this.client.api.accounts(config.twilio.accountSid).fetch();
      return true;
    } catch (error) {
      logger.error('Twilio WhatsApp health check failed', { error: (error as Error).message });
      return false;
    }
  }
}
