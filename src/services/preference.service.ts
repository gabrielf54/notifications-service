// src/services/preference.service.ts
import { PreferenceModel, PreferenceDocument, ChannelPreference } from '../models/preference.model';
import { NotFoundError, ValidationError } from '../utils/error-handler';
import logger from '../utils/logger';

class PreferenceService {
  /**
   * Obtém ou cria preferências para um usuário
   * @param userId - ID do usuário
   * @returns - Preferências do usuário
   */
  async getOrCreatePreferences(userId: string): Promise<PreferenceDocument> {
    try {
      let preferences = await PreferenceModel.findOne({ userId });
      
      if (!preferences) {
        preferences = new PreferenceModel({ userId });
        await preferences.save();
        logger.info('User preferences created', { userId });
      }
      
      return preferences;
    } catch (error) {
      logger.error('Failed to get or create user preferences', { 
        userId, 
        error: (error as Error).message 
      });
      throw error;
    }
  }

  /**
   * Atualiza as preferências de um usuário
   * @param userId - ID do usuário
   * @param preferencesData - Dados atualizados das preferências
   * @returns - Preferências atualizadas
   */
  async updatePreferences(userId: string, preferencesData: Partial<PreferenceDocument>): Promise<PreferenceDocument> {
    try {
      const preferences = await this.getOrCreatePreferences(userId);
      
      // Atualizar campos
      if (preferencesData.channels) {
        preferences.channels = {
          ...preferences.channels,
          ...preferencesData.channels
        };
      }
      
      if (preferencesData.preferences) {
        preferences.preferences = {
          ...preferences.preferences,
          ...preferencesData.preferences
        };
      }
      
      await preferences.save();
      
      logger.info('User preferences updated', { userId });
      
      return preferences;
    } catch (error) {
      logger.error('Failed to update user preferences', { 
        userId, 
        error: (error as Error).message 
      });
      throw error;
    }
  }

  /**
   * Atualiza as preferências de um canal específico
   * @param userId - ID do usuário
   * @param channel - Canal (sms, email, whatsapp)
   * @param channelData - Dados do canal
   * @returns - Preferências atualizadas
   */
  async updateChannelPreference(
    userId: string, 
    channel: 'sms' | 'email' | 'whatsapp', 
    channelData: Partial<ChannelPreference>
  ): Promise<PreferenceDocument> {
    try {
      const preferences = await this.getOrCreatePreferences(userId);
      
      // Inicializar o canal se não existir
      if (!preferences.channels[channel]) {
        preferences.channels[channel] = {
          enabled: false,
          value: '',
          verified: false,
          priority: channel === 'sms' ? 2 : (channel === 'email' ? 1 : 0)
        };
      }
      
      // Atualizar dados do canal
      preferences.channels[channel] = {
        ...preferences.channels[channel],
        ...channelData
      } as ChannelPreference;
      
      await preferences.save();
      
      logger.info('User channel preference updated', { userId, channel });
      
      return preferences;
    } catch (error) {
      logger.error('Failed to update user channel preference', { 
        userId, 
        channel,
        error: (error as Error).message 
      });
      throw error;
    }
  }

  /**
   * Realiza opt-in ou opt-out para um canal específico
   * @param userId - ID do usuário
   * @param channel - Canal (sms, email, whatsapp)
   * @param action - Ação (opt-in ou opt-out)
   * @param value - Valor do canal (opcional)
   * @returns - Preferências atualizadas
   */
  async optInOut(
    userId: string, 
    channel: 'sms' | 'email' | 'whatsapp', 
    action: 'opt-in' | 'opt-out',
    value?: string
  ): Promise<PreferenceDocument> {
    try {
      const preferences = await this.getOrCreatePreferences(userId);
      
      // Inicializar o canal se não existir
      if (!preferences.channels[channel]) {
        preferences.channels[channel] = {
          enabled: false,
          value: '',
          verified: false,
          priority: channel === 'sms' ? 2 : (channel === 'email' ? 1 : 0)
        };
      }
      
      // Atualizar status de opt-in/opt-out
      preferences.channels[channel].enabled = action === 'opt-in';
      
      // Atualizar valor se fornecido
      if (value) {
        preferences.channels[channel].value = value;
        
        // Resetar verificação se o valor mudar
        preferences.channels[channel].verified = false;
      }
      
      await preferences.save();
      
      logger.info(`User ${action} for ${channel}`, { userId });
      
      return preferences;
    } catch (error) {
      logger.error(`Failed to ${action} user for ${channel}`, { 
        userId, 
        channel,
        error: (error as Error).message 
      });
      throw error;
    }
  }

