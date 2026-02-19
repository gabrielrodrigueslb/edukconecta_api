import { Router } from 'express';
import { login, logout } from '../controllers/authController.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';

const router = Router();

router.post('/login', login);
router.post('/logout', authMiddleware, logout);

router.get('/me', authMiddleware, (req, res) => {
  const tenant = req.tenant
    ? {
        id: req.tenant.id,
        name: req.tenant.name,
        slug: req.tenant.slug,
        active: req.tenant.active,
      }
    : null;

  res.json({ user: req.user, tenant });
});

export default router;
