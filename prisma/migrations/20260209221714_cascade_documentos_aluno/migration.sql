-- DropForeignKey
ALTER TABLE "Documentos" DROP CONSTRAINT "Documentos_alunoId_fkey";

-- AddForeignKey
ALTER TABLE "Documentos" ADD CONSTRAINT "Documentos_alunoId_fkey" FOREIGN KEY ("alunoId") REFERENCES "Alunos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
