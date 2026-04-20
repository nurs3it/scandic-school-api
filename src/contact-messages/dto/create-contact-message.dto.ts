import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsOptional,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateContactMessageDto {
  @ApiProperty({ description: 'Sender name', example: 'Иван Иванов' })
  @IsString()
  @IsNotEmpty({ message: 'name should not be empty' })
  @MinLength(2, { message: 'name must be at least 2 characters' })
  name: string;

  @ApiProperty({ description: 'Sender email', example: 'ivan@example.com' })
  @IsEmail({}, { message: 'email must be a valid email address' })
  @IsNotEmpty({ message: 'email should not be empty' })
  email: string;

  @ApiPropertyOptional({ description: 'Sender phone', example: '+7 777 123 4567' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ description: 'Message text', example: 'Здравствуйте, хотел бы узнать...' })
  @IsString()
  @IsNotEmpty({ message: 'message should not be empty' })
  @MinLength(5, { message: 'message must be at least 5 characters' })
  message: string;
}
