-- TournamentRegistration: replace birthYear with birthDate
ALTER TABLE "TournamentRegistration" DROP COLUMN IF EXISTS "birthYear";
ALTER TABLE "TournamentRegistration" ADD COLUMN "birthDate" DATE;
