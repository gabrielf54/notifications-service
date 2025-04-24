// src/routes/preference.routes.ts
import { Router } from 'express';
import PreferenceController from '../controllers/preference.controller';

const router = Router();

/**
 * @route GET /api/preferences/:userId
 * @desc Obtém preferências de um usuário
 * @access Public
 */
router.get('/:userId', PreferenceController.getPreferences);

/**
 * @route PUT /api/preferences/:userId
 * @desc Atualiza preferências de um usuário
 * @access Public
 */
router.put('/:userId', PreferenceController.updatePreferences);

/**
 * @route POST /api/preferences/:userId/opt
 * @desc Realiza opt-in ou opt-out para um canal específico
 * @access Public
 */
router.post('/:userId/opt', PreferenceController.optInOut);

/**
 * @route POST /api/preferences/:userId/verify
 * @desc Verifica um canal para um usuário
 * @access Public
 */
router.post('/:userId/verify', PreferenceController.verifyChannel);

export default router;
