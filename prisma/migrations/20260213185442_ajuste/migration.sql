-- AlterTable
ALTER TABLE "Alunos" ALTER COLUMN "escola" DROP NOT NULL,
ALTER COLUMN "endereco" DROP NOT NULL,
ALTER COLUMN "jaParticipouDeReforco" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Responsavel" ALTER COLUMN "cpf" DROP NOT NULL;
