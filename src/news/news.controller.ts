import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { NewsService } from './news.service';
import { NewsQueryDto } from './dto/news-query.dto';

@ApiTags('news')
@Controller('news')
export class NewsController {
  constructor(private readonly news: NewsService) {}

  @Get()
  @ApiOkResponse({ description: 'Paginated active news list' })
  list(@Query() q: NewsQueryDto) {
    return this.news.findAllPublic(q);
  }

  @Get('tags')
  @ApiOkResponse({ description: 'All distinct tags from active news' })
  tags() {
    return this.news.getAllTags();
  }

  @Get(':slug')
  @ApiOkResponse({ description: 'One active news article by slug' })
  bySlug(@Param('slug') slug: string) {
    return this.news.findBySlugPublic(slug);
  }
}
