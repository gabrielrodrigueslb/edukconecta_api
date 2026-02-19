import * as notaService from '../services/notaService.js';

export async function listNotasController(req, res) {
  try {
    const { id } = req.params;
    const tenantId = req.tenant?.id;
    const notas = await notaService.listNotasByAluno(tenantId, id);
    res.status(200).json(notas);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

export async function createNotaController(req, res) {
  try {
    const { id } = req.params;
    const tenantId = req.tenant?.id;
    const nota = await notaService.createNota(tenantId, id, req.body);
    res.status(201).json(nota);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}
