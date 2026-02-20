import path from 'path';
import fs from 'fs';
import sharp from 'sharp';
import prisma from '../../lib/prisma.js';
import * as userService from '../services/userService.js';

function normalizeSlug(value) {
  return String(value || '')
    .trim()
    .toLowerCase();
}

function isValidSlug(slug) {
  return /^[a-z0-9-]+$/.test(slug);
}

function parseBoolean(value, fallback = true) {
  if (value === undefined || value === null || value === '') return fallback;
  return ['true', '1', 'yes', 'on'].includes(String(value).toLowerCase());
}

async function saveWebp(buffer, outputPath, resizeOptions) {
  let pipeline = sharp(buffer);
  if (resizeOptions) {
    pipeline = pipeline.resize(resizeOptions);
  }
  await pipeline.webp({ quality: 85 }).toFile(outputPath);
}

async function savePng(buffer, outputPath, resizeOptions) {
  let pipeline = sharp(buffer);
  if (resizeOptions) {
    pipeline = pipeline.resize(resizeOptions);
  }
  await pipeline.png({ quality: 90 }).toFile(outputPath);
}

async function removeUploadIfExists(url) {
  if (!url) return;
  if (!url.startsWith('/uploads/')) return;
  const filePath = path.resolve('src', url.replace('/uploads/', 'uploads/'));
  try {
    await fs.promises.rm(filePath, {
      force: true,
      maxRetries: 5,
      retryDelay: 200,
    });
  } catch (error) {
    // Em Windows o arquivo pode estar em uso (EBUSY). Não bloqueie a atualização.
    console.warn(
      'Nao foi possivel remover arquivo antigo:',
      filePath,
      error?.message || error,
    );
  }
}

