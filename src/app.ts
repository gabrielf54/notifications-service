// src/app.ts
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import mongoose from 'mongoose';
import { createClient } from '@supabase/supabase-js';
import routes from './routes';
import config from './config';
import logger from './utils/logger';

// Inicializar aplicação Express
const app = express();

// Conectar ao Supabase
const supabase = createClient(
  config.supabase.url,
  config.supabase.key
);

// Conectar ao MongoDB (para compatibilidade com modelos existentes)
mongoose.connect('mongodb://localhost:27017/notification-service')
  .then(() => {
    logger.info('MongoDB connected');
  })
  .catch((err) => {
    logger.error('MongoDB connection error', { error: err.message });
  });

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));

// Rotas da API
app.use(`/api/${config.server.apiVersion}`, routes);

// Rota raiz
app.get('/', (req: Request, res: Response) => {
  res.json({
    service: 'Notification Service',
    version: config.server.apiVersion,
    status: 'running'
  });
});

// Middleware de tratamento de erros
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error('Unhandled error', { error: err.message, stack: err.stack });
  
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Iniciar servidor
const PORT = config.server.port;
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

export default app;
