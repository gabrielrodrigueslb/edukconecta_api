import { Router } from 'express';
import { apiKeyMiddleware } from '../../middlewares/apiKey.middleware.js';
import * as eventoController from '../controllers/eventoController.js';

const router = Router();

router.get('/', apiKeyMiddleware, eventoController.listEventosController);
router.post('/', apiKeyMiddleware, eventoController.createEventoController);
router.put('/:id', apiKeyMiddleware, eventoController.updateEventoController);
router.delete('/:id', apiKeyMiddleware, eventoController.deleteEventoController);

export default router;
