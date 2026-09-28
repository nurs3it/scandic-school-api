import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { NewsModule } from '../news/news.module';
import { ClubsModule } from '../clubs/clubs.module';
import { TournamentsModule } from '../tournaments/tournaments.module';
import { TournamentRegistrationsModule } from '../tournament-registrations/tournament-registrations.module';
import { AttestationModule } from '../attestation/attestation.module';

@Module({
  imports: [
    PrismaModule,
    NewsModule,
    ClubsModule,
    TournamentsModule,
    TournamentRegistrationsModule,
    AttestationModule,
  ],
  controllers: [AdminController],
})
export class AdminModule {}
