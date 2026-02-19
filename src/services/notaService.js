import prisma from '../../lib/prisma.js';

function mapNotaToResponse(nota) {
  return {
    id: nota.id,
    student_id: nota.alunoId,
    subject: nota.disciplina,
    bimester: nota.bimestre,
    grade: nota.nota,
    notes: nota.observacao || '',
    created_at: nota.createdAt,
  };
}

export async function listNotasByAluno(tenantId, alunoId) {
  if (!tenantId) throw new Error('Tenant invalido');
  if (!alunoId) throw new Error('ID do aluno e obrigatorio');

  const notas = await prisma.notas.findMany({
    where: { alunoId, tenantId },
    orderBy: { createdAt: 'desc' },
  });

  return notas.map(mapNotaToResponse);
}

export async function createNota(tenantId, alunoId, payload) {
  if (!tenantId) throw new Error('Tenant invalido');
  if (!alunoId) throw new Error('ID do aluno e obrigatorio');

  const aluno = await prisma.alunos.findFirst({
    where: { id: alunoId, tenantId },
    select: { id: true },
  });
  if (!aluno) throw new Error('Aluno nao encontrado');

  const subject = String(payload.subject || '').trim();
  const bimester = Number(payload.bimester);
  const grade = Number(payload.grade);
  const notes = payload.notes ? String(payload.notes).trim() : null;

  if (!subject) throw new Error('Disciplina e obrigatoria');
  if (!Number.isFinite(bimester) || bimester < 1 || bimester > 4) {
    throw new Error('Bimestre invalido');
  }
  if (!Number.isFinite(grade)) throw new Error('Nota invalida');

  const nota = await prisma.notas.create({
    data: {
      tenantId,
      alunoId,
      disciplina: subject,
      bimestre: bimester,
      nota: grade,
      observacao: notes || null,
    },
  });

  return mapNotaToResponse(nota);
}
