import * as documentoService from '../services/documentoService.js';

export async function listDocumentosController(req, res) {
  try {
    const { id } = req.params;
    const tenantId = req.tenant?.id;
    const docs = await documentoService.listDocumentosByAluno(tenantId, id);
    res.status(200).json(docs);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

export async function createDocumentoController(req, res) {
  try {
    const { id } = req.params;
    const tenantId = req.tenant?.id;
    const url = req.documentUrl;
    const originalName = req.documentOriginalName;

    const payload = {
      url,
      name: req.body?.name || originalName,
      type: req.body?.type,
      year: req.body?.year,
      notes: req.body?.notes,
    };

    const doc = await documentoService.createDocumento(tenantId, id, payload);
    res.status(201).json(doc);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

export async function deleteDocumentoController(req, res) {
  try {
    const { id, documentoId } = req.params;
    const tenantId = req.tenant?.id;
    const result = await documentoService.deleteDocumento(
      tenantId,
      id,
      documentoId
    );
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}
