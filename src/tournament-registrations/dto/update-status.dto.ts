import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RegistrationStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateStatusDto {
  @ApiProperty({ enum: RegistrationStatus })
  @IsEnum(RegistrationStatus)
  status!: RegistrationStatus;

  @ApiPropertyOptional()
  @IsOptional() @IsString() @MaxLength(2000)
  adminNote?: string;
}
