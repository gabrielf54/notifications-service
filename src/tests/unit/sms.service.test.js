const SMSService = require('../../services/sms.service');
const logger = require('../../utils/logger');

jest.mock('../../utils/logger');
jest.mock('../../providers/twilio.provider');
jest.mock('../../providers/aws.provider');

describe('SMSService', () => {
  let smsService;

  beforeEach(() => {
    process.env.SMS_PROVIDER = 'twilio';
    smsService = new SMSService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getProvider', () => {
    it('should return Twilio provider when SMS_PROVIDER is twilio', () => {
      process.env.SMS_PROVIDER = 'twilio';
      const provider = smsService.getProvider();
      expect(provider.constructor.name).toBe('TwilioProvider');
    });

    it('should return AWS provider when SMS_PROVIDER is aws', () => {
      process.env.SMS_PROVIDER = 'aws';
      const provider = smsService.getProvider();
      expect(provider.constructor.name).toBe('AWSProvider');
    });

    it('should throw error for invalid provider', () => {
      process.env.SMS_PROVIDER = 'invalid';
      expect(() => smsService.getProvider()).toThrow('Invalid SMS provider');
    });
  });

  describe('sendSMS', () => {
    it('should send SMS successfully', async () => {
      const mockResponse = {
        success: true,
        provider: 'twilio',
        messageId: 'SM123456789',
        status: 'sent'
      };

      smsService.provider.sendSMS = jest.fn().mockResolvedValue(mockResponse);

      const result = await smsService.sendSMS('5511999999999', 'Test message');
      expect(result).toEqual(mockResponse);
    });

    it('should handle missing required fields', async () => {
      const result = await smsService.sendSMS('', '');
      expect(result.success).toBe(false);
      expect(result.error).toBe('Missing required fields: to and message');
    });

    it('should handle provider errors', async () => {
      const error = new Error('Provider error');
      smsService.provider.sendSMS = jest.fn().mockRejectedValue(error);

      const result = await smsService.sendSMS('5511999999999', 'Test message');
      expect(result.success).toBe(false);
      expect(result.error).toBe('Provider error');
    });
  });
}); 