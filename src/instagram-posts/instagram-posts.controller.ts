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
import { ApiTags, ApiOperation, ApiOkResponse, ApiCreatedResponse, ApiNoContentResponse } from '@nestjs/swagger';
import { InstagramPostsService } from './instagram-posts.service';
import { CreateInstagramPostDto } from './dto/create-instagram-post.dto';
import { UpdateInstagramPostDto } from './dto/update-instagram-post.dto';

@ApiTags('instagram-posts')
@Controller('instagram-posts')
export class InstagramPostsController {
  constructor(private readonly service: InstagramPostsService) {}

  @Get()
  @ApiOperation({ summary: 'List active instagram posts ordered by order field' })
  @ApiOkResponse({ description: 'List of instagram posts' })
  findAll() {
    return this.service.findAll();
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create instagram post' })
  @ApiCreatedResponse({ description: 'Instagram post created' })
  create(@Body() dto: CreateInstagramPostDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update instagram post' })
  @ApiOkResponse({ description: 'Instagram post updated' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateInstagramPostDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete instagram post' })
  @ApiNoContentResponse({ description: 'Instagram post deleted' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
