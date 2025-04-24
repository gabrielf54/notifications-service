// src/services/template.service.ts
import { TemplateModel, TemplateDocument } from '../models/template.model';
import { NotFoundError, ValidationError } from '../utils/error-handler';
import logger from '../utils/logger';

class TemplateService {
  /**
   * Cria um novo template
   * @param templateData - Dados do template
   * @returns - Template criado
   */
  async create(templateData: Partial<TemplateDocument>): Promise<TemplateDocument> {
    try {
      // Verificar se já existe um template com o mesmo nome
      const existingTemplate = await TemplateModel.findOne({ name: templateData.name });
      if (existingTemplate) {
        throw new ValidationError(`Template with name ${templateData.name} already exists`);
      }
      
      const template = new TemplateModel(templateData);
      await template.save();
      
      logger.info('Template created', { templateId: template._id, name: template.name });
      
      return template;
    } catch (error) {
      logger.error('Failed to create template', { error: (error as Error).message });
      throw error;
    }
  }

  /**
   * Atualiza um template existente
   * @param id - ID do template
   * @param templateData - Dados atualizados do template
   * @returns - Template atualizado
   */
  async update(id: string, templateData: Partial<TemplateDocument>): Promise<TemplateDocument> {
    try {
      const template = await TemplateModel.findById(id);
      
      if (!template) {
        throw new NotFoundError(`Template not found: ${id}`);
      }
      
      // Se o nome estiver sendo alterado, verificar se já existe outro template com o novo nome
      if (templateData.name && templateData.name !== template.name) {
        const existingTemplate = await TemplateModel.findOne({ name: templateData.name });
        if (existingTemplate) {
          throw new ValidationError(`Template with name ${templateData.name} already exists`);
        }
      }
      
      // Atualizar campos
      Object.assign(template, templateData);
      await template.save();
      
      logger.info('Template updated', { templateId: template._id, name: template.name });
      
      return template;
    } catch (error) {
      logger.error('Failed to update template', { id, error: (error as Error).message });
      throw error;
    }
  }

  /**
   * Obtém um template por ID
   * @param id - ID do template
   * @returns - Template encontrado
   */
  async getById(id: string): Promise<TemplateDocument> {
    try {
      const template = await TemplateModel.findById(id);
      
      if (!template) {
        throw new NotFoundError(`Template not found: ${id}`);
      }
      
      return template;
    } catch (error) {
      logger.error('Failed to get template', { id, error: (error as Error).message });
      throw error;
    }
  }

  /**
   * Obtém um template por nome
   * @param name - Nome do template
   * @returns - Template encontrado
   */
  async getByName(name: string): Promise<TemplateDocument> {
    try {
      const template = await TemplateModel.findOne({ name });
      
      if (!template) {
        throw new NotFoundError(`Template not found: ${name}`);
      }
      
      return template;
    } catch (error) {
      logger.error('Failed to get template by name', { name, error: (error as Error).message });
      throw error;
    }
  }

  /**
   * Lista templates com filtros
   * @param filters - Filtros a aplicar
   * @param pagination - Opções de paginação
   * @returns - Resultado paginado
   */
  async list(
    filters: { category?: string; channel?: string; search?: string } = {}, 
    pagination: { page?: number; limit?: number } = {}
  ): Promise<{ data: TemplateDocument[]; pagination: { total: number; page: number; limit: number; pages: number } }> {
    try {
      const query: any = {};
      
      if (filters.category) {
        query.category = filters.category;
      }
      
      if (filters.channel) {
        query['versions.channel'] = filters.channel;
      }
      
      if (filters.search) {
        query.$or = [
          { name: { $regex: filters.search, $options: 'i' } },
          { displayName: { $regex: filters.search, $options: 'i' } },
          { description: { $regex: filters.search, $options: 'i' } }
        ];
      }
      
      const total = await TemplateModel.countDocuments(query);
      const page = pagination.page || 1;
      const limit = pagination.limit || 20;
      const skip = (page - 1) * limit;
      
      const templates = await TemplateModel.find(query)
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit);
      
      return {
        data: templates,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.error('Failed to list templates', { error: (error as Error).message });
      throw error;
    }
  }

  /**
   * Renderiza um template com os parâmetros fornecidos
   * @param templateId - ID ou nome do template
   * @param channel - Canal para o qual renderizar o template
   * @param parameters - Parâmetros para substituição
   * @returns - Conteúdo renderizado
   */
  async renderTemplate(
    templateId: string, 
    channel: string, 
    parameters: Record<string, any>
  ): Promise<any> {
    try {
      // Buscar o template por ID ou nome
      let template: TemplateDocument | null;
      
      if (mongoose.Types.ObjectId.isValid(templateId)) {
        template = await TemplateModel.findById(templateId);
      } else {
        template = await TemplateModel.findOne({ name: templateId });
      }
      
      if (!template) {
        throw new NotFoundError(`Template not found: ${templateId}`);
      }
      
      // Encontrar a versão ativa para o canal especificado
      const version = template.versions.find(v => v.channel === channel && v.active);
      
      if (!version) {
        throw new NotFoundError(`No active version found for channel ${channel} in template ${template.name}`);
      }
      
      // Verificar se todos os parâmetros necessários foram fornecidos
      const missingParams = version.parameters.filter(param => !parameters[param]);
      if (missingParams.length > 0) {
        throw new ValidationError(`Missing required parameters: ${missingParams.join(', ')}`);
      }
      
      // Renderizar o template substituindo os parâmetros
      let content = version.content;
      for (const [key, value] of Object.entries(parameters)) {
        const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
        content = content.replace(regex, value);
      }
      
      // Preparar o resultado com base no canal
      if (channel === 'email') {
        let subject = version.subject || '';
        
        // Substituir parâmetros no assunto também
        for (const [key, value] of Object.entries(parameters)) {
          const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
          subject = subject.replace(regex, value);
        }
        
        return {
          subject,
          text: content,
          html: content // Assumindo que o conteúdo já está em HTML para e-mail
        };
      } else {
        return {
          text: content
        };
      }
    } catch (error) {
      logger.error('Failed to render template', { 
        templateId, 
        channel, 
        error: (error as Error).message 
      });
      throw error;
    }
  }

  /**
   * Remove um template
   * @param id - ID do template
   * @returns - Sucesso da operação
   */
  async delete(id: string): Promise<boolean> {
    try {
      const result = await TemplateModel.deleteOne({ _id: id });
      
      if (result.deletedCount === 0) {
        throw new NotFoundError(`Template not found: ${id}`);
      }
      
      logger.info('Template deleted', { templateId: id });
      
      return true;
    } catch (error) {
      logger.error('Failed to delete template', { id, error: (error as Error).message });
      throw error;
    }
  }
}

// Importação necessária para validação de ObjectId
import mongoose from 'mongoose';

export default new TemplateService();
