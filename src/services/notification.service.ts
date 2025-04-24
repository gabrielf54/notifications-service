// src/services/notification.service.ts
import mongoose from 'mongoose';
import { NotificationModel, NotificationDocument, Recipient, NotificationContent, NotificationOptions } from '../models/notification.model';
import TemplateService from './template.service';
import PreferenceService from './preference.service';
import ProviderFactory from './provider-factory.service';
import logger from '../utils/logger';
import { formatPhoneNumber, formatEmail } from '../utils/formatter';
import { NotFoundError, ValidationError, ProviderError } from '../utils/error-handler';

class NotificationService {
  private templateService: typeof TemplateService;
  private providerFactory: typeof ProviderFactory;
  private preferenceService: typeof PreferenceService;

  constructor() {
    this.templateService = TemplateService;
    this.providerFactory = ProviderFactory;
    this.preferenceService = PreferenceService;
  }

  /**
   * Envia uma notificação
   * @param notificationData - Dados da notificação
   * @returns - Notificação criada
   */
  async send(notificationData: any): Promise<any> {
    try {
      // Validar e preparar dados
      const preparedData = await this.prepareNotificationData(notificationData);
      
      // Criar registro da notificação
      const notification = new NotificationModel({
        ...preparedData,
        status: preparedData.options.scheduledFor ? 'scheduled' : 'queued',
        statusHistory: [{
          status: preparedData.options.scheduledFor ? 'scheduled' : 'queued',
          timestamp: new Date(),
          details: preparedData.options.scheduledFor ? 
            `Scheduled for ${preparedData.options.scheduledFor}` : 
            'Queued for processing'
        }]
      });
      
      await notification.save();
      
      // Se for agendada, retornar e não enviar agora
      if (preparedData.options.scheduledFor) {
        logger.info('Notification scheduled', { 
          id: notification._id,
          scheduledFor: preparedData.options.scheduledFor
        });
        
        return {
          success: true,
          notificationId: notification._id,
          status: 'scheduled',
          scheduledFor: preparedData.options.scheduledFor
        };
      }
      
      // Processar envio imediato
      const result = await this.processNotification(notification);
      
      return result;
    } catch (error) {
      logger.error('Failed to send notification', { error: (error as Error).message });
      throw error;
    }
  }

  /**
   * Prepara os dados da notificação
   * @param data - Dados brutos da notificação
   * @returns - Dados preparados
   */
  async prepareNotificationData(data: any): Promise<any> {
    // Validar canal
    if (!['sms', 'email', 'whatsapp'].includes(data.channel)) {
      throw new ValidationError(`Invalid channel: ${data.channel}`);
    }
    
    // Formatar destinatário
    let formattedRecipient = data.recipient.value;
    if (data.recipient.type === 'phone') {
      formattedRecipient = formatPhoneNumber(data.recipient.value);
    } else if (data.recipient.type === 'email') {
      formattedRecipient = formatEmail(data.recipient.value);
    }
    
    // Processar template se especificado
    let content = { ...data.content };
    if (data.content.templateId) {
      content = await this.templateService.renderTemplate(
        data.content.templateId,
        data.channel,
        data.content.parameters || {}
      );
    }
    
    // Obter provedor configurado
    const provider = data.provider || null; // Usa o padrão se não especificado
    
    return {
      recipient: {
        type: data.recipient.type,
        value: formattedRecipient
      },
      channel: data.channel,
      provider: provider,
      content: content,
      metadata: data.options?.metadata || {},
      options: {
        scheduledFor: data.options?.scheduledFor || null,
        expiresAt: data.options?.expiresAt || null,
        fallbackChannels: data.options?.fallbackChannels || [],
        priority: data.options?.priority || 'normal',
        retryCount: 0,
        maxRetries: 5
      }
    };
  }

