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

function mapDocumento(doc) {
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

export async function listDocumentosEscola(tenantId) {
  if (!tenantId) throw new Error('Tenant invalido');
  const docs = await prisma.documentosEscola.findMany({
    where: { tenantId },
    orderBy: { createdAt: 'desc' },
  });
  return docs.map(mapDocumento);
}

export async function createDocumentoEscola(tenantId, payload) {
  if (!tenantId) throw new Error('Tenant invalido');
  if (!payload?.url) throw new Error('Arquivo obrigatorio');

  const name = String(payload.name || '').trim() || 'Documento';
  const type = normalizeType(payload.type);
  const year = payload.year ? Number(payload.year) : null;
  const notes = payload.notes ? String(payload.notes).trim() : null;

  const doc = await prisma.documentosEscola.create({
    data: {
      tenantId,
      nome: name,
      tipo: type,
      url: payload.url,
      anoLetivo: Number.isFinite(year) ? year : null,
      observacao: notes || null,
    },
  });

  return mapDocumento(doc);
}

export async function deleteDocumentoEscola(tenantId, documentoId) {
  if (!tenantId) throw new Error('Tenant invalido');
  if (!documentoId) throw new Error('Documento invalido');

  const doc = await prisma.documentosEscola.findFirst({
    where: { id: documentoId, tenantId },
  });
  if (!doc) throw new Error('Documento nao encontrado');

  await prisma.documentosEscola.delete({ where: { id: doc.id } });
  return { ok: true };
}
