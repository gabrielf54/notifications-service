// src/controllers/preference.controller.ts
import { Request, Response } from 'express';
import PreferenceService from '../services/preference.service';
import logger from '../utils/logger';

class PreferenceController {
  /**
   * Obtém preferências de um usuário
   * @param req - Requisição Express
   * @param res - Resposta Express
   */
  async getPreferences(req: Request, res: Response): Promise<void> {
    try {
      const preferences = await PreferenceService.getOrCreatePreferences(req.params.userId);
      
      res.status(200).json(preferences);
    } catch (error) {
      logger.error('Error in get preferences controller', { 
        userId: req.params.userId,
        error: (error as Error).message 
      });
      
      res.status(400).json({
        success: false,
        error: (error as Error).message
      });
    }
  }

  /**
   * Atualiza preferências de um usuário
   * @param req - Requisição Express
   * @param res - Resposta Express
   */
  async updatePreferences(req: Request, res: Response): Promise<void> {
    try {
      const preferences = await PreferenceService.updatePreferences(req.params.userId, req.body);
      
      res.status(200).json(preferences);
    } catch (error) {
      logger.error('Error in update preferences controller', { 
        userId: req.params.userId,
        error: (error as Error).message 
      });
      
      res.status(400).json({
        success: false,
        error: (error as Error).message
      });
    }
  }

  /**
   * Realiza opt-in ou opt-out para um canal específico
   * @param req - Requisição Express
   * @param res - Resposta Express
   */
  async optInOut(req: Request, res: Response): Promise<void> {
    try {
      const { channel, action, value } = req.body;
      
      if (!channel || !action || !['opt-in', 'opt-out'].includes(action)) {
        res.status(400).json({
          success: false,
          error: 'Invalid request. Required: channel and action (opt-in or opt-out)'
        });
        return;
      }
      
      const preferences = await PreferenceService.optInOut(
        req.params.userId,
        channel,
        action,
        value
      );
      
      res.status(200).json({
        success: true,
        message: `User ${action} for ${channel} successful`,
        preferences
      });
    } catch (error) {
      logger.error('Error in opt-in/out controller', { 
        userId: req.params.userId,
        body: req.body,
        error: (error as Error).message 
      });
      
      res.status(400).json({
        success: false,
        error: (error as Error).message
      });
    }
  }

  /**
   * Verifica um canal para um usuário
   * @param req - Requisição Express
   * @param res - Resposta Express
   */
  async verifyChannel(req: Request, res: Response): Promise<void> {
    try {
      const { channel } = req.body;
      
      if (!channel) {
        res.status(400).json({
          success: false,
          error: 'Channel is required'
        });
        return;
      }
      
      const preferences = await PreferenceService.verifyChannel(
        req.params.userId,
        channel
      );
      
      res.status(200).json({
        success: true,
        message: `User ${channel} verified successfully`,
        preferences
      });
    } catch (error) {
      logger.error('Error in verify channel controller', { 
        userId: req.params.userId,
        body: req.body,
        error: (error as Error).message 
      });
      
      res.status(400).json({
        success: false,
        error: (error as Error).message
      });
    }
  }
}

export default new PreferenceController();
