import prisma from '../../lib/prisma.js';
import fs from 'fs';
import path from 'path';

const STATUS_UI_TO_DB = {
  Ativo: 'ATIVO',
  Inativo: 'INATIVO',
  Matriculado: 'MATRICULADO',
};

const STATUS_DB_TO_UI = {
  ATIVO: 'Ativo',
  INATIVO: 'Inativo',
  MATRICULADO: 'Ativo',
};

function normalizeStatusToDb(status) {
  if (!status) return 'ATIVO';
  return STATUS_UI_TO_DB[status] || 'ATIVO';
}

function normalizeStatusToUi(status) {
  if (!status) return 'Ativo';
  return STATUS_DB_TO_UI[status] || 'Ativo';
}

function toDateOnlyString(date) {
  if (!date) return null;
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
}

function mapAlunoToResponse(aluno) {
  return {
    id: aluno.id,
    full_name: aluno.nomeCompleto,
    foto_aluno: aluno.fotoUrl || null,
    birth_date: toDateOnlyString(aluno.dataNascimento),
    grade: aluno.serieEscolar,
    shift: aluno.turno || '',
    status: normalizeStatusToUi(aluno.status),
    class_id: aluno.turmas?.[0] ? String(aluno.turmas[0].id) : '',
    origin_school: aluno.escola || '',
    cpf: aluno.cpf,
    address: aluno.endereco || '',
    allergies: aluno.alergias || '',
    blood_type: aluno.sangue || '',
    medications: aluno.medicamentos || '',
    medical_reports: aluno.laudosMedicos || '',
    behavior_notes: aluno.observacoesComportamento || '',
    difficulty_subjects: aluno.materiasDificuldade || [],
    difficulty_reaction: aluno.reacaoDificuldade || aluno.dificuldade || '',
    previous_tutoring: aluno.jaParticipouDeReforco || false,
    performance_indicator: aluno.desempenho || 'Nao avaliado',
    created_at: aluno.createdAt,
    guardians: (aluno.alunoResponsaveis || []).map((ar) => ({
      id: ar.responsavel.id,
      student_id: aluno.id,
      full_name: ar.responsavel.nome,
      relationship: ar.parentesco,
      phone: ar.responsavel.telefone,
      email: ar.responsavel.email || '',
      address: ar.responsavel.endereco || '',
      cpf: ar.responsavel.cpf || '',
    })),
  };
}

function buildAlunoData(payload) {
  return {
    nomeCompleto: payload.full_name,
    dataNascimento: new Date(payload.birth_date),
    serieEscolar: payload.grade,
    turno: payload.shift || null,
    fotoUrl: payload.foto_aluno ?? payload.fotoUrl,
    escola: payload.origin_school || '',
    cpf: payload.cpf || '',
    endereco: payload.address || '',
    alergias: payload.allergies || null,
    necessidadesEspeciais: payload.medical_reports || null,
    sangue: payload.blood_type || null,
    dificuldade: payload.difficulty_reaction || null,
    jaParticipouDeReforco: payload.previous_tutoring ?? false,
    medicamentos: payload.medications || null,
    laudosMedicos: payload.medical_reports || null,
    observacoesComportamento: payload.behavior_notes || null,
    desempenho: payload.performance_indicator || null,
    materiasDificuldade: Array.isArray(payload.difficulty_subjects)
      ? payload.difficulty_subjects
      : [],
    reacaoDificuldade: payload.difficulty_reaction || null,
    status: normalizeStatusToDb(payload.status),
  };
}

