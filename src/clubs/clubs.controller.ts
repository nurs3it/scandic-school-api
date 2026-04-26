import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ClubsService } from './clubs.service';

@ApiTags('clubs')
@Controller('clubs')
export class ClubsController {
  constructor(private readonly clubs: ClubsService) {}

  @Get()
  @ApiOkResponse({ description: 'Active clubs list' })
  list(@Query('withTournaments') withTournaments?: string) {
    return this.clubs.findAllPublic({
      withTournaments: withTournaments === '1' || withTournaments === 'true',
    });
  }

  @Get(':slug')
  @ApiOkResponse({ description: 'One active club by slug, with tournaments' })
  bySlug(@Param('slug') slug: string) {
    return this.clubs.findBySlugPublic(slug);
  }
}
