// src/config/index.ts
import dotenv from 'dotenv';
import path from 'path';

// Carrega variáveis de ambiente do arquivo .env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const config = {
  server: {
    port: process.env.PORT || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',
    apiVersion: process.env.API_VERSION || 'v1',
    logLevel: process.env.LOG_LEVEL || 'info',
  },
  
  supabase: {
    url: process.env.SUPABASE_URL || '',
    key: process.env.SUPABASE_KEY || '',
    serviceKey: process.env.SUPABASE_SERVICE_KEY || '',
  },
  
  redis: {
    uri: process.env.REDIS_URI || 'redis://localhost:6379',
  },
  
  rabbitmq: {
    uri: process.env.RABBITMQ_URI || 'amqp://localhost:5672',
    queues: {
      notifications: 'notifications',
      status: 'status-updates',
      deadLetter: 'dead-letter',
    },
    exchanges: {
      notifications: 'notifications-exchange',
      status: 'status-exchange',
    },
  },
  
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: process.env.JWT_EXPIRATION || '24h',
  },
  
  rateLimit: {
    window: process.env.RATE_LIMIT_WINDOW || '15m',
    max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
  },
  
  providers: {
    getDefaultProvider: (channel: string): string => {
      switch (channel) {
        case 'sms':
          return process.env.DEFAULT_SMS_PROVIDER || 'twilio';
        case 'email':
          return process.env.DEFAULT_EMAIL_PROVIDER || 'sendgrid';
        case 'whatsapp':
          return process.env.DEFAULT_WHATSAPP_PROVIDER || 'meta-api';
        default:
          throw new Error(`Channel not supported: ${channel}`);
      }
    },
  },
  
  // Configurações específicas para provedores
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID || '',
    authToken: process.env.TWILIO_AUTH_TOKEN || '',
    phoneNumber: process.env.TWILIO_PHONE_NUMBER || '',
  },
  
  awsSns: {
    region: process.env.AWS_REGION || 'us-east-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
  
  sendgrid: {
    apiKey: process.env.SENDGRID_API_KEY || '',
    fromEmail: process.env.SENDGRID_FROM_EMAIL || '',
    fromName: process.env.SENDGRID_FROM_NAME || '',
  },
  
  awsSes: {
    region: process.env.AWS_SES_REGION || 'us-east-1',
    accessKeyId: process.env.AWS_SES_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SES_SECRET_ACCESS_KEY || '',
    fromEmail: process.env.AWS_SES_FROM_EMAIL || '',
  },
  
  metaApi: {
    appId: process.env.META_APP_ID || '',
    appSecret: process.env.META_APP_SECRET || '',
    businessAccountId: process.env.META_WHATSAPP_BUSINESS_ACCOUNT_ID || '',
    phoneNumberId: process.env.META_WHATSAPP_PHONE_NUMBER_ID || '',
    accessToken: process.env.META_WHATSAPP_ACCESS_TOKEN || '',
  },
};

export default config;
