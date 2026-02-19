import { Router } from 'express';

const router = Router();

router.get('/public', (req, res) => {
  const tenant = req.tenant;
  if (!tenant) {
    return res.status(404).json({ error: 'Tenant nao encontrado' });
  }

  res.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=600');

  return res.json({
    id: tenant.id,
    name: tenant.name,
    slug: tenant.slug,
    active: tenant.active,
    logoUrl: tenant.logoUrl,
    loginBannerUrl: tenant.loginBannerUrl,
    faviconUrl: tenant.faviconUrl,
    defaultAvatarUrl: tenant.defaultAvatarUrl,
    themeColor: tenant.themeColor,
  });
});

export default router;
