-- CreateTable
CREATE TABLE "Notas" (
    "id" TEXT NOT NULL,
    "disciplina" TEXT NOT NULL,
    "bimestre" INTEGER NOT NULL,
    "nota" DOUBLE PRECISION NOT NULL,
    "observacao" TEXT,
    "alunoId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Notas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Notas_alunoId_idx" ON "Notas"("alunoId");

-- AddForeignKey
ALTER TABLE "Notas" ADD CONSTRAINT "Notas_alunoId_fkey" FOREIGN KEY ("alunoId") REFERENCES "Alunos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
