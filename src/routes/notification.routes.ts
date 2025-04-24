// src/routes/notification.routes.ts
import { Router } from 'express';
import NotificationController from '../controllers/notification.controller';

const router = Router();

/**
 * @route POST /api/notifications
 * @desc Envia uma nova notificação
 * @access Public
 */
router.post('/', NotificationController.send);

/**
 * @route GET /api/notifications/:id
 * @desc Obtém detalhes de uma notificação
 * @access Public
 */
router.get('/:id', NotificationController.getById);

/**
 * @route DELETE /api/notifications/:id
 * @desc Cancela uma notificação agendada
 * @access Public
 */
router.delete('/:id', NotificationController.cancel);

/**
 * @route GET /api/notifications
 * @desc Lista notificações com filtros
 * @access Public
 */
router.get('/', NotificationController.list);

export default router;
