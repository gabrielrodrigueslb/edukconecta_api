import { Router } from 'express';
import { apiKeyMiddleware } from '../../middlewares/apiKey.middleware.js';
import * as presencaController from '../controllers/presencaController.js';

const router = Router();

router.get('/', apiKeyMiddleware, presencaController.listByDateTurnoController);
router.get('/history', apiKeyMiddleware, presencaController.listHistoryController);
router.get('/aluno/:alunoId', apiKeyMiddleware, presencaController.listByAlunoController);
router.post('/chamada', apiKeyMiddleware, presencaController.replaceChamadaController);

export default router;
