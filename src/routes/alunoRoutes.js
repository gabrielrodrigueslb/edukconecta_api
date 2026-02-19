import { Router } from 'express';
import { apiKeyMiddleware } from '../../middlewares/apiKey.middleware.js';
import * as alunoController from '../controllers/alunoController.js';
import { processAvatar, uploadAvatar } from '../../middlewares/uploadAvatar.js';
import { uploadDocumento, processDocumento } from '../../middlewares/uploadDocumento.js';
import * as notaController from '../controllers/notaController.js';
import * as documentoController from '../controllers/documentoController.js';

const router = Router();

router.post('/', apiKeyMiddleware, alunoController.createAlunoController);
router.get('/', apiKeyMiddleware, alunoController.getAlunosController);
router.get('/:id', apiKeyMiddleware, alunoController.getAlunoByIdController);
router.put('/:id', apiKeyMiddleware, alunoController.updateAlunoController);
router.get('/:id/notas', apiKeyMiddleware, notaController.listNotasController);
router.post('/:id/notas', apiKeyMiddleware, notaController.createNotaController);
router.get('/:id/documentos', apiKeyMiddleware, documentoController.listDocumentosController);
router.post(
  '/:id/documentos',
  apiKeyMiddleware,
  uploadDocumento,
  processDocumento,
  documentoController.createDocumentoController
);
router.delete(
  '/:id/documentos/:documentoId',
  apiKeyMiddleware,
  documentoController.deleteDocumentoController
);
router.put(
  '/:id/foto',
  apiKeyMiddleware,
  uploadAvatar,
  processAvatar,
  alunoController.updateAlunoFotoController
);
router.delete('/:id', apiKeyMiddleware, alunoController.deleteAlunoController);

export default router;
