/*
  Warnings:

  - A unique constraint covering the columns `[alunoId,data,turno]` on the table `Presencas` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `turno` to the `Presencas` table without a default value. This is not possible if the table is not empty.
  - Added the required column `serieEscolar` to the `Turmas` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Presencas" DROP CONSTRAINT "Presencas_turmaId_fkey";

-- DropIndex
DROP INDEX "Presencas_alunoId_turmaId_data_key";

-- AlterTable
ALTER TABLE "Presencas" ADD COLUMN     "turno" TEXT NOT NULL,
ALTER COLUMN "turmaId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Turmas" ADD COLUMN     "diasSemana" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "horarioFim" TEXT,
ADD COLUMN     "horarioInicio" TEXT,
ADD COLUMN     "maxAlunos" INTEGER NOT NULL DEFAULT 15,
ADD COLUMN     "serieEscolar" TEXT NOT NULL,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'Ativa';

-- CreateIndex
CREATE UNIQUE INDEX "Presencas_alunoId_data_turno_key" ON "Presencas"("alunoId", "data", "turno");

-- AddForeignKey
ALTER TABLE "Presencas" ADD CONSTRAINT "Presencas_turmaId_fkey" FOREIGN KEY ("turmaId") REFERENCES "Turmas"("id") ON DELETE SET NULL ON UPDATE CASCADE;
