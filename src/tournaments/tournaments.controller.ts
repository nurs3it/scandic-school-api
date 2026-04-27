import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { TournamentsService } from './tournaments.service';
import { TournamentQueryDto } from './dto/tournament-query.dto';

@ApiTags('tournaments')
@Controller('tournaments')
export class TournamentsController {
  constructor(private readonly tournaments: TournamentsService) {}

  @Get()
  @ApiOkResponse({ description: 'Paginated active tournaments list' })
  list(@Query() q: TournamentQueryDto) {
    return this.tournaments.findAllPublic(q);
  }

  @Get('age-groups')
  @ApiOkResponse({ description: 'Distinct ageGroup values from active tournaments' })
  ageGroups() {
    return this.tournaments.getDistinctAgeGroups();
  }

  @Get(':slug')
  @ApiOkResponse({ description: 'One active tournament by slug' })
  bySlug(@Param('slug') slug: string) {
    return this.tournaments.findBySlugPublic(slug);
  }
}