  /**
   * Verifica um canal para um usuário
   * @param userId - ID do usuário
   * @param channel - Canal (sms, email, whatsapp)
   * @returns - Preferências atualizadas
   */
  async verifyChannel(userId: string, channel: 'sms' | 'email' | 'whatsapp'): Promise<PreferenceDocument> {
    try {
      const preferences = await this.getOrCreatePreferences(userId);
      
      if (!preferences.channels[channel] || !preferences.channels[channel].value) {
        throw new ValidationError(`User has no ${channel} value to verify`);
      }
      
      preferences.channels[channel].verified = true;
      await preferences.save();
      
      logger.info(`User ${channel} verified`, { userId });
      
      return preferences;
    } catch (error) {
      logger.error(`Failed to verify user ${channel}`, { 
        userId, 
        channel,
        error: (error as Error).message 
      });
      throw error;
    }
  }

  /**
   * Obtém o canal preferencial de um usuário
   * @param userId - ID do usuário
   * @returns - Canal preferencial e valor
   */
  async getPreferredChannel(userId: string): Promise<{ channel: string; value: string } | null> {
    try {
      const preferences = await this.getOrCreatePreferences(userId);
      
      // Obter canais habilitados e verificados
      const enabledChannels = Object.entries(preferences.channels)
        .filter(([_, data]) => data.enabled && data.verified && data.value)
        .map(([channel, data]) => ({
          channel,
          value: data.value,
          priority: data.priority
        }))
        .sort((a, b) => a.priority - b.priority);
      
      if (enabledChannels.length === 0) {
        return null;
      }
      
      return {
        channel: enabledChannels[0].channel,
        value: enabledChannels[0].value
      };
    } catch (error) {
      logger.error('Failed to get user preferred channel', { 
        userId, 
        error: (error as Error).message 
      });
      throw error;
    }
  }

  /**
   * Verifica se um usuário pode receber notificações em um determinado momento
   * @param userId - ID do usuário
   * @param category - Categoria da notificação
   * @returns - Se o usuário pode receber notificações
   */
  async canReceiveNotification(userId: string, category: 'marketing' | 'transactional' | 'alerts'): Promise<boolean> {
    try {
      const preferences = await this.getOrCreatePreferences(userId);
      
      // Verificar se a categoria está habilitada
      if (!preferences.preferences.categories[category]) {
        return false;
      }
      
      // Verificar horário permitido
      const now = new Date();
      const userTimezone = preferences.preferences.timezone || 'UTC';
      
      // Converter para o fuso horário do usuário
      const userTime = new Intl.DateTimeFormat('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: userTimezone
      }).format(now);
      
      const [hours, minutes] = userTime.split(':').map(Number);
      const currentTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      
      const startTime = preferences.preferences.allowedTimeStart;
      const endTime = preferences.preferences.allowedTimeEnd;
      
      // Verificar se está dentro do horário permitido
      const isWithinAllowedTime = this.isTimeInRange(currentTime, startTime, endTime);
      
      return isWithinAllowedTime;
    } catch (error) {
      logger.error('Failed to check if user can receive notification', { 
        userId, 
        category,
        error: (error as Error).message 
      });
      
      // Em caso de erro, permitir o envio para notificações transacionais e alertas
      return category === 'transactional' || category === 'alerts';
    }
  }

  /**
   * Verifica se um horário está dentro de um intervalo permitido
   * @param currentTime - Horário atual (formato HH:MM)
   * @param startTime - Horário de início (formato HH:MM)
   * @param endTime - Horário de fim (formato HH:MM)
   * @returns - Verdadeiro se estiver dentro do intervalo
   */
  private isTimeInRange(currentTime: string, startTime: string, endTime: string): boolean {
    const current = this.parseTimeToMinutes(currentTime);
    const start = this.parseTimeToMinutes(startTime);
    const end = this.parseTimeToMinutes(endTime);
    
    return current >= start && current <= end;
  }

  /**
   * Converte um horário no formato HH:MM para minutos
   * @param time - Horário no formato HH:MM
   * @returns - Total de minutos
   */
  private parseTimeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }
}

export default new PreferenceService();
