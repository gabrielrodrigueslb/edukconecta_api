import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma.js';

export async function authMiddleware(req, res, next) {
  const token = req.cookies.authToken;

  if (!token) {
    return res.status(401).json({ error: 'Nao autorizado' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role === 'SUPER_ADMIN') {
      const user = await prisma.user.findFirst({
        where: { id: decoded.id, role: 'SUPER_ADMIN' },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          avatarUrl: true,
          tenantId: true,
        },
      });

      if (!user) {
        return res.status(401).json({ error: 'Usuario nao encontrado' });
      }

      req.user = user;
      return next();
    }

    if (!req.tenant?.id) {
      return res.status(400).json({ error: 'Tenant nao identificado' });
    }

    if (decoded.tenantId !== req.tenant.id) {
      return res.status(401).json({ error: 'Tenant invalido' });
    }

    const user = await prisma.user.findFirst({
      where: { id: decoded.id, tenantId: req.tenant.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatarUrl: true,
        tenantId: true,
      },
    });

    if (!user) {
      return res.status(401).json({ error: 'Usuario nao encontrado' });
    }

    req.user = user;

    return next();
  } catch (err) {
    console.error('Erro no auth middleware:', err);
    return res
      .status(401)
      .json({ error: 'Token invalido', details: err.message });
  }
}
