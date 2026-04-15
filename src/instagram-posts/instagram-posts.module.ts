import { Module } from '@nestjs/common';
import { InstagramPostsController } from './instagram-posts.controller';
import { InstagramPostsService } from './instagram-posts.service';

@Module({
  controllers: [InstagramPostsController],
  providers: [InstagramPostsService],
})
export class InstagramPostsModule {}
