// src/controllers/template.controller.ts
import { Request, Response } from 'express';
import TemplateService from '../services/template.service';
import logger from '../utils/logger';

class TemplateController {
  /**
   * Cria um novo template
   * @param req - Requisição Express
   * @param res - Resposta Express
   */
  async create(req: Request, res: Response): Promise<void> {
    try {
      const template = await TemplateService.create(req.body);
      
      res.status(201).json(template);
    } catch (error) {
      logger.error('Error in create template controller', { error: (error as Error).message });
      
      res.status(400).json({
        success: false,
        error: (error as Error).message
      });
    }
  }

  /**
   * Atualiza um template existente
   * @param req - Requisição Express
   * @param res - Resposta Express
   */
  async update(req: Request, res: Response): Promise<void> {
    try {
      const template = await TemplateService.update(req.params.id, req.body);
      
      res.status(200).json(template);
    } catch (error) {
      logger.error('Error in update template controller', { 
        id: req.params.id,
        error: (error as Error).message 
      });
      
      res.status(400).json({
        success: false,
        error: (error as Error).message
      });
    }
  }

  /**
   * Obtém um template por ID
   * @param req - Requisição Express
   * @param res - Resposta Express
   */
  async getById(req: Request, res: Response): Promise<void> {
    try {
      const template = await TemplateService.getById(req.params.id);
      
      res.status(200).json(template);
    } catch (error) {
      logger.error('Error in get template controller', { 
        id: req.params.id,
        error: (error as Error).message 
      });
      
      res.status(404).json({
        success: false,
        error: (error as Error).message
      });
    }
  }

  /**
   * Lista templates com filtros
   * @param req - Requisição Express
   * @param res - Resposta Express
   */
  async list(req: Request, res: Response): Promise<void> {
    try {
      const filters = {
        category: req.query.category as string,
        channel: req.query.channel as string,
        search: req.query.search as string
      };
      
      const pagination = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20
      };
      
      const result = await TemplateService.list(filters, pagination);
      
      res.status(200).json(result);
    } catch (error) {
      logger.error('Error in list templates controller', { error: (error as Error).message });
      
      res.status(400).json({
        success: false,
        error: (error as Error).message
      });
    }
  }

  /**
   * Remove um template
   * @param req - Requisição Express
   * @param res - Resposta Express
   */
  async delete(req: Request, res: Response): Promise<void> {
    try {
      await TemplateService.delete(req.params.id);
      
      res.status(200).json({
        success: true,
        message: 'Template deleted successfully'
      });
    } catch (error) {
      logger.error('Error in delete template controller', { 
        id: req.params.id,
        error: (error as Error).message 
      });
      
      res.status(400).json({
        success: false,
        error: (error as Error).message
      });
    }
  }
}

export default new TemplateController();
