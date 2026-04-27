import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { PaymentMethod } from '@prisma/client';
import { StageDto } from './stage.dto';

export class CreateTournamentDto {
  @ApiProperty()
  @IsString() @MinLength(2) @MaxLength(200)
  title!: string;

  @ApiProperty()
  @IsString() @MinLength(10) @MaxLength(280)
  shortDescription!: string;

  @ApiProperty({ description: 'Markdown' })
  @IsString() @MinLength(1)
  description!: string;

  @ApiProperty()
  @IsUrl({ require_tld: false })
  bannerUrl!: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString() @MaxLength(120)
  ageGroup?: string;

  @ApiProperty({ description: 'ISO 8601' })
  @IsDateString()
  startDate!: string;

  @ApiProperty({ description: 'ISO 8601' })
  @IsDateString()
  endDate!: string;

  @ApiPropertyOptional({ description: 'ISO 8601' })
  @IsOptional() @IsDateString()
  registrationDeadline?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString() @MaxLength(200)
  location?: string;

  @ApiPropertyOptional({ type: [StageDto] })
  @IsOptional() @IsArray() @ArrayMaxSize(20)
  @ValidateNested({ each: true }) @Type(() => StageDto)
  stages?: StageDto[];

  @ApiPropertyOptional({ default: false })
  @IsOptional() @IsBoolean()
  isFree?: boolean;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional() @IsInt() @Min(0)
  price?: number;

  @ApiPropertyOptional({ enum: PaymentMethod, default: PaymentMethod.NONE })
  @IsOptional() @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;

  @ApiPropertyOptional()
  @IsOptional() @IsString() @MaxLength(40)
  kaspiPhone?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString() @IsUrl({ require_tld: false })
  kaspiQrUrl?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional() @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ default: true })
  @IsOptional() @IsBoolean()
  isRegistrationOpen?: boolean;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional() @IsInt() @Min(0)
  order?: number;

  @ApiPropertyOptional()
  @IsOptional() @IsInt()
  clubId?: number;

  @ApiPropertyOptional()
  @IsOptional() @IsString() @Matches(/^[a-z0-9-]+$/) @MaxLength(200)
  slug?: string;
}
