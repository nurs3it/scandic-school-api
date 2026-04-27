import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { NewsModule } from '../news/news.module';
import { ClubsModule } from '../clubs/clubs.module';
import { TournamentsModule } from '../tournaments/tournaments.module';
import { TournamentRegistrationsModule } from '../tournament-registrations/tournament-registrations.module';

@Module({
  imports: [
    PrismaModule,
    NewsModule,
    ClubsModule,
    TournamentsModule,
    TournamentRegistrationsModule,
  ],
  controllers: [AdminController],
})
export class AdminModule {}