function normalizePayload(payload, existing) {
  if (!existing) return payload;
  return {
    full_name: payload.full_name ?? existing.nomeCompleto,
    birth_date: payload.birth_date ?? existing.dataNascimento,
    grade: payload.grade ?? existing.serieEscolar,
    shift: payload.shift ?? existing.turno,
    origin_school: payload.origin_school ?? existing.escola,
    cpf: payload.cpf ?? existing.cpf,
    address: payload.address ?? existing.endereco,
    allergies: payload.allergies ?? existing.alergias,
    blood_type: payload.blood_type ?? existing.sangue,
    medications: payload.medications ?? existing.medicamentos,
    medical_reports: payload.medical_reports ?? existing.laudosMedicos,
    behavior_notes:
      payload.behavior_notes ?? existing.observacoesComportamento ?? null,
    difficulty_subjects:
      payload.difficulty_subjects ?? existing.materiasDificuldade ?? [],
    difficulty_reaction:
      payload.difficulty_reaction ?? existing.reacaoDificuldade,
    previous_tutoring:
      payload.previous_tutoring ?? existing.jaParticipouDeReforco,
    performance_indicator: payload.performance_indicator ?? existing.desempenho,
    status: payload.status ?? existing.status,
    foto_aluno: payload.foto_aluno ?? payload.fotoUrl ?? existing.fotoUrl,
  };
}

async function upsertResponsavel(tenantId, data) {
  return prisma.responsavel.upsert({
    where: { tenantId_cpf: { tenantId, cpf: data.cpf } },
    create: {
      tenantId,
      nome: data.full_name,
      cpf: data.cpf || undefined,
      telefone: data.phone,
      email: data.email || null,
      endereco: data.address || null,
    },
    update: {
      nome: data.full_name,
      telefone: data.phone,
      email: data.email || null,
      endereco: data.address || null,
    },
    select: { id: true },
  });
}

async function attachResponsaveis(tenantId, alunoId, responsaveis) {
  if (!Array.isArray(responsaveis) || responsaveis.length === 0) return;

  const responsavelIds = [];
  for (const resp of responsaveis) {
    if (!resp?.cpf) continue;
    const { id } = await upsertResponsavel(tenantId, resp);
    responsavelIds.push({ id, parentesco: resp.relationship });
  }

  if (responsavelIds.length === 0) return;

  await prisma.alunoResponsavel.createMany({
    data: responsavelIds.map((r) => ({
      tenantId,
      alunoId,
      responsavelId: r.id,
      parentesco: r.parentesco || 'Responsavel',
    })),
    skipDuplicates: true,
  });
}

async function updateTurmaAluno(tenantId, alunoId, classId) {
  if (classId === undefined) return;

  if (!classId) {
    await prisma.alunos.update({
      where: { id: alunoId },
      data: { turmas: { set: [] } },
    });
    return;
  }

  const turma = await prisma.turmas.findFirst({
    where: { id: Number(classId), tenantId },
  });
  if (!turma) {
    throw new Error('Turma nao encontrada');
  }

  await prisma.alunos.update({
    where: { id: alunoId },
    data: {
      turmas: {
        set: [{ id: Number(classId) }],
      },
    },
  });
}

export async function createAluno(tenantId, payload) {
  if (!tenantId) throw new Error('Tenant invalido');
  if (!payload.full_name) throw new Error('Nome do aluno e obrigatorio');
  if (!payload.birth_date) throw new Error('Data de nascimento e obrigatoria');
  if (!payload.grade) throw new Error('Serie/ano escolar e obrigatorio');
  if (!payload.cpf) throw new Error('CPF do aluno e obrigatorio');
  if (!payload.address) throw new Error('Endereco do aluno e obrigatorio');

  const exists = await prisma.alunos.findUnique({
    where: { tenantId_cpf: { tenantId, cpf: payload.cpf } },
  });
  if (exists) throw new Error('Ja existe aluno com esse CPF');

  const aluno = await prisma.alunos.create({
    data: { ...buildAlunoData(payload), tenantId },
    include: {
      alunoResponsaveis: {
        include: { responsavel: true },
      },
      turmas: true,
    },
  });

  await attachResponsaveis(tenantId, aluno.id, payload.guardians);
  await updateTurmaAluno(tenantId, aluno.id, payload.class_id);

  const alunoComResponsaveis = await prisma.alunos.findFirst({
    where: { id: aluno.id, tenantId },
    include: {
      alunoResponsaveis: {
        include: { responsavel: true },
      },
      turmas: true,
    },
  });

  return mapAlunoToResponse(alunoComResponsaveis);
}

