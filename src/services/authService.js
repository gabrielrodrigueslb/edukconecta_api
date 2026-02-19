import prisma from '../../lib/prisma.js';
import bcrypt from 'bcryptjs';

export async function validateUser({ tenantId, email, password }) {
  if (!email) throw new Error('Email do usuario e obrigatorio');
  if (!password) throw new Error('Senha do usuario e obrigatoria');

  const superAdmin = await prisma.user.findFirst({
    where: { email, role: 'SUPER_ADMIN' },
  });

  if (superAdmin) {
    const isPasswordValid = await bcrypt.compare(password, superAdmin.password);
    if (!isPasswordValid) {
      throw new Error('Usuario ou senha invalidos');
    }
    return superAdmin;
  }

  if (!tenantId) throw new Error('Tenant invalido');

  const user = await prisma.user.findUnique({
    where: {
      tenantId_email: { tenantId, email },
    },
  });
  if (!user) {
    throw new Error('Usuario ou senha invalidos');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new Error('Usuario ou senha invalidos');
  }
  return user;
}

export function me(req, res) {
  res.json({
    user: req.user,
  });
}
