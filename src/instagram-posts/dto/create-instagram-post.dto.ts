import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsUrl } from 'class-validator';

export class CreateInstagramPostDto {
  @ApiProperty({ example: 'https://www.instagram.com/p/abc123/' })
  @IsUrl()
  url: string;

  @ApiPropertyOptional({ default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
