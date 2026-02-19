import * as eventoService from '../services/eventoService.js';

export async function listEventosController(req, res) {
  try {
    const { from, to } = req.query;
    const tenantId = req.tenant?.id;
    const eventos = await eventoService.listEventos(tenantId, { from, to });
    res.status(200).json(eventos);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

export async function createEventoController(req, res) {
  try {
    const tenantId = req.tenant?.id;
    const evento = await eventoService.createEvento(tenantId, req.body);
    res.status(201).json(evento);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

export async function updateEventoController(req, res) {
  try {
    const { id } = req.params;
    const tenantId = req.tenant?.id;
    const evento = await eventoService.updateEvento(tenantId, id, req.body);
    res.status(200).json(evento);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

export async function deleteEventoController(req, res) {
  try {
    const { id } = req.params;
    const tenantId = req.tenant?.id;
    const result = await eventoService.deleteEvento(tenantId, id);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}