  /**
   * Processa o envio de uma notificação
   * @param notification - Documento da notificação
   * @returns - Resultado do envio
   */
  async processNotification(notification: NotificationDocument): Promise<any> {
    try {
      // Obter o provedor apropriado
      const provider = this.providerFactory.getProvider(
        notification.channel as 'sms' | 'email' | 'whatsapp',
        notification.provider
      );
      
      // Atualizar status para 'processing'
      notification.status = 'processing';
      notification.statusHistory.push({
        status: 'processing',
        timestamp: new Date(),
        details: `Processing with provider: ${provider.constructor.name}`
      });
      await notification.save();
      
      // Preparar dados específicos do canal
      let result;
      switch (notification.channel) {
        case 'sms':
          result = await this.sendSMS(provider, notification);
          break;
        case 'email':
          result = await this.sendEmail(provider, notification);
          break;
        case 'whatsapp':
          result = await this.sendWhatsApp(provider, notification);
          break;
        default:
          throw new ValidationError(`Unsupported channel: ${notification.channel}`);
      }
      
      // Atualizar notificação com resultado
      notification.status = 'sent';
      notification.statusHistory.push({
        status: 'sent',
        timestamp: new Date(),
        details: `Sent via ${result.provider}`
      });
      notification.providerResponse = {
        messageId: result.messageId,
        providerTimestamp: result.timestamp,
        rawResponse: result.details.providerResponse
      };
      
      await notification.save();
      
      return {
        success: true,
        notificationId: notification._id,
        channel: notification.channel,
        provider: result.provider,
        status: 'sent',
        recipient: notification.recipient.value,
        timestamp: new Date().toISOString(),
        messageId: result.messageId,
        details: {
          providerResponse: result.details.providerResponse
        },
        tracking: {
          statusUrl: `/api/notifications/${notification._id}/status`,
          webhookDelivered: true
        }
      };
    } catch (error) {
      // Registrar falha
      notification.status = 'failed';
      notification.statusHistory.push({
        status: 'failed',
        timestamp: new Date(),
        details: `Failed: ${(error as Error).message}`
      });
      
      await notification.save();
      
      // Verificar se deve tentar fallback
      if (notification.options.fallbackChannels && 
          notification.options.fallbackChannels.length > 0) {
        return this.processFallback(notification);
      }
      
      logger.error('Notification failed', { 
        id: notification._id,
        error: (error as Error).message
      });
      
      throw error;
    }
  }

  /**
   * Envia SMS usando o provedor especificado
   * @param provider - Provedor SMS
   * @param notification - Documento da notificação
   * @returns - Resultado do envio
   */
  async sendSMS(provider: any, notification: NotificationDocument): Promise<any> {
    return provider.send(
      notification.recipient.value,
      notification.content.text || '',
      {
        priority: notification.options.priority
      }
    );
  }

  /**
   * Envia e-mail usando o provedor especificado
   * @param provider - Provedor de e-mail
   * @param notification - Documento da notificação
   * @returns - Resultado do envio
   */
  async sendEmail(provider: any, notification: NotificationDocument): Promise<any> {
    return provider.send(
      notification.recipient.value,
      {
        subject: notification.content.subject || '',
        text: notification.content.text || '',
        html: notification.content.html || notification.content.text || '',
        attachments: notification.content.attachments || []
      },
      {
        priority: notification.options.priority
      }
    );
  }

  /**
   * Envia mensagem WhatsApp usando o provedor especificado
   * @param provider - Provedor de WhatsApp
   * @param notification - Documento da notificação
   * @returns - Resultado do envio
   */
  async sendWhatsApp(provider: any, notification: NotificationDocument): Promise<any> {
    return provider.send(
      notification.recipient.value,
      notification.content.text || '',
      {
        templateName: notification.content.templateId,
        templateParams: notification.content.parameters,
        priority: notification.options.priority
      }
    );
  }

  /**
   * Processa fallback para outro canal
   * @param notification - Documento da notificação
   * @returns - Resultado do envio via fallback
   */
  async processFallback(notification: NotificationDocument): Promise<any> {
    const fallbackChannel = notification.options.fallbackChannels![0];
    const remainingFallbacks = notification.options.fallbackChannels!.slice(1);
    
    logger.info('Attempting fallback', { 
      id: notification._id,
      originalChannel: notification.channel,
      fallbackChannel: fallbackChannel
    });
    
    // Criar nova notificação para o canal de fallback
    const fallbackNotification = new NotificationModel({
      recipient: notification.recipient,
      channel: fallbackChannel,
      provider: null, // Usar o padrão para o novo canal
      content: notification.content,
      metadata: {
        ...notification.metadata,
        originalNotificationId: notification._id,
        isFallback: true
      },
      options: {
        ...notification.options,
        fallbackChannels: remainingFallbacks
      },
      status: 'queued',
      statusHistory: [{
        status: 'queued',
        timestamp: new Date(),
        details: `Fallback from ${notification.channel} notification ${notification._id}`
      }]
    });
    
    await fallbackNotification.save();
    
    // Atualizar notificação original
    notification.metadata = {
      ...notification.metadata,
      fallbackNotificationId: fallbackNotification._id
    };
    await notification.save();
    
    // Processar a notificação de fallback
    return this.processNotification(fallbackNotification);
  }

