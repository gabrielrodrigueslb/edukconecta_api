-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'USER');

-- CreateEnum
CREATE TYPE "StudentStatus" AS ENUM ('MATRICULADO', 'ATIVO', 'INATIVO');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('BOLETIM', 'LAUDO', 'AUTORIZACAO', 'DECLARACAO', 'MATRICULA', 'HISTORICO_ESCOLAR', 'OUTRO');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Alunos" (
    "id" TEXT NOT NULL,
    "nomeCompleto" TEXT NOT NULL,
    "dataNascimento" TIMESTAMP(3) NOT NULL,
    "serieEscolar" TEXT NOT NULL,
    "escola" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "endereco" TEXT NOT NULL,
    "alergias" TEXT,
    "necessidadesEspeciais" TEXT,
    "sangue" TEXT,
    "dificuldade" TEXT,
    "jaParticipouDeReforco" BOOLEAN NOT NULL DEFAULT false,
    "matricula" SERIAL NOT NULL,
    "status" "StudentStatus" NOT NULL DEFAULT 'MATRICULADO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Alunos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Responsavel" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "email" TEXT,
    "endereco" TEXT,

    CONSTRAINT "Responsavel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AlunoResponsavel" (
    "id" TEXT NOT NULL,
    "alunoId" TEXT NOT NULL,
    "responsavelId" TEXT NOT NULL,
    "parentesco" TEXT NOT NULL,

    CONSTRAINT "AlunoResponsavel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Turmas" (
    "id" SERIAL NOT NULL,
    "nomeTurma" TEXT NOT NULL,
    "turno" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Turmas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Presencas" (
    "id" SERIAL NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "presente" BOOLEAN NOT NULL DEFAULT true,
    "justificativa" TEXT,
    "alunoId" TEXT NOT NULL,
    "turmaId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Presencas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Eventos" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT,
    "dataInicio" TIMESTAMP(3) NOT NULL,
    "dataFim" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Eventos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Documentos" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "tipo" "DocumentType" NOT NULL,
    "url" TEXT NOT NULL,
    "anoLetivo" INTEGER,
    "observacao" TEXT,
    "alunoId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Documentos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_AlunosToTurmas" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_AlunosToTurmas_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Alunos_cpf_key" ON "Alunos"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "Alunos_matricula_key" ON "Alunos"("matricula");

-- CreateIndex
CREATE INDEX "Alunos_cpf_idx" ON "Alunos"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "Responsavel_cpf_key" ON "Responsavel"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "AlunoResponsavel_alunoId_responsavelId_key" ON "AlunoResponsavel"("alunoId", "responsavelId");

-- CreateIndex
CREATE UNIQUE INDEX "Presencas_alunoId_turmaId_data_key" ON "Presencas"("alunoId", "turmaId", "data");

-- CreateIndex
CREATE INDEX "_AlunosToTurmas_B_index" ON "_AlunosToTurmas"("B");

-- AddForeignKey
ALTER TABLE "AlunoResponsavel" ADD CONSTRAINT "AlunoResponsavel_alunoId_fkey" FOREIGN KEY ("alunoId") REFERENCES "Alunos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlunoResponsavel" ADD CONSTRAINT "AlunoResponsavel_responsavelId_fkey" FOREIGN KEY ("responsavelId") REFERENCES "Responsavel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Presencas" ADD CONSTRAINT "Presencas_alunoId_fkey" FOREIGN KEY ("alunoId") REFERENCES "Alunos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Presencas" ADD CONSTRAINT "Presencas_turmaId_fkey" FOREIGN KEY ("turmaId") REFERENCES "Turmas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Documentos" ADD CONSTRAINT "Documentos_alunoId_fkey" FOREIGN KEY ("alunoId") REFERENCES "Alunos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AlunosToTurmas" ADD CONSTRAINT "_AlunosToTurmas_A_fkey" FOREIGN KEY ("A") REFERENCES "Alunos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AlunosToTurmas" ADD CONSTRAINT "_AlunosToTurmas_B_fkey" FOREIGN KEY ("B") REFERENCES "Turmas"("id") ON DELETE CASCADE ON UPDATE CASCADE;
