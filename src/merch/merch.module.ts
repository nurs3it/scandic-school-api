import { Module } from '@nestjs/common';
import { MerchController } from './merch.controller';
import { MerchService } from './merch.service';

@Module({
  controllers: [MerchController],
  providers: [MerchService],
})
export class MerchModule {}
