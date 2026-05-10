-- TournamentRegistration: drop parentName & grade, add fideId & birthYear
ALTER TABLE "TournamentRegistration" DROP COLUMN IF EXISTS "parentName";
ALTER TABLE "TournamentRegistration" DROP COLUMN IF EXISTS "grade";
ALTER TABLE "TournamentRegistration" ADD COLUMN "fideId" TEXT;
ALTER TABLE "TournamentRegistration" ADD COLUMN "birthYear" INTEGER;
