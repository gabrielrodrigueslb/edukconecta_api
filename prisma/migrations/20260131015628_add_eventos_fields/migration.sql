-- AlterTable
ALTER TABLE "Eventos" ADD COLUMN     "cor" TEXT,
ADD COLUMN     "tipo" TEXT NOT NULL DEFAULT 'Evento';
