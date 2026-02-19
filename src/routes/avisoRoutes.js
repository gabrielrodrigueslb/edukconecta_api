import { Router } from 'express';
import { apiKeyMiddleware } from '../../middlewares/apiKey.middleware.js';
import * as avisoController from '../controllers/avisoController.js';

const router = Router();

router.get('/', apiKeyMiddleware, avisoController.listAvisosController);
router.post('/', apiKeyMiddleware, avisoController.createAvisoController);
router.put('/:id', apiKeyMiddleware, avisoController.updateAvisoController);
router.delete('/:id', apiKeyMiddleware, avisoController.deleteAvisoController);

export default router;
