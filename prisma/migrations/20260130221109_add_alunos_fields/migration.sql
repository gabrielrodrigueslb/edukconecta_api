-- AlterTable
ALTER TABLE "Alunos" ADD COLUMN     "desempenho" TEXT,
ADD COLUMN     "laudosMedicos" TEXT,
ADD COLUMN     "materiasDificuldade" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "medicamentos" TEXT,
ADD COLUMN     "observacoesComportamento" TEXT,
ADD COLUMN     "reacaoDificuldade" TEXT,
ADD COLUMN     "turno" TEXT;