  /**
   * Obtém uma notificação por ID
   * @param id - ID da notificação
   * @returns - Documento da notificação
   */
  async getById(id: string): Promise<NotificationDocument> {
    try {
      const notification = await NotificationModel.findById(id);
      
      if (!notification) {
        throw new NotFoundError(`Notification not found: ${id}`);
      }
      
      return notification;
    } catch (error) {
      logger.error('Failed to get notification', { id, error: (error as Error).message });
      throw error;
    }
  }

  /**
   * Atualiza o status de uma notificação
   * @param id - ID da notificação
   * @param status - Novo status
   * @param details - Detalhes adicionais
   * @returns - Notificação atualizada
   */
  async updateStatus(id: string, status: string, details: any = {}): Promise<NotificationDocument> {
    try {
      const notification = await NotificationModel.findById(id);
      
      if (!notification) {
        throw new NotFoundError(`Notification not found: ${id}`);
      }
      
      notification.status = status;
      notification.statusHistory.push({
        status: status,
        timestamp: new Date(),
        details: details.message || `Status updated to ${status}`
      });
      
      if (details.providerResponse) {
        notification.providerResponse = {
          ...notification.providerResponse,
          ...details.providerResponse
        };
      }
      
      await notification.save();
      
      return notification;
    } catch (error) {
      logger.error('Failed to update notification status', { 
        id, 
        status, 
        error: (error as Error).message 
      });
      throw error;
    }
  }

  /**
   * Cancela uma notificação agendada
   * @param id - ID da notificação
   * @returns - Sucesso da operação
   */
  async cancel(id: string): Promise<boolean> {
    try {
      const notification = await NotificationModel.findById(id);
      
      if (!notification) {
        throw new NotFoundError(`Notification not found: ${id}`);
      }
      
      if (notification.status !== 'scheduled') {
        throw new ValidationError(`Cannot cancel notification with status: ${notification.status}`);
      }
      
      notification.status = 'cancelled';
      notification.statusHistory.push({
        status: 'cancelled',
        timestamp: new Date(),
        details: 'Cancelled by user request'
      });
      
      await notification.save();
      
      return true;
    } catch (error) {
      logger.error('Failed to cancel notification', { id, error: (error as Error).message });
      throw error;
    }
  }

  /**
   * Lista notificações com filtros
   * @param filters - Filtros a aplicar
   * @param pagination - Opções de paginação
   * @returns - Resultado paginado
   */
  async list(
    filters: { status?: string; channel?: string; recipient?: string; startDate?: string; endDate?: string } = {}, 
    pagination: { page?: number; limit?: number } = {}
  ): Promise<{ data: NotificationDocument[]; pagination: { total: number; page: number; limit: number; pages: number } }> {
    try {
      const query: any = {};
      
      if (filters.status) {
        query.status = filters.status;
      }
      
      if (filters.channel) {
        query.channel = filters.channel;
      }
      
      if (filters.recipient) {
        query['recipient.value'] = filters.recipient;
      }
      
      if (filters.startDate || filters.endDate) {
        query.createdAt = {};
        
        if (filters.startDate) {
          query.createdAt.$gte = new Date(filters.startDate);
        }
        
        if (filters.endDate) {
          query.createdAt.$lte = new Date(filters.endDate);
        }
      }
      
      const total = await NotificationModel.countDocuments(query);
      const page = pagination.page || 1;
      const limit = pagination.limit || 20;
      const skip = (page - 1) * limit;
      
      const notifications = await NotificationModel.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
      
      return {
        data: notifications,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.error('Failed to list notifications', { error: (error as Error).message });
      throw error;
    }
  }
}

export default new NotificationService();
