import { Module } from '@nestjs/common';
import { TournamentRegistrationsService } from './tournament-registrations.service';
import { MailModule } from '../mail/mail.module';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [MailModule, StorageModule],
  providers: [TournamentRegistrationsService],
  exports: [TournamentRegistrationsService],
})
export class TournamentRegistrationsModule {}
