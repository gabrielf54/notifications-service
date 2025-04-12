const smsService = require('../services/sms.service');
const logger = require('../utils/logger');

class MessageController {
  async sendMessage(req, res) {
    try {
      const { to, message } = req.body;

      if (!to || !message) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: to and message'
        });
      }

      const result = await smsService.sendSMS(to, message);

      if (!result.success) {
        return res.status(500).json(result);
      }

      res.json(result);
    } catch (error) {
      logger.error('Error in sendMessage:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = new MessageController(); 