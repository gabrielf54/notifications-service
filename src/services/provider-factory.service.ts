// src/services/provider-factory.service.ts
import config from '../config';
import logger from '../utils/logger';

// Importação de provedores SMS
import { TwilioProvider } from '../providers/sms/twilio.provider';
import { AWSSNSProvider } from '../providers/sms/aws-sns.provider';

// Importação de provedores de e-mail
import { SendGridProvider } from '../providers/email/sendgrid.provider';
import { AWSSESProvider } from '../providers/email/aws-ses.provider';

// Importação de provedores de WhatsApp
import { MetaAPIProvider } from '../providers/whatsapp/meta-api.provider';
import { TwilioWhatsAppProvider } from '../providers/whatsapp/twilio-whatsapp.provider';

// Interfaces
import { SMSProviderInterface } from '../interfaces/sms/sms-provider.interface';
import { EmailProviderInterface } from '../interfaces/email/email-provider.interface';
import { WhatsAppProviderInterface } from '../interfaces/whatsapp/whatsapp-provider.interface';

class ProviderFactory {
  private providers: {
    sms: Record<string, SMSProviderInterface>;
    email: Record<string, EmailProviderInterface>;
    whatsapp: Record<string, WhatsAppProviderInterface>;
  };
  
  constructor() {
    this.providers = {
      sms: {},
      email: {},
      whatsapp: {}
    };
    
    this.initializeProviders();
    logger.info('Provider factory initialized');
  }

  private initializeProviders(): void {
    // Inicializar provedores SMS
    this.providers.sms.twilio = new TwilioProvider();
    this.providers.sms['aws-sns'] = new AWSSNSProvider();
    
    // Inicializar provedores de e-mail
    this.providers.email.sendgrid = new SendGridProvider();
    this.providers.email['aws-ses'] = new AWSSESProvider();
    
    // Inicializar provedores de WhatsApp
    this.providers.whatsapp['meta-api'] = new MetaAPIProvider();
    this.providers.whatsapp['twilio-whatsapp'] = new TwilioWhatsAppProvider();
  }

  /**
   * Obtém um provedor para o canal especificado
   * @param channel - Canal (sms, email, whatsapp)
   * @param providerName - Nome do provedor (opcional, usa o padrão se não especificado)
   * @returns - Instância do provedor
   */
  getProvider(channel: 'sms' | 'email' | 'whatsapp', providerName?: string): SMSProviderInterface | EmailProviderInterface | WhatsAppProviderInterface {
    if (!this.providers[channel]) {
      throw new Error(`Channel not supported: ${channel}`);
    }
    
    const provider = providerName || config.providers.getDefaultProvider(channel);
    
    if (!this.providers[channel][provider]) {
      throw new Error(`Provider not found: ${provider} for channel ${channel}`);
    }
    
    return this.providers[channel][provider];
  }

  /**
   * Lista todos os provedores disponíveis para um canal
   * @param channel - Canal (sms, email, whatsapp)
   * @returns - Lista de nomes de provedores
   */
  listProviders(channel: 'sms' | 'email' | 'whatsapp'): string[] {
    if (!this.providers[channel]) {
      throw new Error(`Channel not supported: ${channel}`);
    }
    
    return Object.keys(this.providers[channel]);
  }

  /**
   * Verifica a saúde de todos os provedores
   * @returns - Status de saúde por canal e provedor
   */
  async checkHealth(): Promise<Record<string, any>> {
    const health: Record<string, any> = {};
    
    for (const channel in this.providers) {
      health[channel] = {
        active: config.providers.getDefaultProvider(channel),
        providers: {}
      };
      
      for (const providerName in this.providers[channel as keyof typeof this.providers]) {
        const provider = this.providers[channel as keyof typeof this.providers][providerName];
        health[channel].providers[providerName] = await provider.checkHealth();
      }
    }
    
    return health;
  }
}

// Singleton
const factory = new ProviderFactory();
export default factory;
