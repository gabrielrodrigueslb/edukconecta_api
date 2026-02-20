export function superAdminOnly(req, res, next) {
  if (!req.user || req.user.role !== 'SUPER_ADMIN') {
    return res.status(403).json({ error: 'Acesso restrito ao super admin' });
  }

  return next();
}
