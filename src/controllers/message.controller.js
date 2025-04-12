const smsService = require('../services/sms.service');
const SMSValidator = require('../validators/sms.validator');
const { ValidationError, ProviderError, ServiceError } = require('../utils/errors');
const logger = require('../utils/logger');

class MessageController {
  async sendMessage(req, res) {
    try {
      // Validar dados de entrada
      const validatedData = SMSValidator.validateSendSMS(req.body);

      // Enviar SMS
      const result = await smsService.sendSMS(validatedData.to, validatedData.message);

      // Retornar resposta
      res.json(result);
    } catch (error) {
      logger.error('Error in sendMessage:', error);

      // Tratamento específico para cada tipo de erro
      if (error instanceof ValidationError) {
        return res.status(error.statusCode).json({
          success: false,
          error: {
            message: error.message,
            field: error.field,
            type: 'validation'
          }
        });
      }

      if (error instanceof ProviderError) {
        return res.status(error.statusCode).json({
          success: false,
          error: {
            message: error.message,
            provider: error.provider,
            type: 'provider'
          }
        });
      }

      if (error instanceof ServiceError) {
        return res.status(error.statusCode).json({
          success: false,
          error: {
            message: error.message,
            service: error.service,
            type: 'service'
          }
        });
      }

      // Erro genérico
      res.status(500).json({
        success: false,
        error: {
          message: 'Internal server error',
          type: 'internal'
        }
      });
    }
  }
}

module.exports = new MessageController(); 