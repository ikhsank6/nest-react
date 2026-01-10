import { IsString, IsOptional, IsBoolean, IsInt, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateNewsDto {
  @ApiProperty({ description: 'News title' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'News slug (URL-friendly)' })
  @IsString()
  slug: string;

  @ApiPropertyOptional({ description: 'Short excerpt' })
  @IsOptional()
  @IsString()
  excerpt?: string;

  @ApiProperty({ description: 'Full content (HTML/Markdown)' })
  @IsString()
  content: string;

  @ApiPropertyOptional({ description: 'Featured image path' })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiProperty({ description: 'Category UUID' })
  @IsString()
  categoryUuid: string;

  @ApiPropertyOptional({ description: 'Is published', default: false })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}

export class UpdateNewsDto {
  @ApiPropertyOptional({ description: 'News title' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: 'News slug' })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiPropertyOptional({ description: 'Short excerpt' })
  @IsOptional()
  @IsString()
  excerpt?: string;

  @ApiPropertyOptional({ description: 'Full content' })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({ description: 'Featured image path' })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiPropertyOptional({ description: 'Category UUID' })
  @IsOptional()
  @IsString()
  categoryUuid?: string;

  @ApiPropertyOptional({ description: 'Is published' })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}
