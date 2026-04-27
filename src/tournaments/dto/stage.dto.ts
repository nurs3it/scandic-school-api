import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class StageDto {
  @ApiProperty()
  @IsString() @MinLength(1) @MaxLength(200)
  title!: string;

  @ApiProperty({ description: 'ISO 8601 date' })
  @IsDateString()
  date!: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString() @MaxLength(2000)
  description?: string;
}
