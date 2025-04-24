// src/controllers/health.controller.ts
import { Request, Response } from 'express';
import ProviderFactory from '../services/provider-factory.service';
import logger from '../utils/logger';

class HealthController {
  /**
   * Verifica a saúde do serviço
   * @param req - Requisição Express
   * @param res - Resposta Express
   */
  async check(req: Request, res: Response): Promise<void> {
    try {
      // Verificar componentes básicos
      const health = {
        service: {
          status: 'up',
          timestamp: new Date().toISOString(),
          version: process.env.npm_package_version || '1.0.0',
          environment: process.env.NODE_ENV || 'development'
        },
        database: {
          status: 'up',
          connections: 1 // Simplificado, em um cenário real verificaria a conexão com o banco
        },
        providers: await ProviderFactory.checkHealth()
      };
      
      res.status(200).json(health);
    } catch (error) {
      logger.error('Error in health check controller', { error: (error as Error).message });
      
      res.status(500).json({
        service: {
          status: 'down',
          timestamp: new Date().toISOString(),
          error: (error as Error).message
        }
      });
    }
  }
}

export default new HealthController();
