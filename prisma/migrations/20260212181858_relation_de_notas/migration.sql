-- DropForeignKey
ALTER TABLE "Notas" DROP CONSTRAINT "Notas_alunoId_fkey";

-- AddForeignKey
ALTER TABLE "Notas" ADD CONSTRAINT "Notas_alunoId_fkey" FOREIGN KEY ("alunoId") REFERENCES "Alunos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
