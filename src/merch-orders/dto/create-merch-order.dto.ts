import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsInt,
  IsArray,
  IsOptional,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class OrderItemDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsInt()
  @Min(0)
  price: number;

  @ApiProperty()
  @IsInt()
  @Min(1)
  quantity: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  selectedSize?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  selectedColor?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  image?: string;
}

export class CreateMerchOrderDto {
  @ApiProperty({ example: 'Иванов Иван' })
  @IsString()
  @IsNotEmpty()
  parentName: string;

  @ApiProperty({ example: 'Иванов Петя, Иванова Маша' })
  @IsString()
  @IsNotEmpty()
  childrenNames: string;

  @ApiProperty({ example: '77001234567' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ type: [OrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @ApiProperty({ example: 24000 })
  @IsInt()
  @Min(0)
  total: number;
}
