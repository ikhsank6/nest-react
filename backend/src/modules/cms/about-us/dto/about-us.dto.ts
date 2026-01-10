import { IsString, IsOptional, IsBoolean, IsInt } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAboutUsDto {
    @ApiProperty({ description: 'Section identifier (e.g., vision, mission, history)' })
    @IsString()
    section: string;

    @ApiProperty({ description: 'Section title' })
    @IsString()
    title: string;

    @ApiProperty({ description: 'Content (HTML/Markdown)' })
    @IsString()
    content: string;

    @ApiPropertyOptional({ description: 'Image path' })
    @IsOptional()
    @IsString()
    image?: string;

    @ApiPropertyOptional({ description: 'Display order', default: 0 })
    @IsOptional()
    @IsInt()
    order?: number;

    @ApiPropertyOptional({ description: 'Is active', default: true })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}

export class UpdateAboutUsDto {
    @ApiPropertyOptional({ description: 'Section identifier' })
    @IsOptional()
    @IsString()
    section?: string;

    @ApiPropertyOptional({ description: 'Section title' })
    @IsOptional()
    @IsString()
    title?: string;

    @ApiPropertyOptional({ description: 'Content' })
    @IsOptional()
    @IsString()
    content?: string;

    @ApiPropertyOptional({ description: 'Image path' })
    @IsOptional()
    @IsString()
    image?: string;

    @ApiPropertyOptional({ description: 'Display order' })
    @IsOptional()
    @IsInt()
    order?: number;

    @ApiPropertyOptional({ description: 'Is active' })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}