export async function listTenants(req, res) {
  try {
    const tenants = await prisma.tenant.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        slug: true,
        active: true,
        logoUrl: true,
        loginBannerUrl: true,
        faviconUrl: true,
        defaultAvatarUrl: true,
        themeColor: true,
        createdAt: true,
      },
    });
    res.json(tenants);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function createTenant(req, res) {
  try {
    const slug = normalizeSlug(req.body.slug);
    const name = String(req.body.name || '').trim();
    const themeColor = req.body.themeColor ? String(req.body.themeColor).trim() : null;
    const active = parseBoolean(req.body.active, true);

    if (!slug || !name) {
      return res.status(400).json({ error: 'Slug e nome sao obrigatorios' });
    }

    if (!isValidSlug(slug)) {
      return res.status(400).json({
        error: 'Slug invalido. Use apenas letras minusculas, numeros e hifen',
      });
    }

    const exists = await prisma.tenant.findUnique({ where: { slug } });
    if (exists) {
      return res.status(409).json({ error: 'Slug ja existe' });
    }

    const files = req.files || {};
    const brandingDir = path.join('src', 'uploads', slug, 'branding');

    let logoUrl = null;
    let loginBannerUrl = null;
    let defaultAvatarUrl = null;
    let faviconUrl = null;

    if (
      (files.logo && files.logo[0]) ||
      (files.banner && files.banner[0]) ||
      (files.avatar && files.avatar[0]) ||
      (files.favicon && files.favicon[0])
    ) {
      fs.mkdirSync(brandingDir, { recursive: true });
    }

    if (files.logo && files.logo[0]) {
      const outputPath = path.join(brandingDir, 'logo.webp');
      await saveWebp(files.logo[0].buffer, outputPath, {
        width: 512,
        height: 512,
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      });
      logoUrl = `/uploads/${slug}/branding/logo.webp`;
    }

    if (files.banner && files.banner[0]) {
      const outputPath = path.join(brandingDir, 'login-banner.webp');
      await saveWebp(files.banner[0].buffer, outputPath, {
        width: 1920,
        height: 720,
        fit: 'cover',
      });
      loginBannerUrl = `/uploads/${slug}/branding/login-banner.webp`;
    }

    if (files.avatar && files.avatar[0]) {
      const outputPath = path.join(brandingDir, 'default-avatar.webp');
      await saveWebp(files.avatar[0].buffer, outputPath, {
        width: 256,
        height: 256,
        fit: 'cover',
        position: 'center',
      });
      defaultAvatarUrl = `/uploads/${slug}/branding/default-avatar.webp`;
    }

    if (files.favicon && files.favicon[0]) {
      const outputPath = path.join(brandingDir, 'favicon.png');
      await savePng(files.favicon[0].buffer, outputPath, {
        width: 64,
        height: 64,
        fit: 'cover',
      });
      faviconUrl = `/uploads/${slug}/branding/favicon.png`;
    }

    if (!faviconUrl && logoUrl) {
      faviconUrl = logoUrl;
    }

    const tenant = await prisma.tenant.create({
      data: {
        slug,
        name,
        active,
        themeColor,
        logoUrl,
        loginBannerUrl,
        defaultAvatarUrl,
        faviconUrl,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        active: true,
        logoUrl: true,
        loginBannerUrl: true,
        faviconUrl: true,
        defaultAvatarUrl: true,
        themeColor: true,
        createdAt: true,
      },
    });

    return res.status(201).json(tenant);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

export async function listCurrentTenantUsers(req, res) {
  try {
    const tenantId = req.tenant?.id;
    if (!tenantId) {
      return res.status(400).json({ error: 'Tenant nao identificado' });
    }

    const tenant = req.tenant;

    const users = await prisma.user.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatarUrl: true,
        active: true,
        createdAt: true,
      },
    });

    return res.json({ tenant, users });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

export async function updateCurrentTenant(req, res) {
  try {
    const tenant = req.tenant;
    if (!tenant) {
      return res.status(400).json({ error: 'Tenant nao identificado' });
    }

    const name = req.body?.name ? String(req.body.name).trim() : null;

    const files = req.files || {};
    const brandingDir = path.join('src', 'uploads', tenant.slug, 'branding');

    let logoUrl = null;
    let loginBannerUrl = null;
    let defaultAvatarUrl = null;

    if (
      (files.logo && files.logo[0]) ||
      (files.banner && files.banner[0]) ||
      (files.avatar && files.avatar[0])
    ) {
      fs.mkdirSync(brandingDir, { recursive: true });
    }

    if (files.logo && files.logo[0]) {
      const filename = `logo-${Date.now()}.webp`;
      const outputPath = path.join(brandingDir, filename);
      await saveWebp(files.logo[0].buffer, outputPath, {
        width: 512,
        height: 512,
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      });
      logoUrl = `/uploads/${tenant.slug}/branding/${filename}`;
      void removeUploadIfExists(tenant.logoUrl);
    }

    if (files.banner && files.banner[0]) {
      const filename = `login-banner-${Date.now()}.webp`;
      const outputPath = path.join(brandingDir, filename);
      await saveWebp(files.banner[0].buffer, outputPath, {
        width: 1920,
        height: 720,
        fit: 'cover',
      });
      loginBannerUrl = `/uploads/${tenant.slug}/branding/${filename}`;
      void removeUploadIfExists(tenant.loginBannerUrl);
    }

    if (files.avatar && files.avatar[0]) {
      const filename = `default-avatar-${Date.now()}.webp`;
      const outputPath = path.join(brandingDir, filename);
      await saveWebp(files.avatar[0].buffer, outputPath, {
        width: 256,
        height: 256,
        fit: 'cover',
        position: 'center',
      });
      defaultAvatarUrl = `/uploads/${tenant.slug}/branding/${filename}`;
      void removeUploadIfExists(tenant.defaultAvatarUrl);
    }

    const data = {};
    if (name) data.name = name;
    if (logoUrl) {
      data.logoUrl = logoUrl;
      if (!tenant.faviconUrl || tenant.faviconUrl === tenant.logoUrl) {
        data.faviconUrl = logoUrl;
      }
    }
    if (loginBannerUrl) data.loginBannerUrl = loginBannerUrl;
    if (defaultAvatarUrl) data.defaultAvatarUrl = defaultAvatarUrl;

    const updated = await prisma.tenant.update({
      where: { id: tenant.id },
      data,
      select: {
        id: true,
        name: true,
        slug: true,
        active: true,
        logoUrl: true,
        loginBannerUrl: true,
        faviconUrl: true,
        defaultAvatarUrl: true,
        themeColor: true,
        createdAt: true,
      },
    });

    return res.json(updated);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
}

export async function createCurrentTenantUser(req, res) {
  try {
    const { name, email, password, role } = req.body || {};
    const tenantId = req.tenant?.id;

    if (!tenantId) {
      return res.status(400).json({ error: 'Tenant nao identificado' });
    }

    if (!name || !email || !password) {
      return res.status(400).json({
        error: 'Nome, email e senha sao obrigatorios',
      });
    }

    if (role === 'SUPER_ADMIN') {
      return res.status(400).json({ error: 'Role invalida para tenant' });
    }

    const user = await userService.createUser({
      tenantId,
      name: String(name).trim(),
      email: String(email).trim().toLowerCase(),
      password: String(password),
      role: role || 'USER',
      avatarUrl: null,
    });

    return res.status(201).json(user);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
}

export async function updateCurrentTenantUser(req, res) {
  try {
    const tenantId = req.tenant?.id;
    const { id } = req.params;
    if (!tenantId) {
      return res.status(400).json({ error: 'Tenant nao identificado' });
    }
    if (!id) {
      return res.status(400).json({ error: 'ID do usuario e obrigatorio' });
    }

    const data = {
      name: req.body?.name,
      email: req.body?.email,
      active: req.body?.active,
    };

    const updated = await userService.updateUser(tenantId, id, data);
    return res.json(updated);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
}

export async function resetCurrentTenantUserPassword(req, res) {
  try {
    const tenantId = req.tenant?.id;
    const { id } = req.params;
    const { password } = req.body || {};

    if (!tenantId) {
      return res.status(400).json({ error: 'Tenant nao identificado' });
    }
    if (!id) {
      return res.status(400).json({ error: 'ID do usuario e obrigatorio' });
    }
    if (!password) {
      return res.status(400).json({ error: 'Senha obrigatoria' });
    }

    const updated = await userService.resetUserPassword(
      tenantId,
      id,
      String(password),
    );
    return res.json(updated);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
}

export async function deleteCurrentTenantUser(req, res) {
  try {
    const tenantId = req.tenant?.id;
    const { id } = req.params;
    if (!tenantId) {
      return res.status(400).json({ error: 'Tenant nao identificado' });
    }
    if (!id) {
      return res.status(400).json({ error: 'ID do usuario e obrigatorio' });
    }

    const deleted = await userService.deleteUser(tenantId, id);
    return res.json(deleted);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
}
