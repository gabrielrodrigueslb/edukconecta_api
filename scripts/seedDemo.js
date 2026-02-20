import 'dotenv/config';
import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma.js';

const TENANT_SLUG = 'demoeduk';
const TENANT_NAME = 'Demo Eduk';

const ADMIN_EMAIL = 'admin@demoeduk.com';
const ADMIN_PASSWORD = 'Demo@1234';
const TEACHER_EMAIL = 'professor@demoeduk.com';
const TEACHER_PASSWORD = 'Demo@1234';

const STUDENTS_PER_TURMA = 15;

const STUDENT_FIRST_NAMES = [
  'Ana',
  'Beatriz',
  'Bruno',
  'Caio',
  'Daniela',
  'Eduardo',
  'Fernanda',
  'Gustavo',
  'Helena',
  'Isabela',
  'Joao',
  'Larissa',
  'Marcos',
  'Natalia',
  'Otavio',
  'Paula',
  'Rafael',
  'Sofia',
  'Tiago',
  'Vitoria',
];

const LAST_NAMES = [
  'Silva',
  'Santos',
  'Oliveira',
  'Souza',
  'Lima',
  'Pereira',
  'Carvalho',
  'Ferreira',
  'Almeida',
  'Gomes',
  'Ribeiro',
  'Rocha',
  'Barbosa',
  'Dias',
  'Moreira',
];

const GUARDIAN_FIRST_NAMES = [
  'Adriana',
  'Aline',
  'Andre',
  'Camila',
  'Carlos',
  'Cintia',
  'Diego',
  'Eliane',
  'Fabio',
  'Juliana',
  'Luciana',
  'Marcio',
  'Patricia',
  'Renata',
  'Rodrigo',
  'Vanessa',
];

const PERFORMANCE_INDICATORS = [
  'Excelente',
  'Muito bom',
  'Bom',
  'Regular',
  'Em desenvolvimento',
  'Precisa de apoio',
];

const STREET_NAMES = [
  'Rua das Flores',
  'Rua do Sol',
  'Avenida Central',
  'Rua das Acacias',
  'Avenida Brasil',
  'Rua da Serra',
  'Rua Horizonte',
  'Avenida Principal',
  'Rua do Lago',
  'Rua Santa Rita',
  'Rua Palmeiras',
  'Rua das Laranjeiras',
  'Avenida das Artes',
  'Rua da Paz',
  'Avenida dos Ipes',
];

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function padLeft(value, length) {
  return String(value).padStart(length, '0');
}

function makeCpf(seed) {
  const base = 10000000000 + seed;
  return String(base).slice(0, 11);
}

function makePhone(seed) {
  return `31${padLeft(900000000 + seed, 9)}`;
}

function makeDateOnly(date) {
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
}

function getRecentSchoolDays(count) {
  const days = [];
  const cursor = new Date();
  while (days.length < count) {
    cursor.setDate(cursor.getDate() - 1);
    const day = cursor.getDay();
    if (day === 0 || day === 6) continue;
    days.push(makeDateOnly(cursor));
  }
  return days;
}

function pickDifficultySubjects(seed) {
  const options = ['Matematica', 'Portugues', 'Ciencias', 'Historia', 'Geografia'];
  const count = (seed % 3) + 1;
  return options.slice(0, count);
}

function buildPersonName(index, firstNames) {
  const first = firstNames[index % firstNames.length];
  const last = LAST_NAMES[Math.floor(index / firstNames.length) % LAST_NAMES.length];
  const second =
    LAST_NAMES[Math.floor(index / (firstNames.length * LAST_NAMES.length)) % LAST_NAMES.length];
  return `${first} ${last} ${second}`.trim();
}

function buildAddress(index) {
  const street = STREET_NAMES[index % STREET_NAMES.length];
  const number = 20 + (index % 120);
  return `${street}, ${number} - Centro`;
}

