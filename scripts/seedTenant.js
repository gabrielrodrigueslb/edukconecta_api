import 'dotenv/config';
import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma.js';

async function run() {
  const slug = process.env.SEED_TENANT_SLUG;
  const name = process.env.SEED_TENANT_NAME || slug;
  const logoUrl = process.env.SEED_TENANT_LOGO_URL;
  const loginBannerUrl = process.env.SEED_TENANT_BANNER_URL;
  const faviconUrl = process.env.SEED_TENANT_FAVICON_URL;
  const defaultAvatarUrl = process.env.SEED_TENANT_DEFAULT_AVATAR_URL;
  const themeColor = process.env.SEED_TENANT_THEME_COLOR;
  const adminEmail = process.env.SEED_ADMIN_EMAIL;
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;

  if (!slug) throw new Error('SEED_TENANT_SLUG nao definido');
  if (!name) throw new Error('SEED_TENANT_NAME nao definido');
  if (!adminEmail) throw new Error('SEED_ADMIN_EMAIL nao definido');
  if (!adminPassword) throw new Error('SEED_ADMIN_PASSWORD nao definido');

  const updateData = { name, active: true };
  if (logoUrl) updateData.logoUrl = logoUrl;
  if (loginBannerUrl) updateData.loginBannerUrl = loginBannerUrl;
  if (faviconUrl) updateData.faviconUrl = faviconUrl;
  if (defaultAvatarUrl) updateData.defaultAvatarUrl = defaultAvatarUrl;
  if (themeColor) updateData.themeColor = themeColor;

  const tenant = await prisma.tenant.upsert({
    where: { slug },
    update: updateData,
    create: {
      name,
      slug,
      active: true,
      logoUrl: logoUrl || null,
      loginBannerUrl: loginBannerUrl || null,
      faviconUrl: faviconUrl || null,
      defaultAvatarUrl: defaultAvatarUrl || null,
      themeColor: themeColor || null,
    },
  });

  const passwordHash = await bcrypt.hash(adminPassword, 10);

  await prisma.user.upsert({
    where: { tenantId_email: { tenantId: tenant.id, email: adminEmail } },
    update: {
      name: 'Admin',
      password: passwordHash,
      role: 'ADMIN',
      active: true,
    },
    create: {
      tenantId: tenant.id,
      name: 'Admin',
      email: adminEmail,
      password: passwordHash,
      role: 'ADMIN',
      active: true,
    },
  });

  console.log(`Tenant ok: ${tenant.slug} (${tenant.id})`);
  console.log(`Admin ok: ${adminEmail}`);
}

run()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
