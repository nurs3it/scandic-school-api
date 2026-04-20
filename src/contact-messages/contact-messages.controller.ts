import {
  Body,
  Controller,
  Get,
  Post,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiCreatedResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import { ContactMessagesService } from './contact-messages.service';
import { CreateContactMessageDto } from './dto/create-contact-message.dto';

@ApiTags('contact-messages')
@Controller('contact-messages')
export class ContactMessagesController {
  constructor(private readonly service: ContactMessagesService) {}

  @Get()
  @ApiOperation({ summary: 'List all contact messages' })
  @ApiOkResponse({ description: 'List of contact messages' })
  findAll() {
    return this.service.findAll();
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Submit a contact message' })
  @ApiCreatedResponse({ description: 'Contact message created successfully' })
  create(@Body() dto: CreateContactMessageDto) {
    return this.service.create(dto);
  }
}
