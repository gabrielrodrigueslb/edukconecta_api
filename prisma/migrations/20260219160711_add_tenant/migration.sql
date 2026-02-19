/*
  Warnings:

  - A unique constraint covering the columns `[tenantId,alunoId,responsavelId]` on the table `AlunoResponsavel` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tenantId,cpf]` on the table `Alunos` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tenantId,matricula]` on the table `Alunos` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tenantId,alunoId,data,turno]` on the table `Presencas` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tenantId,cpf]` on the table `Responsavel` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tenantId,email]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `tenantId` to the `AlunoResponsavel` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenantId` to the `Alunos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenantId` to the `Avisos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenantId` to the `Documentos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenantId` to the `DocumentosEscola` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenantId` to the `Eventos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenantId` to the `Notas` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenantId` to the `Presencas` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenantId` to the `Responsavel` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenantId` to the `Turmas` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenantId` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "AlunoResponsavel_alunoId_responsavelId_key";

-- DropIndex
DROP INDEX "Alunos_cpf_idx";

-- DropIndex
DROP INDEX "Alunos_cpf_key";

-- DropIndex
DROP INDEX "Alunos_matricula_key";

-- DropIndex
DROP INDEX "Presencas_alunoId_data_turno_key";

-- DropIndex
DROP INDEX "Responsavel_cpf_key";

-- DropIndex
DROP INDEX "User_email_key";

-- AlterTable
ALTER TABLE "AlunoResponsavel" ADD COLUMN     "tenantId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Alunos" ADD COLUMN     "tenantId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Avisos" ADD COLUMN     "tenantId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Documentos" ADD COLUMN     "tenantId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "DocumentosEscola" ADD COLUMN     "tenantId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Eventos" ADD COLUMN     "tenantId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Notas" ADD COLUMN     "tenantId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Presencas" ADD COLUMN     "tenantId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Responsavel" ADD COLUMN     "tenantId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Turmas" ADD COLUMN     "tenantId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "tenantId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Tenant" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tenant_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_slug_key" ON "Tenant"("slug");

-- CreateIndex
CREATE INDEX "AlunoResponsavel_tenantId_idx" ON "AlunoResponsavel"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "AlunoResponsavel_tenantId_alunoId_responsavelId_key" ON "AlunoResponsavel"("tenantId", "alunoId", "responsavelId");

-- CreateIndex
CREATE INDEX "Alunos_tenantId_cpf_idx" ON "Alunos"("tenantId", "cpf");

-- CreateIndex
CREATE INDEX "Alunos_tenantId_idx" ON "Alunos"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Alunos_tenantId_cpf_key" ON "Alunos"("tenantId", "cpf");

-- CreateIndex
CREATE UNIQUE INDEX "Alunos_tenantId_matricula_key" ON "Alunos"("tenantId", "matricula");

-- CreateIndex
CREATE INDEX "Avisos_tenantId_idx" ON "Avisos"("tenantId");

-- CreateIndex
CREATE INDEX "Documentos_tenantId_idx" ON "Documentos"("tenantId");

-- CreateIndex
CREATE INDEX "DocumentosEscola_tenantId_idx" ON "DocumentosEscola"("tenantId");

-- CreateIndex
CREATE INDEX "Eventos_tenantId_idx" ON "Eventos"("tenantId");

-- CreateIndex
CREATE INDEX "Notas_tenantId_idx" ON "Notas"("tenantId");

-- CreateIndex
CREATE INDEX "Presencas_tenantId_idx" ON "Presencas"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Presencas_tenantId_alunoId_data_turno_key" ON "Presencas"("tenantId", "alunoId", "data", "turno");

-- CreateIndex
CREATE INDEX "Responsavel_tenantId_idx" ON "Responsavel"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Responsavel_tenantId_cpf_key" ON "Responsavel"("tenantId", "cpf");

-- CreateIndex
CREATE INDEX "Turmas_tenantId_idx" ON "Turmas"("tenantId");

-- CreateIndex
CREATE INDEX "User_tenantId_idx" ON "User"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "User_tenantId_email_key" ON "User"("tenantId", "email");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alunos" ADD CONSTRAINT "Alunos_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Responsavel" ADD CONSTRAINT "Responsavel_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlunoResponsavel" ADD CONSTRAINT "AlunoResponsavel_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Turmas" ADD CONSTRAINT "Turmas_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Presencas" ADD CONSTRAINT "Presencas_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Eventos" ADD CONSTRAINT "Eventos_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Avisos" ADD CONSTRAINT "Avisos_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Documentos" ADD CONSTRAINT "Documentos_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentosEscola" ADD CONSTRAINT "DocumentosEscola_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notas" ADD CONSTRAINT "Notas_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
