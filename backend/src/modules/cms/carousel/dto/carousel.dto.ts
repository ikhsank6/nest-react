import { IsString, IsOptional, IsBoolean, IsInt, IsUrl } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCarouselDto {
  @ApiProperty({ description: 'Carousel title' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ description: 'Carousel subtitle' })
  @IsOptional()
  @IsString()
  subtitle?: string;

  @ApiProperty({ description: 'Image path' })
  @IsString()
  image: string;

  @ApiPropertyOptional({ description: 'Link when clicked' })
  @IsOptional()
  @IsString()
  link?: string;

  @ApiPropertyOptional({ description: 'Display order', default: 0 })
  @IsOptional()
  @IsInt()
  order?: number;

  @ApiPropertyOptional({ description: 'Is active', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateCarouselDto {
  @ApiPropertyOptional({ description: 'Carousel title' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: 'Carousel subtitle' })
  @IsOptional()
  @IsString()
  subtitle?: string;

  @ApiPropertyOptional({ description: 'Image path' })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiPropertyOptional({ description: 'Link when clicked' })
  @IsOptional()
  @IsString()
  link?: string;

  @ApiPropertyOptional({ description: 'Display order' })
  @IsOptional()
  @IsInt()
  order?: number;

  @ApiPropertyOptional({ description: 'Is active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
