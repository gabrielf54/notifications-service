const { ValidationError } = require('../utils/errors');

class SMSValidator {
  static validateSendSMS(data) {
    const { to, message } = data;

    if (!to) {
      throw new ValidationError('Phone number is required', 'to');
    }

    if (!message) {
      throw new ValidationError('Message is required', 'message');
    }

    // Validar formato do número de telefone
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(to.replace(/\D/g, ''))) {
      throw new ValidationError('Invalid phone number format', 'to');
    }

    // Validar tamanho da mensagem
    if (message.length > 160) {
      throw new ValidationError('Message exceeds maximum length of 160 characters', 'message');
    }

    return {
      to: to.replace(/\D/g, ''),
      message: message.trim()
    };
  }
}

module.exports = SMSValidator; 