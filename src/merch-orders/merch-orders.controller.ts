import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { MerchOrdersService } from './merch-orders.service';
import { CreateMerchOrderDto } from './dto/create-merch-order.dto';

@ApiTags('merch-orders')
@Controller('merch-orders')
export class MerchOrdersController {
  constructor(private readonly merchOrdersService: MerchOrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a merch order' })
  create(@Body() dto: CreateMerchOrderDto) {
    return this.merchOrdersService.create(dto);
  }
}
