import { IsString, IsOptional, IsBoolean, IsInt, IsArray, ArrayMinSize, ValidateNested, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateCarouselDto {
  @ApiProperty({ description: 'Carousel title' })
  @IsString()
  title: string;

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

  @ApiPropertyOptional({ description: 'Display order', default: 0 })
  @IsOptional()
  @IsInt()
  order?: number;

  @ApiPropertyOptional({ description: 'Is active', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Media UUID' })
  @IsOptional()
  @IsString()
  mediaUuid?: string;
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

  @ApiPropertyOptional({ description: 'Media UUID' })
  @IsOptional()
  @IsString()
  mediaUuid?: string;
}

export class ReorderCarouselItemDto {
  @ApiProperty({ description: 'Carousel UUID' })
  @IsUUID('4', { message: 'uuid harus berupa UUID yang valid.' })
  uuid: string;

  @ApiProperty({ description: 'New order position' })
  @IsInt({ message: 'order harus berupa angka.' })
  order: number;
}

export class ReorderCarouselDto {
  @ApiProperty({ description: 'Array of items to reorder', type: [ReorderCarouselItemDto] })
  @IsArray({ message: 'Items harus berupa array.' })
  @ArrayMinSize(1, { message: 'Minimal harus ada 1 item untuk di-reorder.' })
  @ValidateNested({ each: true })
  @Type(() => ReorderCarouselItemDto)
  items: ReorderCarouselItemDto[];
}
