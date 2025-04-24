// src/routes/health.routes.ts
import { Router } from 'express';
import HealthController from '../controllers/health.controller';

const router = Router();

/**
 * @route GET /api/health
 * @desc Verifica a saúde do serviço
 * @access Public
 */
router.get('/', HealthController.check);

export default router;
