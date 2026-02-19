import prisma from '../../lib/prisma.js';

function normalizeType(value) {
  if (!value) return 'OUTRO';
  const upper = String(value).toUpperCase();
  const allowed = [
    'BOLETIM',
    'LAUDO',
    'AUTORIZACAO',
    'DECLARACAO',
    'MATRICULA',
    'HISTORICO_ESCOLAR',
    'OUTRO',
  ];
  return allowed.includes(upper) ? upper : 'OUTRO';
}

function mapDocumentoToResponse(doc) {
  return {
    id: doc.id,
    name: doc.nome,
    type: doc.tipo,
    url: doc.url,
    year: doc.anoLetivo,
    notes: doc.observacao || '',
    created_at: doc.createdAt,
  };
}

export async function listDocumentosByAluno(tenantId, alunoId) {
  if (!tenantId) throw new Error('Tenant invalido');
  if (!alunoId) throw new Error('ID do aluno e obrigatorio');

  const docs = await prisma.documentos.findMany({
    where: { alunoId, tenantId },
    orderBy: { createdAt: 'desc' },
  });

  return docs.map(mapDocumentoToResponse);
}

export async function createDocumento(tenantId, alunoId, payload) {
  if (!tenantId) throw new Error('Tenant invalido');
  if (!alunoId) throw new Error('ID do aluno e obrigatorio');
  if (!payload?.url) throw new Error('Arquivo e obrigatorio');

  const aluno = await prisma.alunos.findFirst({
    where: { id: alunoId, tenantId },
    select: { id: true },
  });
  if (!aluno) throw new Error('Aluno nao encontrado');

  const name = String(payload.name || '').trim() || 'Documento';
  const type = normalizeType(payload.type);
  const year = payload.year ? Number(payload.year) : null;
  const notes = payload.notes ? String(payload.notes).trim() : null;

  const doc = await prisma.documentos.create({
    data: {
      tenantId,
      alunoId,
      nome: name,
      tipo: type,
      url: payload.url,
      anoLetivo: Number.isFinite(year) ? year : null,
      observacao: notes || null,
    },
  });

  return mapDocumentoToResponse(doc);
}

export async function deleteDocumento(tenantId, alunoId, documentoId) {
  if (!tenantId) throw new Error('Tenant invalido');
  if (!alunoId || !documentoId) throw new Error('Documento invalido');

  const doc = await prisma.documentos.findFirst({
    where: { id: documentoId, alunoId, tenantId },
  });
  if (!doc) throw new Error('Documento nao encontrado');

  await prisma.documentos.delete({ where: { id: doc.id } });
  return { ok: true };
}
