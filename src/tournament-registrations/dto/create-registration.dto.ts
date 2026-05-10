import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEmail,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

const KZ_PHONE = /^\+?7[\s\-()]*7\d{2}[\s\-()]*\d{3}[\s\-()]*\d{2}[\s\-()]*\d{2}$/;

export class CreateRegistrationDto {
  @ApiProperty()
  @IsString() @MinLength(2) @MaxLength(120)
  participantName!: string;

  @ApiProperty({ description: '+7 7XX XXX XX XX' })
  @IsString() @Matches(KZ_PHONE, { message: 'Телефон должен быть в формате +7 7XX XXX XX XX' })
  phone!: string;

  @ApiPropertyOptional()
  @IsOptional() @IsEmail()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString() @MaxLength(20)
  fideId?: string;

  @ApiPropertyOptional({ description: 'Дата рождения участника (YYYY-MM-DD)' })
  @IsOptional() @IsDateString()
  birthDate?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString() @MaxLength(2000)
  comment?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString() @MaxLength(2000)
  paymentNote?: string;
}
