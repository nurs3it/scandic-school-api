import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { NewsModule } from '../news/news.module';

@Module({
  imports: [PrismaModule, NewsModule],
  controllers: [AdminController],
})
export class AdminModule {}
