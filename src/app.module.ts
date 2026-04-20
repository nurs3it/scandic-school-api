import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { ApplicationsModule } from './applications/applications.module';
import { ContactMessagesModule } from './contact-messages/contact-messages.module';
import { AdminModule } from './admin/admin.module';
import { InstagramPostsModule } from './instagram-posts/instagram-posts.module';
import { MerchModule } from './merch/merch.module';
import { MerchOrdersModule } from './merch-orders/merch-orders.module';
import { StorageModule } from './storage/storage.module';
import { NewsModule } from './news/news.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    StorageModule,
    ApplicationsModule,
    ContactMessagesModule,
    AdminModule,
    InstagramPostsModule,
    MerchModule,
    MerchOrdersModule,
    NewsModule,
  ],
})
export class AppModule {}
