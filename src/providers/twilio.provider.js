const twilio = require('twilio');
const SMSProvider = require('../interfaces/sms.provider.interface');
const logger = require('../utils/logger');

class TwilioProvider extends SMSProvider {
  constructor() {
    super();
    this.client = new twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
  }

  async sendSMS(to, message) {
    try {
      const response = await this.client.messages.create({
        body: message,
        to: this.formatNumber(to),
        from: process.env.TWILIO_PHONE_NUMBER
      });

      logger.info(`SMS sent via Twilio to ${to}`);

      return {
        success: true,
        provider: 'twilio',
        messageId: response.sid,
        timestamp: new Date().toISOString(),
        status: 'sent',
        details: {
          to,
          message,
          deliveryStatus: 'delivered'
        }
      };
    } catch (error) {
      logger.error('Twilio SMS error:', error);
      
      return {
        success: false,
        provider: 'twilio',
        error: error.message,
        status: 'failed',
        details: {
          to,
          message
        }
      };
    }
  }

  formatNumber(number) {
    // Remove qualquer caractere não numérico
    return number.replace(/\D/g, '');
  }
}

module.exports = TwilioProvider; 