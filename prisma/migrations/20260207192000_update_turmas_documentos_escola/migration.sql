-- Drop column serieEscolar from Turmas
ALTER TABLE "Turmas" DROP COLUMN "serieEscolar";

-- CreateTable
CREATE TABLE "DocumentosEscola" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "tipo" "DocumentType" NOT NULL,
    "url" TEXT NOT NULL,
    "anoLetivo" INTEGER,
    "observacao" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DocumentosEscola_pkey" PRIMARY KEY ("id")
);
