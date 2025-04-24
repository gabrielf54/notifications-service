// src/controllers/notification.controller.ts
import { Request, Response } from 'express';
import NotificationService from '../services/notification.service';
import logger from '../utils/logger';

class NotificationController {
  /**
   * Envia uma nova notificação
   * @param req - Requisição Express
   * @param res - Resposta Express
   */
  async send(req: Request, res: Response): Promise<void> {
    try {
      const result = await NotificationService.send(req.body);
      
      res.status(202).json(result);
    } catch (error) {
      logger.error('Error in send notification controller', { error: (error as Error).message });
      
      res.status(400).json({
        success: false,
        error: (error as Error).message
      });
    }
  }

  /**
   * Obtém detalhes de uma notificação
   * @param req - Requisição Express
   * @param res - Resposta Express
   */
  async getById(req: Request, res: Response): Promise<void> {
    try {
      const notification = await NotificationService.getById(req.params.id);
      
      res.status(200).json(notification);
    } catch (error) {
      logger.error('Error in get notification controller', { 
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
   * Cancela uma notificação agendada
   * @param req - Requisição Express
   * @param res - Resposta Express
   */
  async cancel(req: Request, res: Response): Promise<void> {
    try {
      const result = await NotificationService.cancel(req.params.id);
      
      res.status(200).json({
        success: true,
        message: 'Notification cancelled successfully'
      });
    } catch (error) {
      logger.error('Error in cancel notification controller', { 
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
   * Lista notificações com filtros
   * @param req - Requisição Express
   * @param res - Resposta Express
   */
  async list(req: Request, res: Response): Promise<void> {
    try {
      const filters = {
        status: req.query.status as string,
        channel: req.query.channel as string,
        recipient: req.query.recipient as string,
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string
      };
      
      const pagination = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20
      };
      
      const result = await NotificationService.list(filters, pagination);
      
      res.status(200).json(result);
    } catch (error) {
      logger.error('Error in list notifications controller', { error: (error as Error).message });
      
      res.status(400).json({
        success: false,
        error: (error as Error).message
      });
    }
  }
}

export default new NotificationController();
