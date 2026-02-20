import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth.middleware.js';
import { superAdminOnly } from '../../middlewares/superAdmin.middleware.js';
import { uploadTenantBranding } from '../../middlewares/uploadTenantBranding.js';
import * as adminController from '../controllers/adminController.js';

const router = Router();

router.get(
  '/tenants',
  authMiddleware,
  superAdminOnly,
  adminController.listTenants,
);
router.post(
  '/tenants',
  authMiddleware,
  superAdminOnly,
  uploadTenantBranding,
  adminController.createTenant,
);

router.get(
  '/users',
  authMiddleware,
  superAdminOnly,
  adminController.listCurrentTenantUsers,
);

router.post(
  '/users',
  authMiddleware,
  superAdminOnly,
  adminController.createCurrentTenantUser,
);

router.put(
  '/tenant',
  authMiddleware,
  superAdminOnly,
  uploadTenantBranding,
  adminController.updateCurrentTenant,
);

router.put(
  '/users/:id',
  authMiddleware,
  superAdminOnly,
  adminController.updateCurrentTenantUser,
);

router.post(
  '/users/:id/reset-password',
  authMiddleware,
  superAdminOnly,
  adminController.resetCurrentTenantUserPassword,
);

router.delete(
  '/users/:id',
  authMiddleware,
  superAdminOnly,
  adminController.deleteCurrentTenantUser,
);

export default router;
