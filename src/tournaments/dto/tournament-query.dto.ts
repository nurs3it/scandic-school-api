import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export enum TournamentStatusFilter {
  upcoming = 'upcoming',
  ongoing = 'ongoing',
  past = 'past',
}

export class TournamentQueryDto {
  @ApiPropertyOptional({ enum: TournamentStatusFilter })
  @IsOptional() @IsEnum(TournamentStatusFilter)
  status?: TournamentStatusFilter;

  @ApiPropertyOptional()
  @IsOptional() @Type(() => Number) @IsInt()
  clubId?: number;

  @ApiPropertyOptional()
  @IsOptional() @IsString() @MaxLength(120)
  ageGroup?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional() @Type(() => Number) @IsInt() @Min(1)
  page?: number;

  @ApiPropertyOptional({ default: 24 })
  @IsOptional() @Type(() => Number) @IsInt() @Min(1)
  pageSize?: number;
}
