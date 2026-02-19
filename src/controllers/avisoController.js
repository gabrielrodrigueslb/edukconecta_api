import * as avisoService from '../services/avisoService.js';

export async function listAvisosController(req, res) {
  try {
    const includeInactive = req.query?.all === 'true';
    const tenantId = req.tenant?.id;
    const avisos = await avisoService.listAvisos(tenantId, { includeInactive });
    res.status(200).json(avisos);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

export async function createAvisoController(req, res) {
  try {
    const tenantId = req.tenant?.id;
    const aviso = await avisoService.createAviso(tenantId, req.body);
    res.status(201).json(aviso);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

export async function updateAvisoController(req, res) {
  try {
    const { id } = req.params;
    const tenantId = req.tenant?.id;
    const aviso = await avisoService.updateAviso(tenantId, id, req.body);
    res.status(200).json(aviso);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

export async function deleteAvisoController(req, res) {
  try {
    const { id } = req.params;
    const tenantId = req.tenant?.id;
    const result = await avisoService.deleteAviso(tenantId, id);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}
