import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateClubDto {
  @ApiProperty()
  @IsString() @MinLength(2) @MaxLength(120)
  name!: string;

  @ApiProperty()
  @IsString() @MinLength(10) @MaxLength(280)
  shortDescription!: string;

  @ApiProperty({ description: 'Markdown' })
  @IsString() @MinLength(1)
  description!: string;

  @ApiProperty()
  @IsUrl({ require_tld: false })
  image!: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString() @MaxLength(120)
  ageRange?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString() @MaxLength(280)
  schedule?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString() @MaxLength(120)
  teacher?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional() @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional() @IsInt() @Min(0)
  order?: number;

  @ApiPropertyOptional()
  @IsOptional() @IsString() @Matches(/^[a-z0-9-]+$/) @MaxLength(200)
  slug?: string;
}
