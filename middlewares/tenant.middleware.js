import prisma from '../lib/prisma.js';

const DEFAULT_TENANT_SLUG =
  process.env.DEFAULT_TENANT_SLUG || process.env.TENANT_SLUG || '';

function normalizeHost(rawHost) {
  if (!rawHost) return '';
  const host = rawHost.split(',')[0].trim();
  return host.split(':')[0].toLowerCase();
}

function isIpAddress(hostname) {
  return /^\d{1,3}(\.\d{1,3}){3}$/.test(hostname);
}

function extractSlugFromHost(hostname) {
  if (!hostname) return '';
  if (hostname === 'localhost' || isIpAddress(hostname)) return '';
  const parts = hostname.split('.');
  if (parts.length < 3) return '';
  return parts[0];
}

export async function tenantMiddleware(req, res, next) {
  try {
    if (req.path.startsWith('/api/admin/tenants')) {
      return next();
    }

    if (req.path.startsWith('/uploads/')) {
      return next();
    }

    const headerTenant = String(req.headers['x-tenant'] || '').trim();
    const hostHeader = req.headers['x-forwarded-host'] || req.headers.host || '';
    const hostname = normalizeHost(hostHeader);
    const slugFromHost = extractSlugFromHost(hostname);

    const slug = headerTenant || slugFromHost || DEFAULT_TENANT_SLUG;

    if (!slug) {
      return res.status(400).json({ error: 'Tenant não identificado' });
    }

    const tenant = await prisma.tenant.findUnique({
      where: { slug },
    });

    if (!tenant) {
      return res.status(404).json({ error: 'Tenant não encontrado' });
    }

    if (!tenant.active) {
      return res.status(403).json({ error: 'Tenant inativo' });
    }

    req.tenant = tenant;
    return next();
  } catch (error) {
    return next(error);
  }
}
