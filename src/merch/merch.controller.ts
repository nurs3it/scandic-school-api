import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
} from '@nestjs/swagger';
import { MerchService } from './merch.service';
import { CreateMerchItemDto } from './dto/create-merch-item.dto';
import { UpdateMerchItemDto } from './dto/update-merch-item.dto';

@ApiTags('merch')
@Controller('merch')
export class MerchController {
  constructor(private readonly service: MerchService) {}

  @Get()
  @ApiOperation({ summary: 'List all merch items ordered by order field' })
  @ApiOkResponse({ description: 'List of merch items' })
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get merch item by id' })
  @ApiOkResponse({ description: 'Merch item' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create merch item' })
  @ApiCreatedResponse({ description: 'Merch item created' })
  create(@Body() dto: CreateMerchItemDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update merch item' })
  @ApiOkResponse({ description: 'Merch item updated' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateMerchItemDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete merch item' })
  @ApiNoContentResponse({ description: 'Merch item deleted' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
