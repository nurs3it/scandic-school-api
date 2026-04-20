import { Module } from '@nestjs/common';
import { MailModule } from '../mail/mail.module';
import { MerchOrdersController } from './merch-orders.controller';
import { MerchOrdersService } from './merch-orders.service';

@Module({
  imports: [MailModule],
  controllers: [MerchOrdersController],
  providers: [MerchOrdersService],
})
export class MerchOrdersModule {}
