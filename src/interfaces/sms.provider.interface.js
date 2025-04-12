class SMSProvider {
  async sendSMS(to, message) {
    throw new Error('Method sendSMS() must be implemented');
  }
}

module.exports = SMSProvider; 