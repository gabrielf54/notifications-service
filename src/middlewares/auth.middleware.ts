// src/middlewares/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config';
import { AuthorizationError } from '../utils/error-handler';
import logger from '../utils/logger';

/**
 * Middleware para autenticação JWT
 * @param req - Requisição Express
 * @param res - Resposta Express
 * @param next - Função next
 */
export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      throw new AuthorizationError('Authorization header is required');
    }
    
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      throw new AuthorizationError('Bearer token is required');
    }
    
    const decoded = jwt.verify(token, config.jwt.secret);
    
    // Adicionar usuário decodificado à requisição
    (req as any).user = decoded;
    
    next();
  } catch (error) {
    logger.warn('Authentication failed', { error: (error as Error).message });
    
    res.status(401).json({
      success: false,
      error: 'Authentication failed',
      message: (error as Error).message
    });
  }
};

/**
 * Middleware para verificação de permissões
 * @param requiredPermissions - Permissões necessárias
 * @returns Middleware Express
 */
export const authorize = (requiredPermissions: string[]): (req: Request, res: Response, next: NextFunction) => void => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const user = (req as any).user;
      
      if (!user) {
        throw new AuthorizationError('User not authenticated');
      }
      
      const userPermissions = user.permissions || [];
      
      const hasPermission = requiredPermissions.every(permission => 
        userPermissions.includes(permission)
      );
      
      if (!hasPermission) {
        throw new AuthorizationError('Insufficient permissions');
      }
      
      next();
    } catch (error) {
      logger.warn('Authorization failed', { error: (error as Error).message });
      
      res.status(403).json({
        success: false,
        error: 'Authorization failed',
        message: (error as Error).message
      });
    }
  };
};
