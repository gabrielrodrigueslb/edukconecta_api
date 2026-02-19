import { Router } from 'express';
import { apiKeyMiddleware } from '../../middlewares/apiKey.middleware.js';
import { uploadDocumento, processDocumento } from '../../middlewares/uploadDocumento.js';
import * as documentoEscolaController from '../controllers/documentoEscolaController.js';

const router = Router();

router.get('/', apiKeyMiddleware, documentoEscolaController.listDocumentosEscolaController);
router.post(
  '/',
  apiKeyMiddleware,
  uploadDocumento,
  processDocumento,
  documentoEscolaController.createDocumentoEscolaController
);
router.delete(
  '/:documentoId',
  apiKeyMiddleware,
  documentoEscolaController.deleteDocumentoEscolaController
);

export default router;