async function clearTenantData(tenantId) {
  await prisma.presencas.deleteMany({ where: { tenantId } });
  await prisma.notas.deleteMany({ where: { tenantId } });
  await prisma.documentos.deleteMany({ where: { tenantId } });
  await prisma.documentosEscola.deleteMany({ where: { tenantId } });
  await prisma.avisos.deleteMany({ where: { tenantId } });
  await prisma.eventos.deleteMany({ where: { tenantId } });
  await prisma.alunoResponsavel.deleteMany({ where: { tenantId } });
  await prisma.alunos.deleteMany({ where: { tenantId } });
  await prisma.responsavel.deleteMany({ where: { tenantId } });
  await prisma.turmas.deleteMany({ where: { tenantId } });
  await prisma.user.deleteMany({ where: { tenantId } });
}

async function seedTenant() {
  const tenant = await prisma.tenant.upsert({
    where: { slug: TENANT_SLUG },
    update: {
      name: TENANT_NAME,
      active: true,
    },
    create: {
      name: TENANT_NAME,
      slug: TENANT_SLUG,
      active: true,
      logoUrl: '/uploads/demoeduk/branding/logo.png',
      loginBannerUrl: '/uploads/demoeduk/branding/login-banner.jpg',
      faviconUrl: '/uploads/demoeduk/branding/favicon.ico',
      defaultAvatarUrl: '/uploads/demoeduk/branding/default-avatar.png',
      themeColor: '#1e293b',
    },
  });

  await clearTenantData(tenant.id);

  const adminHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  const teacherHash = await bcrypt.hash(TEACHER_PASSWORD, 10);

  await prisma.user.createMany({
    data: [
      {
        tenantId: tenant.id,
        name: 'Administrador Demo',
        email: ADMIN_EMAIL,
        password: adminHash,
        role: 'ADMIN',
        active: true,
      },
      {
        tenantId: tenant.id,
        name: 'Professor Demo',
        email: TEACHER_EMAIL,
        password: teacherHash,
        role: 'USER',
        active: true,
      },
    ],
    skipDuplicates: true,
  });

  const turmas = await Promise.all([
    prisma.turmas.create({
      data: {
        tenantId: tenant.id,
        nomeTurma: '5A - Manhã',
        turno: 'Manhã',
        diasSemana: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'],
        horarioInicio: '08:00',
        horarioFim: '11:30',
        status: 'Ativa',
        maxAlunos: STUDENTS_PER_TURMA,
      },
    }),
    prisma.turmas.create({
      data: {
        tenantId: tenant.id,
        nomeTurma: '6B - Tarde',
        turno: 'Tarde',
        diasSemana: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'],
        horarioInicio: '13:30',
        horarioFim: '17:00',
        status: 'Ativa',
        maxAlunos: STUDENTS_PER_TURMA,
      },
    }),
  ]);

  const alunos = [];
  const alunoResponsavel = [];

  for (let turmaIndex = 0; turmaIndex < turmas.length; turmaIndex += 1) {
    const turma = turmas[turmaIndex];
    for (let i = 1; i <= STUDENTS_PER_TURMA; i += 1) {
      const studentIndex = turmaIndex * STUDENTS_PER_TURMA + i;
      const cpfAluno = makeCpf(1000 + studentIndex);
      const alunoNome = buildPersonName(studentIndex, STUDENT_FIRST_NAMES);
      const nascimento = new Date(2010 - turmaIndex, (i % 12), (i % 28) + 1);

      const aluno = await prisma.alunos.create({
        data: {
          tenantId: tenant.id,
          nomeCompleto: alunoNome,
          dataNascimento: nascimento,
          serieEscolar: turmaIndex === 0 ? '5º Ano' : '6º Ano',
          turno: turma.turno,
          fotoUrl: null,
          escola: 'Escola Demo Eduk',
          cpf: cpfAluno,
          endereco: buildAddress(studentIndex),
          alergias: studentIndex % 4 === 0 ? 'Lactose' : null,
          necessidadesEspeciais:
            studentIndex % 7 === 0 ? 'Acompanhamento pedagogico' : null,
          sangue: ['A+', 'B+', 'O+', 'AB+'][studentIndex % 4],
          dificuldade: studentIndex % 3 === 0 ? 'Matematica' : null,
          jaParticipouDeReforco: studentIndex % 2 === 0,
          medicamentos: studentIndex % 6 === 0 ? 'Vitamina' : null,
          laudosMedicos: studentIndex % 8 === 0 ? 'Laudo psicopedagogico' : null,
          observacoesComportamento:
            studentIndex % 5 === 0 ? 'Participativo' : null,
          desempenho:
            PERFORMANCE_INDICATORS[studentIndex % PERFORMANCE_INDICATORS.length],
          materiasDificuldade: pickDifficultySubjects(studentIndex),
          reacaoDificuldade:
            studentIndex % 3 === 0 ? 'Precisa de reforco' : null,
          status: studentIndex % 5 === 0 ? 'MATRICULADO' : 'ATIVO',
          turmas: {
            connect: { id: turma.id },
          },
        },
      });

      alunos.push(aluno);

      const guardiansCount = studentIndex % 4 === 0 ? 2 : 1;
      for (let g = 0; g < guardiansCount; g += 1) {
        const guardianIndex = studentIndex * 2 + g;
        const responsavel = await prisma.responsavel.create({
          data: {
            tenantId: tenant.id,
            nome: buildPersonName(guardianIndex, GUARDIAN_FIRST_NAMES),
            cpf: makeCpf(5000 + guardianIndex),
            telefone: makePhone(guardianIndex),
            email: `responsavel${padLeft(guardianIndex, 3)}@demoeduk.com`,
            endereco: buildAddress(guardianIndex),
          },
        });

        alunoResponsavel.push({
          tenantId: tenant.id,
          alunoId: aluno.id,
          responsavelId: responsavel.id,
          parentesco: g === 0 ? (studentIndex % 2 === 0 ? 'Mae' : 'Pai') : 'Tio',
        });
      }
    }
  }

  await prisma.alunoResponsavel.createMany({
    data: alunoResponsavel,
    skipDuplicates: true,
  });

  const datas = getRecentSchoolDays(8);
  const presencasData = [];
  const notasData = [];
  const documentosData = [];

  const turmaByAluno = new Map();
  for (const turma of turmas) {
    const turmaAlunos = await prisma.alunos.findMany({
      where: { tenantId: tenant.id, turmas: { some: { id: turma.id } } },
      select: { id: true },
    });
    turmaAlunos.forEach((aluno) => {
      turmaByAluno.set(aluno.id, turma.id);
    });
  }

  for (const aluno of alunos) {
    const turmaId = turmaByAluno.get(aluno.id) || null;
    for (const data of datas) {
      const presente = Math.random() > 0.1;
      const justificativa =
        !presente && Math.random() > 0.5 ? 'Justificado' : null;
      presencasData.push({
        tenantId: tenant.id,
        alunoId: aluno.id,
        data,
        turno: aluno.turno || 'Manhã',
        presente,
        justificativa,
        turmaId,
      });
    }

    for (let b = 1; b <= 4; b += 1) {
      notasData.push({
        tenantId: tenant.id,
        alunoId: aluno.id,
        disciplina: 'Matematica',
        bimestre: b,
        nota: randomBetween(6, 10),
        observacao: b % 2 === 0 ? 'Evolucao positiva' : null,
      });
      notasData.push({
        tenantId: tenant.id,
        alunoId: aluno.id,
        disciplina: 'Portugues',
        bimestre: b,
        nota: randomBetween(6, 10),
        observacao: b % 2 === 1 ? 'Boa participacao' : null,
      });
    }

    documentosData.push({
      tenantId: tenant.id,
      alunoId: aluno.id,
      nome: `Boletim ${aluno.nomeCompleto}`,
      tipo: 'BOLETIM',
      url: `/uploads/demoeduk/documentos/${aluno.id}-boletim.pdf`,
      anoLetivo: 2025,
      observacao: 'Documento de exemplo',
    });
    documentosData.push({
      tenantId: tenant.id,
      alunoId: aluno.id,
      nome: `Autorizacao ${aluno.nomeCompleto}`,
      tipo: 'AUTORIZACAO',
      url: `/uploads/demoeduk/documentos/${aluno.id}-autorizacao.pdf`,
      anoLetivo: 2025,
      observacao: 'Autorizacao de saida',
    });
  }

  await prisma.presencas.createMany({
    data: presencasData,
    skipDuplicates: true,
  });

  await prisma.notas.createMany({
    data: notasData,
    skipDuplicates: true,
  });

  await prisma.documentos.createMany({
    data: documentosData,
    skipDuplicates: true,
  });

  await prisma.documentosEscola.createMany({
    data: [
      {
        tenantId: tenant.id,
        nome: 'Calendario Escolar 2025',
        tipo: 'DECLARACAO',
        url: '/uploads/demoeduk/documentos-escola/calendario-2025.pdf',
        anoLetivo: 2025,
        observacao: 'Calendario oficial',
      },
      {
        tenantId: tenant.id,
        nome: 'Regulamento Interno',
        tipo: 'OUTRO',
        url: '/uploads/demoeduk/documentos-escola/regulamento.pdf',
        anoLetivo: 2025,
        observacao: 'Normas da escola',
      },
      {
        tenantId: tenant.id,
        nome: 'Declaracao de Matricula',
        tipo: 'DECLARACAO',
        url: '/uploads/demoeduk/documentos-escola/declaracao.pdf',
        anoLetivo: 2025,
        observacao: 'Documento institucional',
      },
    ],
    skipDuplicates: true,
  });

  await prisma.avisos.createMany({
    data: [
      {
        tenantId: tenant.id,
        titulo: 'Bem-vindos ao Demo Eduk',
        conteudo: 'Aviso inicial para demonstracao completa da plataforma.',
        data: new Date(),
        ativo: true,
        prioridade: 'alta',
      },
      {
        tenantId: tenant.id,
        titulo: 'Reuniao de Pais',
        conteudo: 'Reuniao marcada para proxima semana.',
        data: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        ativo: true,
        prioridade: 'normal',
      },
      {
        tenantId: tenant.id,
        titulo: 'Feira de Ciencias',
        conteudo: 'Preparem projetos para a feira de ciencias.',
        data: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        ativo: true,
        prioridade: 'baixa',
      },
    ],
    skipDuplicates: true,
  });

  await prisma.eventos.createMany({
    data: [
      {
        tenantId: tenant.id,
        titulo: 'Aula Inaugural',
        descricao: 'Abertura do semestre letivo.',
        dataInicio: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        dataFim: new Date(
          Date.now() + 1 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000,
        ),
        tipo: 'Evento',
        cor: '#2563eb',
      },
      {
        tenantId: tenant.id,
        titulo: 'Festival Cultural',
        descricao: 'Apresentacoes culturais dos alunos.',
        dataInicio: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        dataFim: new Date(
          Date.now() + 14 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000,
        ),
        tipo: 'Evento',
        cor: '#f59e0b',
      },
      {
        tenantId: tenant.id,
        titulo: 'Simulado Geral',
        descricao: 'Avaliacoes simuladas para todas as turmas.',
        dataInicio: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
        dataFim: new Date(
          Date.now() + 21 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000,
        ),
        tipo: 'Avaliacao',
        cor: '#10b981',
      },
    ],
    skipDuplicates: true,
  });

  console.log(`Tenant demo criado: ${tenant.slug} (${tenant.id})`);
  console.log(`Usuarios: ${ADMIN_EMAIL} / ${TEACHER_EMAIL}`);
}

async function run() {
  await seedTenant();
}

run()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
