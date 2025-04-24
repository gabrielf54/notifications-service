// src/providers/sms/aws-sns.provider.ts
import AWS from 'aws-sdk';
import { SMSProviderInterface, SMSProviderResponse, SMSOptions } from '../../interfaces/sms/sms-provider.interface';
import config from '../../config';
import { formatPhoneNumber } from '../../utils/formatter';
import logger from '../../utils/logger';

export class AWSSNSProvider implements SMSProviderInterface {
  private sns: AWS.SNS;

  constructor() {
    AWS.config.update({
      region: config.awsSns.region,
      accessKeyId: config.awsSns.accessKeyId,
      secretAccessKey: config.awsSns.secretAccessKey
    });
    
    this.sns = new AWS.SNS();
    logger.info('AWS SNS provider initialized');
  }

  async send(to: string, message: string, options: SMSOptions = {}): Promise<SMSProviderResponse> {
    try {
      const formattedNumber = formatPhoneNumber(to);
      
      const params = {
        Message: message,
        PhoneNumber: formattedNumber,
        MessageAttributes: {
          'AWS.SNS.SMS.SenderID': {
            DataType: 'String',
            StringValue: options.senderId || 'NOTIFICATION'
          },
          'AWS.SNS.SMS.SMSType': {
            DataType: 'String',
            StringValue: options.priority === 'high' ? 'Transactional' : 'Promotional'
          }
        }
      };
      
      const response = await this.sns.publish(params).promise();
      
      logger.debug('SMS sent via AWS SNS', { messageId: response.MessageId });
      
      return {
        success: true,
        provider: 'aws-sns',
        messageId: response.MessageId || '',
        timestamp: new Date().toISOString(),
        status: 'sent', // AWS SNS não fornece status detalhado imediatamente
        details: {
          to: formattedNumber,
          message: message,
          providerResponse: response
        }
      };
    } catch (error) {
      logger.error('Failed to send SMS via AWS SNS', { error: (error as Error).message });
      throw error;
    }
  }

  async getStatus(messageId: string): Promise<any> {
    // AWS SNS não fornece API para verificar status de mensagens individuais
    // Implementação alternativa usando CloudWatch Logs ou outro mecanismo seria necessária
    logger.warn('Status check not fully supported for AWS SNS', { messageId });
    
    return {
      messageId: messageId,
      status: 'unknown',
      updatedAt: new Date().toISOString(),
      details: { note: 'AWS SNS does not provide direct status checking' }
    };
  }

  async checkHealth(): Promise<boolean> {
    try {
      // Verificar se podemos listar os tópicos (operação leve)
      await this.sns.listTopics({}).promise();
      return true;
    } catch (error) {
      logger.error('AWS SNS health check failed', { error: (error as Error).message });
      return false;
    }
  }
}
