import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import fs from 'fs';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

export const uploadDocumento = upload.single('file');

export async function processDocumento(req, res, next) {
  if (!req.file) return next(new Error('Arquivo obrigatorio'));

  const tenantId = req.tenant?.id;
  if (!tenantId) {
    return next(new Error('Tenant nao identificado'));
  }

  const uploadDir = path.join('src', 'uploads', tenantId, 'documentos');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const ext = path.extname(req.file.originalname || '').toLowerCase();
  const filename = `${crypto.randomUUID()}${ext}`;
  const outputPath = path.join(uploadDir, filename);

  try {
    fs.writeFileSync(outputPath, req.file.buffer);
    req.documentUrl = `/uploads/${tenantId}/documentos/${filename}`;
    req.documentOriginalName = req.file.originalname;
    next();
  } catch (error) {
    next(error);
  }
}
