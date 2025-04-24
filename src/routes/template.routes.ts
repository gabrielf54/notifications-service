// src/routes/template.routes.ts
import { Router } from 'express';
import TemplateController from '../controllers/template.controller';

const router = Router();

/**
 * @route POST /api/templates
 * @desc Cria um novo template
 * @access Public
 */
router.post('/', TemplateController.create);

/**
 * @route PUT /api/templates/:id
 * @desc Atualiza um template existente
 * @access Public
 */
router.put('/:id', TemplateController.update);

/**
 * @route GET /api/templates/:id
 * @desc Obtém um template por ID
 * @access Public
 */
router.get('/:id', TemplateController.getById);

/**
 * @route GET /api/templates
 * @desc Lista templates com filtros
 * @access Public
 */
router.get('/', TemplateController.list);

/**
 * @route DELETE /api/templates/:id
 * @desc Remove um template
 * @access Public
 */
router.delete('/:id', TemplateController.delete);

export default router;
