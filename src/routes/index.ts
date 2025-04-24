// src/routes/index.ts
import { Router } from 'express';
import notificationRoutes from './notification.routes';
import templateRoutes from './template.routes';
import preferenceRoutes from './preference.routes';
import healthRoutes from './health.routes';

const router = Router();

// Definir rotas principais
router.use('/notifications', notificationRoutes);
router.use('/templates', templateRoutes);
router.use('/preferences', preferenceRoutes);
router.use('/health', healthRoutes);

export default router;
