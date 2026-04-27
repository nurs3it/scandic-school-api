import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { RegistrationStatus } from '@prisma/client';
import { IsDateString, IsEnum, IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class RegistrationsQueryDto {
  @ApiPropertyOptional()
  @IsOptional() @Type(() => Number) @IsInt()
  tournamentId?: number;

  @ApiPropertyOptional({ enum: RegistrationStatus })
  @IsOptional() @IsEnum(RegistrationStatus)
  status?: RegistrationStatus;

  @ApiPropertyOptional() @IsOptional() @IsDateString()
  from?: string;

  @ApiPropertyOptional() @IsOptional() @IsDateString()
  to?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString() @MaxLength(120)
  search?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional() @Type(() => Number) @IsInt() @Min(1)
  page?: number;

  @ApiPropertyOptional({ default: 50 })
  @IsOptional() @Type(() => Number) @IsInt() @Min(1)
  pageSize?: number;
}
