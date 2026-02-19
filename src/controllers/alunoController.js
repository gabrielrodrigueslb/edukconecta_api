import * as alunoService from '../services/alunoService.js';

export async function createAlunoController(req, res) {
  try {
    const tenantId = req.tenant?.id;
    const aluno = await alunoService.createAluno(tenantId, req.body);
    res.status(201).json(aluno);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

export async function getAlunosController(req, res) {
  try {
    const tenantId = req.tenant?.id;
    const alunos = await alunoService.getAlunos(tenantId);
    res.status(200).json(alunos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function getAlunoByIdController(req, res) {
  try {
    const { id } = req.params;
    const tenantId = req.tenant?.id;
    const aluno = await alunoService.getAlunoById(tenantId, id);
    res.status(200).json(aluno);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

export async function updateAlunoController(req, res) {
  try {
    const { id } = req.params;
    const tenantId = req.tenant?.id;
    const aluno = await alunoService.updateAluno(tenantId, id, req.body);
    res.status(200).json(aluno);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

export async function deleteAlunoController(req, res) {
  try {
    const { id } = req.params;
    const tenantId = req.tenant?.id;
    const result = await alunoService.deleteAluno(tenantId, id);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

export async function updateAlunoFotoController(req, res) {
  try {
    const { id } = req.params;
    const tenantId = req.tenant?.id;
    const fotoUrl = req.avatarUrl || null;
    const aluno = await alunoService.updateAlunoFoto(tenantId, id, fotoUrl);
    res.status(200).json(aluno);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}
