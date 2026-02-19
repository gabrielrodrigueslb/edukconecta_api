import prisma from '../../lib/prisma.js';

function mapEvento(evento) {
  return {
    id: evento.id,
    title: evento.titulo,
    description: evento.descricao || '',
    event_type: evento.tipo || 'Evento',
    date: evento.dataInicio.toISOString().slice(0, 10),
    start_time: evento.dataInicio.toISOString().slice(11, 16),
    end_time: evento.dataFim.toISOString().slice(11, 16),
    color: evento.cor || undefined,
  };
}

function buildEventoData(payload) {
  const date = payload.date || payload.data;
  const startTime = payload.start_time || '08:00';
  const endTime = payload.end_time || startTime;
  const startISO = `${date}T${startTime}:00.000Z`;
  const endISO = `${date}T${endTime}:00.000Z`;

  return {
    titulo: payload.title,
    descricao: payload.description || null,
    dataInicio: new Date(startISO),
    dataFim: new Date(endISO),
    tipo: payload.event_type || 'Evento',
    cor: payload.color || null,
  };
}

export async function listEventos(tenantId, { from, to }) {
  if (!tenantId) throw new Error('Tenant invalido');
  const where = { tenantId };
  if (from && to) {
    const fromDate = new Date(`${from}T00:00:00.000Z`);
    const toDate = new Date(`${to}T23:59:59.999Z`);
    where.dataInicio = { gte: fromDate, lte: toDate };
  }

  const eventos = await prisma.eventos.findMany({
    where,
    orderBy: { dataInicio: 'asc' },
  });
  return eventos.map(mapEvento);
}

export async function createEvento(tenantId, payload) {
  if (!tenantId) throw new Error('Tenant invalido');
  if (!payload.title) throw new Error('Titulo e obrigatorio');
  if (!payload.event_type) throw new Error('Tipo e obrigatorio');
  if (!payload.date) throw new Error('Data e obrigatoria');

  const evento = await prisma.eventos.create({
    data: { ...buildEventoData(payload), tenantId },
  });
  return mapEvento(evento);
}

export async function updateEvento(tenantId, id, payload) {
  if (!tenantId) throw new Error('Tenant invalido');
  if (!id) throw new Error('ID do evento e obrigatorio');
  const exists = await prisma.eventos.findFirst({ where: { id, tenantId } });
  if (!exists) throw new Error('Evento nao encontrado');

  const evento = await prisma.eventos.update({
    where: { id: exists.id },
    data: buildEventoData({ ...mapEvento(exists), ...payload }),
  });
  return mapEvento(evento);
}

export async function deleteEvento(tenantId, id) {
  if (!tenantId) throw new Error('Tenant invalido');
  if (!id) throw new Error('ID do evento e obrigatorio');
  const exists = await prisma.eventos.findFirst({ where: { id, tenantId } });
  if (!exists) throw new Error('Evento nao encontrado');
  await prisma.eventos.delete({ where: { id: exists.id } });
  return { id };
}
