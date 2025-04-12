const TwilioProvider = require('../providers/twilio.provider');
const AWSProvider = require('../providers/aws.provider');
const logger = require('../utils/logger');

class SMSService {
  constructor() {
    this.provider = this.getProvider();
  }

  getProvider() {
    const provider = process.env.SMS_PROVIDER?.toLowerCase();

    switch (provider) {
      case 'twilio':
        logger.info('Using Twilio as SMS provider');
        return new TwilioProvider();
      case 'aws':
        logger.info('Using AWS SNS as SMS provider');
        return new AWSProvider();
      default:
        throw new Error(`Invalid SMS provider: ${provider}. Use 'twilio' or 'aws'`);
    }
  }

  async sendSMS(to, message) {
    try {
      if (!to || !message) {
        throw new Error('Missing required fields: to and message');
      }

      return await this.provider.sendSMS(to, message);
    } catch (error) {
      logger.error('SMS service error:', error);
      
      return {
        success: false,
        provider: process.env.SMS_PROVIDER,
        error: error.message,
        status: 'failed',
        details: {
          to,
          message
        }
      };
    }
  }
}

module.exports = new SMSService(); 