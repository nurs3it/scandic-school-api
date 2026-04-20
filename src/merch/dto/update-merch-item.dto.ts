import { PartialType } from '@nestjs/swagger';
import { CreateMerchItemDto } from './create-merch-item.dto';

export class UpdateMerchItemDto extends PartialType(CreateMerchItemDto) {}
