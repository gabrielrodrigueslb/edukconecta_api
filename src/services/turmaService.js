import prisma from '../../lib/prisma.js';

function mapTurma(turma) {
  return {
    id: String(turma.id),
    name: turma.nomeTurma,
    shift: turma.turno,
    days_of_week: turma.diasSemana || [],
    start_time: turma.horarioInicio || '',
    end_time: turma.horarioFim || '',
    status: turma.status || 'Ativa',
    max_students: turma.maxAlunos ?? 15,
    created_at: turma.createdAt,
  };
}

function buildTurmaData(payload) {
  return {
    nomeTurma: payload.name,
    turno: payload.shift,
    diasSemana: Array.isArray(payload.days_of_week) ? payload.days_of_week : [],
    horarioInicio: payload.start_time || null,
    horarioFim: payload.end_time || null,
    status: payload.status || 'Ativa',
    maxAlunos:
      Number.isFinite(Number(payload.max_students)) &&
      Number(payload.max_students) > 0
        ? Number(payload.max_students)
        : 15,
  };
}

function normalizePayload(payload, existing) {
  if (!existing) return payload;
  return {
    name: payload.name ?? existing.nomeTurma,
    shift: payload.shift ?? existing.turno,
    days_of_week: payload.days_of_week ?? existing.diasSemana ?? [],
    start_time: payload.start_time ?? existing.horarioInicio,
    end_time: payload.end_time ?? existing.horarioFim,
    status: payload.status ?? existing.status,
    max_students: payload.max_students ?? existing.maxAlunos,
  };
}

export async function listTurmas(tenantId) {
  if (!tenantId) throw new Error('Tenant invalido');
  const turmas = await prisma.turmas.findMany({
    where: { tenantId },
    orderBy: { createdAt: 'desc' },
  });
  return turmas.map(mapTurma);
}

export async function getTurmaById(tenantId, id) {
  if (!tenantId) throw new Error('Tenant invalido');
  if (!id) throw new Error('ID da turma e obrigatorio');
  const turma = await prisma.turmas.findFirst({
    where: { id: Number(id), tenantId },
  });
  if (!turma) throw new Error('Turma nao encontrada');
  return mapTurma(turma);
}

export async function createTurma(tenantId, payload) {
  if (!tenantId) throw new Error('Tenant invalido');
  if (!payload.name) throw new Error('Nome da turma e obrigatorio');
  if (!payload.shift) throw new Error('Turno e obrigatorio');

  const turma = await prisma.turmas.create({
    data: { ...buildTurmaData(payload), tenantId },
  });
  return mapTurma(turma);
}

export async function updateTurma(tenantId, id, payload) {
  if (!tenantId) throw new Error('Tenant invalido');
  if (!id) throw new Error('ID da turma e obrigatorio');
  const exists = await prisma.turmas.findFirst({
    where: { id: Number(id), tenantId },
  });
  if (!exists) throw new Error('Turma nao encontrada');

  const turma = await prisma.turmas.update({
    where: { id: exists.id },
    data: buildTurmaData(normalizePayload(payload, exists)),
  });
  return mapTurma(turma);
}

export async function deleteTurma(tenantId, id) {
  if (!tenantId) throw new Error('Tenant invalido');
  if (!id) throw new Error('ID da turma e obrigatorio');
  const turma = await prisma.turmas.findFirst({
    where: { id: Number(id), tenantId },
  });
  if (!turma) throw new Error('Turma nao encontrada');

  await prisma.turmas.delete({
    where: { id: turma.id },
  });
  return { id: String(id) };
}
