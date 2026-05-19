import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  Min,
} from 'class-validator';

export class WinnerDto {
  @ApiProperty()
  @IsInt() @Min(1)
  place!: number;

  @ApiPropertyOptional()
  @IsOptional() @IsString() @MaxLength(120)
  category?: string;

  @ApiProperty()
  @IsString() @MaxLength(200)
  name!: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString() @MaxLength(200)
  club?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString() @MaxLength(500)
  note?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString() @IsUrl({ require_tld: false })
  photoUrl?: string;
}

export class GalleryItemDto {
  @ApiProperty()
  @IsString() @IsUrl({ require_tld: false })
  url!: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString() @MaxLength(300)
  caption?: string;
}
