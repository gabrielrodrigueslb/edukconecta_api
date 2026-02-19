import prisma from '../../lib/prisma.js';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

const ALLOWED_ROLES = new Set(['USER', 'ADMIN', 'SUPER_ADMIN']);

export async function createUser({ tenantId, name, avatarUrl, email, password, role }) {
  if (!name) throw new Error('Nome do usuario e obrigatorio');
  if (!email) throw new Error('Email do usuario e obrigatorio');
  if (!password) throw new Error('Senha do usuario e obrigatoria');

  const normalizedRole = ALLOWED_ROLES.has(role) ? role : 'USER';

  if (normalizedRole === 'SUPER_ADMIN') {
    const exists = await prisma.user.findFirst({
      where: { email, role: 'SUPER_ADMIN' },
    });
    if (exists) throw new Error('Super admin com esse email ja existe');
  } else {
    if (!tenantId) throw new Error('Tenant invalido');
    const exists = await prisma.user.findUnique({
      where: { tenantId_email: { tenantId, email } },
    });
    if (exists) throw new Error('Usuario com esse email ja existe');
  }

  const passwordHash = await bcrypt.hash(password, 10);

  return prisma.user.create({
    data: {
      tenantId: normalizedRole === 'SUPER_ADMIN' ? null : tenantId,
      name,
      avatarUrl,
      email,
      password: passwordHash,
      role: normalizedRole,
    },
    select: {
      id: true,
      name: true,
      avatarUrl: true,
      email: true,
      createdAt: true,
      role: true,
      tenantId: true,
    },
  });
}

export function getUsers(tenantId) {
  if (!tenantId) throw new Error('Tenant invalido');
  return prisma.user.findMany({
    where: { tenantId },
    select: {
      id: true,
      name: true,
      avatarUrl: true,
      email: true,
      createdAt: true,
      role: true,
    },
  });
}

export async function getUserById(tenantId, id) {
  if (!tenantId) throw new Error('Tenant invalido');
  if (!id) throw new Error('ID do usuario e obrigatorio');
  const user = await prisma.user.findFirst({
    where: { id, tenantId },
    select: {
      id: true,
      name: true,
      avatarUrl: true,
      email: true,
      createdAt: true,
      role: true,
    },
  });
  if (!user) throw new Error('Usuario nao encontrado');
  return user;
}

export async function deleteUser(tenantId, id) {
  if (!tenantId) throw new Error('Tenant invalido');
  if (!id) {
    throw new Error('ID do usuario e obrigatorio');
  }

  const user = await prisma.user.findFirst({ where: { id, tenantId } });
  if (!user) {
    throw new Error('Usuario nao encontrado');
  }

  if (user.avatarUrl) {
    const avatarPath = path.resolve(
      'src',
      user.avatarUrl.replace('/uploads/', 'uploads/'),
    );

    if (fs.existsSync(avatarPath)) {
      fs.unlinkSync(avatarPath);
    }
  }

  return prisma.user.delete({
    where: { id: user.id },
    select: {
      id: true,
      name: true,
      email: true,
    },
  });
}

export async function updateUser(tenantId, id, data) {
  if (!tenantId) throw new Error('Tenant invalido');
  if (!id) throw new Error('ID do usuario e obrigatorio');

  const user = await prisma.user.findFirst({ where: { id, tenantId } });
  if (!user) throw new Error('Usuario nao encontrado');

  const currentPassword = data.current_password || data.currentPassword;

  if (data.email && data.email !== user.email) {
    const emailExists = await prisma.user.findUnique({
      where: { tenantId_email: { tenantId, email: data.email } },
    });
    if (emailExists) throw new Error('Email ja esta em uso');
  }

  if (data.password) {
    if (!currentPassword) {
      throw new Error('Senha atual e obrigatoria');
    }
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      throw new Error('Senha atual invalida');
    }
    const strong =
      data.password.length >= 8 &&
      /[a-z]/.test(data.password) &&
      /[A-Z]/.test(data.password) &&
      /[0-9]/.test(data.password) &&
      /[^A-Za-z0-9]/.test(data.password);
    if (!strong) {
      throw new Error(
        'Senha fraca. Use ao menos 8 caracteres, maiuscula, minuscula, numero e simbolo.',
      );
    }
    data.password = await bcrypt.hash(data.password, 10);
  }

  delete data.current_password;
  delete data.currentPassword;
  delete data.tenantId;
  delete data.role;

  if (data.avatarUrl && user.avatarUrl) {
    const oldPath = path.resolve(
      'src',
      user.avatarUrl.replace('/uploads/', 'uploads/'),
    );

    if (fs.existsSync(oldPath)) {
      fs.unlinkSync(oldPath);
    }
  }

  return prisma.user.update({
    where: { id: user.id },
    data,
    select: {
      id: true,
      name: true,
      email: true,
      avatarUrl: true,
      role: true,
    },
  });
}
