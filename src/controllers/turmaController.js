import * as turmaService from '../services/turmaService.js';

export async function listTurmasController(req, res) {
  try {
    const tenantId = req.tenant?.id;
    const turmas = await turmaService.listTurmas(tenantId);
    res.status(200).json(turmas);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

export async function getTurmaByIdController(req, res) {
  try {
    const { id } = req.params;
    const tenantId = req.tenant?.id;
    const turma = await turmaService.getTurmaById(tenantId, id);
    res.status(200).json(turma);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

export async function createTurmaController(req, res) {
  try {
    const tenantId = req.tenant?.id;
    const turma = await turmaService.createTurma(tenantId, req.body);
    res.status(201).json(turma);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

export async function updateTurmaController(req, res) {
  try {
    const { id } = req.params;
    const tenantId = req.tenant?.id;
    const turma = await turmaService.updateTurma(tenantId, id, req.body);
    res.status(200).json(turma);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

export async function deleteTurmaController(req, res) {
  try {
    const { id } = req.params;
    const tenantId = req.tenant?.id;
    const result = await turmaService.deleteTurma(tenantId, id);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}
