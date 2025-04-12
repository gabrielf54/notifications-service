const AWS = require('aws-sdk');
const SMSProvider = require('../interfaces/sms.provider.interface');
const logger = require('../utils/logger');

class AWSProvider extends SMSProvider {
  constructor() {
    super();
    this.sns = new AWS.SNS({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_KEY
      }
    });
  }

  async sendSMS(to, message) {
    try {
      const params = {
        Message: message,
        PhoneNumber: this.formatNumber(to)
      };

      const response = await this.sns.publish(params).promise();
      
      logger.info(`SMS sent via AWS to ${to}`);

      return {
        success: true,
        provider: 'aws',
        messageId: response.MessageId,
        timestamp: new Date().toISOString(),
        status: 'sent',
        details: {
          to,
          message,
          deliveryStatus: 'delivered'
        }
      };
    } catch (error) {
      logger.error('AWS SMS error:', error);
      
      return {
        success: false,
        provider: 'aws',
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

module.exports = AWSProvider; 