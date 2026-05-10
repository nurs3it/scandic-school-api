import {
  Body, Controller, Get, Param, Post, Query, UploadedFile, UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ApiConsumes, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { TournamentsService } from './tournaments.service';
import { TournamentQueryDto } from './dto/tournament-query.dto';
import { TournamentRegistrationsService } from '../tournament-registrations/tournament-registrations.service';
import { CreateRegistrationDto } from '../tournament-registrations/dto/create-registration.dto';

const RECEIPT_UPLOAD = {
  storage: memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (
    _req: any,
    file: Express.Multer.File,
    cb: (err: Error | null, ok: boolean) => void,
  ) => {
    const ok = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'].includes(
      file.mimetype,
    );
    cb(ok ? null : new Error(`Недопустимый тип файла: ${file.mimetype}`), ok);
  },
};

@ApiTags('tournaments')
@Controller('tournaments')
export class TournamentsController {
  constructor(
    private readonly tournaments: TournamentsService,
    private readonly registrations: TournamentRegistrationsService,
  ) {}

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

  @Get(':slug/registrations')
  @ApiOkResponse({ description: 'Public paginated list of registrations for a tournament' })
  listRegistrations(
    @Param('slug') slug: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    const p = Math.max(1, page ? parseInt(page, 10) || 1 : 1);
    const ps = Math.min(200, Math.max(1, pageSize ? parseInt(pageSize, 10) || 200 : 200));
    return this.registrations.listPublicBySlug(slug, p, ps);
  }

  @Post(':slug/register')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('receipt', RECEIPT_UPLOAD))
  register(
    @Param('slug') slug: string,
    @Body() dto: CreateRegistrationDto,
    @UploadedFile() receipt?: Express.Multer.File,
  ) {
    return this.registrations.createForSlug(slug, dto, receipt);
  }
}
