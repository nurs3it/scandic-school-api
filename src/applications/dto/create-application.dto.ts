import { IsString, IsNotEmpty, IsIn, Matches, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateApplicationDto {
  @ApiProperty({ description: 'Parent full name', example: 'Иванов Иван Иванович' })
  @IsString()
  @IsNotEmpty({ message: 'parentName should not be empty' })
  @MinLength(2, { message: 'parentName must be at least 2 characters' })
  parentName: string;

  @ApiProperty({ enum: ['1', '2', '3', '4'], description: 'Grade applying for' })
  @IsIn(['1', '2', '3', '4'], { message: 'grade must be one of: 1, 2, 3, 4' })
  grade: string;

  @ApiProperty({ enum: ['kazakh', 'russian'], description: 'Language of instruction' })
  @IsIn(['kazakh', 'russian'], { message: 'language must be kazakh or russian' })
  language: string;

  @ApiProperty({ description: 'Parent phone number', example: '+7 (777) 123-45-67' })
  @IsString()
  @IsNotEmpty({ message: 'parentPhone should not be empty' })
  @Matches(/^\+7\s?\(?\d{3}\)?\s?\d{3}[-\s]?\d{2}[-\s]?\d{2}$/, {
    message: 'parentPhone must be a valid Kazakhstan phone number',
  })
  parentPhone: string;
}
