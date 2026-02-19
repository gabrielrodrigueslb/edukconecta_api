import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import sharp from 'sharp';
import fs from 'fs';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error('Formato de imagem inválido'));
    }
    cb(null, true);
  },
});

export const uploadAvatar = upload.single('avatar');

export async function processAvatar(req, res, next) {
  if (!req.file) return next();

  const tenantId = req.tenant?.id;
  if (!tenantId) {
    return next(new Error('Tenant nÃ£o identificado'));
  }

  const uploadDir = path.join('src', 'uploads', tenantId, 'avatars');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const filename = `${crypto.randomUUID()}.webp`;
  const outputPath = path.join(uploadDir, filename);

  try {
    await sharp(req.file.buffer)
      .resize(256, 256, {
        fit: 'cover',
        position: 'center',
      })
      .webp({ quality: 80 }) // equilíbrio perfeito
      .toFile(outputPath);

    req.avatarUrl = `/uploads/${tenantId}/avatars/${filename}`;
    next();
  } catch (error) {
    next(error);
  }
}
