-- AlterTable: add tournament recap fields
ALTER TABLE "Tournament"
  ADD COLUMN "recapSummary" TEXT,
  ADD COLUMN "winners" JSONB NOT NULL DEFAULT '[]',
  ADD COLUMN "gallery" JSONB NOT NULL DEFAULT '[]';
