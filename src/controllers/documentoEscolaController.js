import * as documentoEscolaService from '../services/documentoEscolaService.js';

export async function listDocumentosEscolaController(req, res) {
  try {
    const tenantId = req.tenant?.id;
    const docs = await documentoEscolaService.listDocumentosEscola(tenantId);
    res.status(200).json(docs);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

export async function createDocumentoEscolaController(req, res) {
  try {
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

    const doc = await documentoEscolaService.createDocumentoEscola(
      tenantId,
      payload
    );
    res.status(201).json(doc);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

export async function deleteDocumentoEscolaController(req, res) {
  try {
    const { documentoId } = req.params;
    const tenantId = req.tenant?.id;
    const result = await documentoEscolaService.deleteDocumentoEscola(
      tenantId,
      documentoId
    );
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}
