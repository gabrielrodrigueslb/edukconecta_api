import prisma from '../../lib/prisma.js';

function toDateOnlyString(date) {
  if (!date) return null;
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
}

function toStatus(presente, justificativa) {
  if (presente) return 'Presente';
  if (justificativa) return 'Justificado';
  return 'Ausente';
}

function parseDate(dateStr) {
  if (!dateStr) return null;
  return new Date(`${dateStr}T00:00:00.000Z`);
}

function mapPresenca(p) {
  return {
    id: String(p.id),
    student_id: p.alunoId,
    date: toDateOnlyString(p.data),
    shift: p.turno,
    status: toStatus(p.presente, p.justificativa),
    justification: p.justificativa || '',
    class_id: p.turmaId ? String(p.turmaId) : undefined,
    created_date: p.createdAt,
  };
}

export async function listByDateTurno(tenantId, { date, turno, turmaId }) {
  if (!tenantId) throw new Error('Tenant invalido');
  const data = parseDate(date);
  if (!data) throw new Error('Data invalida');
  if (!turno) throw new Error('Turno e obrigatorio');

  const presencas = await prisma.presencas.findMany({
    where: {
      tenantId,
      data,
      turno,
      ...(turmaId ? { turmaId: Number(turmaId) } : {}),
    },
  });

  return presencas.map(mapPresenca);
}

export async function listHistory(tenantId, { from, to, turno, turmaId }) {
  if (!tenantId) throw new Error('Tenant invalido');
  const fromDate = parseDate(from);
  const toDate = parseDate(to);
  if (!fromDate || !toDate) throw new Error('Periodo invalido');
  if (!turno) throw new Error('Turno e obrigatorio');

  const presencas = await prisma.presencas.findMany({
    where: {
      tenantId,
      data: { gte: fromDate, lte: toDate },
      turno,
      ...(turmaId ? { turmaId: Number(turmaId) } : {}),
    },
    orderBy: { data: 'desc' },
  });

  return presencas.map(mapPresenca);
}

export async function listByAluno(tenantId, { alunoId, from, to }) {
  if (!tenantId) throw new Error('Tenant invalido');
  if (!alunoId) throw new Error('Aluno e obrigatorio');
  const where = { tenantId, alunoId };

  if (from && to) {
    const fromDate = parseDate(from);
    const toDate = parseDate(to);
    if (!fromDate || !toDate) throw new Error('Periodo invalido');
    where.data = { gte: fromDate, lte: toDate };
  }

  const presencas = await prisma.presencas.findMany({
    where,
    orderBy: { data: 'desc' },
  });

  return presencas.map(mapPresenca);
}

export async function replaceChamada(tenantId, { date, turno, turmaId, records }) {
  if (!tenantId) throw new Error('Tenant invalido');
  const data = parseDate(date);
  if (!data) throw new Error('Data invalida');
  if (!turno) throw new Error('Turno e obrigatorio');
  if (!Array.isArray(records)) throw new Error('Registros invalidos');

  if (turmaId) {
    const turma = await prisma.turmas.findFirst({
      where: { id: Number(turmaId), tenantId },
      select: { id: true },
    });
    if (!turma) throw new Error('Turma nao encontrada');
  }

  await prisma.presencas.deleteMany({
    where: {
      tenantId,
      data,
      turno,
      ...(turmaId ? { turmaId: Number(turmaId) } : {}),
    },
  });

  if (records.length === 0) return [];

  const studentIds = Array.from(
    new Set(records.map((r) => r?.student_id).filter(Boolean))
  );
  const validStudents = studentIds.length
    ? await prisma.alunos.findMany({
        where: { tenantId, id: { in: studentIds } },
        select: { id: true },
      })
    : [];
  const validSet = new Set(validStudents.map((s) => s.id));

  const createData = records
    .filter((r) => r && r.student_id && r.status && validSet.has(r.student_id))
    .map((r) => ({
      tenantId,
      data,
      turno,
      presente: r.status === 'Presente',
      justificativa:
        r.status === 'Justificado' ? r.justification || null : null,
      alunoId: r.student_id,
      turmaId: turmaId ? Number(turmaId) : null,
    }));

  if (createData.length > 0) {
    await prisma.presencas.createMany({
      data: createData,
      skipDuplicates: true,
    });
  }

  const presencas = await prisma.presencas.findMany({
    where: {
      tenantId,
      data,
      turno,
      ...(turmaId ? { turmaId: Number(turmaId) } : {}),
    },
  });

  return presencas.map(mapPresenca);
}
