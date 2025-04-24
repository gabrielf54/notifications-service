// src/utils/error-handler.ts
import logger from './logger';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400, true);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string) {
    super(message, 404, true);
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string) {
    super(message, 401, true);
  }
}

export class ProviderError extends AppError {
  constructor(message: string, isOperational: boolean = true) {
    super(message, 500, isOperational);
  }
}

export function handleError(error: Error): void {
  if (error instanceof AppError && error.isOperational) {
    // Erros operacionais são esperados e podem ser tratados
    logger.warn(`Operational error: ${error.message}`, { 
      statusCode: (error as AppError).statusCode,
      stack: error.stack 
    });
  } else {
    // Erros não operacionais são bugs que precisam ser corrigidos
    logger.error(`Unhandled error: ${error.message}`, { 
      stack: error.stack 
    });
    
    // Em produção, poderia notificar administradores ou reiniciar o processo
    // process.exit(1);
  }
}
