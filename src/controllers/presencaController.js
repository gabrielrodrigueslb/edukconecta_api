import * as presencaService from '../services/presencaService.js';

export async function listByDateTurnoController(req, res) {
  try {
    const { date, turno, turmaId } = req.query;
    const tenantId = req.tenant?.id;
    const presencas = await presencaService.listByDateTurno(tenantId, {
      date,
      turno,
      turmaId,
    });
    res.status(200).json(presencas);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

export async function listHistoryController(req, res) {
  try {
    const { from, to, turno, turmaId } = req.query;
    const tenantId = req.tenant?.id;
    const presencas = await presencaService.listHistory(tenantId, {
      from,
      to,
      turno,
      turmaId,
    });
    res.status(200).json(presencas);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

export async function listByAlunoController(req, res) {
  try {
    const { alunoId } = req.params;
    const { from, to } = req.query;
    const tenantId = req.tenant?.id;
    const presencas = await presencaService.listByAluno(tenantId, {
      alunoId,
      from,
      to,
    });
    res.status(200).json(presencas);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

export async function replaceChamadaController(req, res) {
  try {
    const { date, turno, turmaId, records } = req.body;
    const tenantId = req.tenant?.id;
    const presencas = await presencaService.replaceChamada(tenantId, {
      date,
      turno,
      turmaId,
      records,
    });
    res.status(200).json(presencas);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}
