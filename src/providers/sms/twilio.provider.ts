// src/providers/sms/twilio.provider.ts
import { Twilio } from 'twilio';
import { SMSProviderInterface, SMSProviderResponse, SMSOptions } from '../../interfaces/sms/sms-provider.interface';
import config from '../../config';
import { formatPhoneNumber } from '../../utils/formatter';
import logger from '../../utils/logger';

export class TwilioProvider implements SMSProviderInterface {
  private client: Twilio;
  private phoneNumber: string;

  constructor() {
    this.client = new Twilio(
      config.twilio.accountSid,
      config.twilio.authToken
    );
    this.phoneNumber = config.twilio.phoneNumber;
    logger.info('Twilio SMS provider initialized');
  }

  async send(to: string, message: string, options: SMSOptions = {}): Promise<SMSProviderResponse> {
    try {
      const formattedNumber = formatPhoneNumber(to);
      
      const response = await this.client.messages.create({
        body: message,
        from: this.phoneNumber,
        to: formattedNumber,
        ...(options.priority === 'high' ? { priority: 'high' } : {})
      });

      logger.debug('SMS sent via Twilio', { messageId: response.sid });
      
      return {
        success: true,
        provider: 'twilio',
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
      logger.error('Failed to send SMS via Twilio', { error: (error as Error).message });
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
      logger.error('Failed to get message status from Twilio', { 
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
      logger.error('Twilio health check failed', { error: (error as Error).message });
      return false;
    }
  }
}
