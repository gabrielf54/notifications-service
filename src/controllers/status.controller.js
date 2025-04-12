const smsService = require('../services/sms.service');
const logger = require('../utils/logger');

class StatusController {
  async getStatus(req, res) {
    try {
      const status = {
        service: 'SMS Notification Service',
        provider: process.env.SMS_PROVIDER,
        status: 'operational',
        timestamp: new Date().toISOString()
      };

      res.json({
        success: true,
        data: status
      });
    } catch (error) {
      logger.error('Error in getStatus:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = new StatusController(); 