export async function getAlunos(tenantId) {
  if (!tenantId) throw new Error('Tenant invalido');
  const alunos = await prisma.alunos.findMany({
    where: { tenantId },
    orderBy: { createdAt: 'desc' },
    include: {
      alunoResponsaveis: {
        include: { responsavel: true },
      },
      turmas: true,
    },
  });
  return alunos.map(mapAlunoToResponse);
}

export async function getAlunoById(tenantId, id) {
  if (!tenantId) throw new Error('Tenant invalido');
  if (!id) throw new Error('ID do aluno e obrigatorio');
  const aluno = await prisma.alunos.findFirst({
    where: { id, tenantId },
    include: {
      alunoResponsaveis: {
        include: { responsavel: true },
      },
      turmas: true,
    },
  });
  if (!aluno) throw new Error('Aluno nao encontrado');
  return mapAlunoToResponse(aluno);
}

export async function updateAluno(tenantId, id, payload) {
  if (!tenantId) throw new Error('Tenant invalido');
  if (!id) throw new Error('ID do aluno e obrigatorio');

  const aluno = await prisma.alunos.findFirst({ where: { id, tenantId } });
  if (!aluno) throw new Error('Aluno nao encontrado');

  if (payload.cpf && payload.cpf !== aluno.cpf) {
    const cpfExists = await prisma.alunos.findUnique({
      where: { tenantId_cpf: { tenantId, cpf: payload.cpf } },
    });
    if (cpfExists) throw new Error('CPF ja esta em uso');
  }

  const updated = await prisma.alunos.update({
    where: { id: aluno.id },
    data: buildAlunoData(normalizePayload(payload, aluno)),
  });

  if (Array.isArray(payload.guardians)) {
    await prisma.alunoResponsavel.deleteMany({
      where: { alunoId: id, tenantId },
    });
    await attachResponsaveis(tenantId, id, payload.guardians);
  }
  await updateTurmaAluno(tenantId, id, payload.class_id);

  const alunoComResponsaveis = await prisma.alunos.findFirst({
    where: { id: updated.id, tenantId },
    include: {
      alunoResponsaveis: {
        include: { responsavel: true },
      },
      turmas: true,
    },
  });

  return mapAlunoToResponse(alunoComResponsaveis);
}

export async function updateAlunoFoto(tenantId, id, fotoUrl) {
  if (!tenantId) throw new Error('Tenant invalido');
  if (!id) throw new Error('ID do aluno e obrigatorio');
  const aluno = await prisma.alunos.findFirst({ where: { id, tenantId } });
  if (!aluno) throw new Error('Aluno nao encontrado');
  const oldFotoUrl = aluno.fotoUrl;

  const updated = await prisma.alunos.update({
    where: { id: aluno.id },
    data: { fotoUrl },
    include: {
      alunoResponsaveis: { include: { responsavel: true } },
      turmas: true,
    },
  });

  if (fotoUrl && oldFotoUrl && oldFotoUrl !== fotoUrl) {
    const oldPath = path.resolve(
      'src',
      oldFotoUrl.replace('/uploads/', 'uploads/')
    );

    if (fs.existsSync(oldPath)) {
      fs.unlinkSync(oldPath);
    }
  }

  return mapAlunoToResponse(updated);
}

export async function deleteAluno(tenantId, id) {
  if (!tenantId) throw new Error('Tenant invalido');
  if (!id) throw new Error('ID do aluno e obrigatorio');

  const aluno = await prisma.alunos.findFirst({ where: { id, tenantId } });
  if (!aluno) throw new Error('Aluno nao encontrado');

  await prisma.alunoResponsavel.deleteMany({
    where: { alunoId: id, tenantId },
  });
  await prisma.alunos.delete({ where: { id: aluno.id } });

  return { id };
}
