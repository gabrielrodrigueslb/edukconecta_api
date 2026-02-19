import { Router } from 'express';
import { apiKeyMiddleware } from '../../middlewares/apiKey.middleware.js';
import * as turmaController from '../controllers/turmaController.js';

const router = Router();

router.get('/', apiKeyMiddleware, turmaController.listTurmasController);
router.get('/:id', apiKeyMiddleware, turmaController.getTurmaByIdController);
router.post('/', apiKeyMiddleware, turmaController.createTurmaController);
router.put('/:id', apiKeyMiddleware, turmaController.updateTurmaController);
router.delete('/:id', apiKeyMiddleware, turmaController.deleteTurmaController);

export default router;
