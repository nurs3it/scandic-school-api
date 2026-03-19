import { Body, Controller, Get, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiCreatedResponse, ApiOkResponse } from '@nestjs/swagger';
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from './dto/create-application.dto';

@ApiTags('applications')
@Controller('applications')
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Get()
  @ApiOperation({ summary: 'List all enrollment inquiries' })
  @ApiOkResponse({ description: 'List of applications' })
  findAll() {
    return this.applicationsService.findAll();
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Submit enrollment inquiry' })
  @ApiCreatedResponse({ description: 'Application created successfully' })
  create(@Body() dto: CreateApplicationDto) {
    return this.applicationsService.create(dto);
  }
}
