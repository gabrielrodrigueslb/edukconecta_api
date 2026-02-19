import prisma from '../../lib/prisma.js';

function mapAviso(aviso) {
  return {
    id: aviso.id,
    title: aviso.titulo,
    content: aviso.conteudo,
    date: aviso.data.toISOString().slice(0, 10),
    is_active: aviso.ativo,
    priority: aviso.prioridade,
  };
}

function buildAvisoData(payload) {
  return {
    titulo: payload.title,
    conteudo: payload.content,
    data: payload.date ? new Date(payload.date) : new Date(),
    ativo: payload.is_active ?? true,
    prioridade: payload.priority || 'normal',
  };
}

export async function listAvisos(tenantId, { includeInactive = false } = {}) {
  if (!tenantId) throw new Error('Tenant invalido');
  const where = includeInactive ? { tenantId } : { tenantId, ativo: true };
  const avisos = await prisma.avisos.findMany({
    where,
    orderBy: { data: 'desc' },
  });
  return avisos.map(mapAviso);
}

export async function createAviso(tenantId, payload) {
  if (!tenantId) throw new Error('Tenant invalido');
  if (!payload.title) throw new Error('Titulo e obrigatorio');
  if (!payload.content) throw new Error('Conteudo e obrigatorio');

  const aviso = await prisma.avisos.create({
    data: { ...buildAvisoData(payload), tenantId },
  });
  return mapAviso(aviso);
}

export async function updateAviso(tenantId, id, payload) {
  if (!tenantId) throw new Error('Tenant invalido');
  if (!id) throw new Error('ID do aviso e obrigatorio');
  const exists = await prisma.avisos.findFirst({ where: { id, tenantId } });
  if (!exists) throw new Error('Aviso nao encontrado');

  const aviso = await prisma.avisos.update({
    where: { id: exists.id },
    data: buildAvisoData({ ...mapAviso(exists), ...payload }),
  });
  return mapAviso(aviso);
}

export async function deleteAviso(tenantId, id) {
  if (!tenantId) throw new Error('Tenant invalido');
  if (!id) throw new Error('ID do aviso e obrigatorio');
  const exists = await prisma.avisos.findFirst({ where: { id, tenantId } });
  if (!exists) throw new Error('Aviso nao encontrado');

  await prisma.avisos.delete({ where: { id: exists.id } });
  return { id };
}
