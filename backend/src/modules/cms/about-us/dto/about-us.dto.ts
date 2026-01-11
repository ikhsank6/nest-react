import { IsString, IsOptional, IsBoolean, IsEmail, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateAboutUsDto {
    @ApiProperty({ description: 'Company name' })
    @IsString()
    companyName: string;

    @ApiProperty({ description: 'Company description' })
    @IsString()
    description: string;

    @ApiPropertyOptional({ description: 'Address' })
    @IsOptional()
    @IsString()
    address?: string;

    @ApiPropertyOptional({ description: 'Phone number' })
    @IsOptional()
    @IsString()
    phone?: string;

    @ApiPropertyOptional({ description: 'Email' })
    @IsOptional()
    @IsEmail()
    email?: string;

    @ApiPropertyOptional({ description: 'WhatsApp number' })
    @IsOptional()
    @IsString()
    whatsapp?: string;

    @ApiPropertyOptional({ description: 'Facebook URL' })
    @IsOptional()
    @IsString()
    facebook?: string;

    @ApiPropertyOptional({ description: 'Instagram URL' })
    @IsOptional()
    @IsString()
    instagram?: string;

    @ApiPropertyOptional({ description: 'Twitter/X URL' })
    @IsOptional()
    @IsString()
    twitter?: string;

    @ApiPropertyOptional({ description: 'YouTube URL' })
    @IsOptional()
    @IsString()
    youtube?: string;

    @ApiPropertyOptional({ description: 'LinkedIn URL' })
    @IsOptional()
    @IsString()
    linkedin?: string;

    @ApiPropertyOptional({ description: 'Latitude coordinate' })
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    latitude?: number;

    @ApiPropertyOptional({ description: 'Longitude coordinate' })
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    longitude?: number;

    @ApiPropertyOptional({ description: 'Google Maps URL' })
    @IsOptional()
    @IsString()
    mapsUrl?: string;

    @ApiPropertyOptional({ description: 'Logo path' })
    @IsOptional()
    @IsString()
    logo?: string;

    @ApiPropertyOptional({ description: 'Media UUID for logo' })
    @IsOptional()
    @IsString()
    mediaUuid?: string;

    @ApiPropertyOptional({ description: 'Is active', default: true })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}

export class UpdateAboutUsDto {
    @ApiPropertyOptional({ description: 'Company name' })
    @IsOptional()
    @IsString()
    companyName?: string;

    @ApiPropertyOptional({ description: 'Company description' })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiPropertyOptional({ description: 'Address' })
    @IsOptional()
    @IsString()
    address?: string;

    @ApiPropertyOptional({ description: 'Phone number' })
    @IsOptional()
    @IsString()
    phone?: string;

    @ApiPropertyOptional({ description: 'Email' })
    @IsOptional()
    @IsEmail()
    email?: string;

    @ApiPropertyOptional({ description: 'WhatsApp number' })
    @IsOptional()
    @IsString()
    whatsapp?: string;

    @ApiPropertyOptional({ description: 'Facebook URL' })
    @IsOptional()
    @IsString()
    facebook?: string;

    @ApiPropertyOptional({ description: 'Instagram URL' })
    @IsOptional()
    @IsString()
    instagram?: string;

    @ApiPropertyOptional({ description: 'Twitter/X URL' })
    @IsOptional()
    @IsString()
    twitter?: string;

    @ApiPropertyOptional({ description: 'YouTube URL' })
    @IsOptional()
    @IsString()
    youtube?: string;

    @ApiPropertyOptional({ description: 'LinkedIn URL' })
    @IsOptional()
    @IsString()
    linkedin?: string;

    @ApiPropertyOptional({ description: 'Latitude coordinate' })
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    latitude?: number;

    @ApiPropertyOptional({ description: 'Longitude coordinate' })
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    longitude?: number;

    @ApiPropertyOptional({ description: 'Google Maps URL' })
    @IsOptional()
    @IsString()
    mapsUrl?: string;

    @ApiPropertyOptional({ description: 'Logo path' })
    @IsOptional()
    @IsString()
    logo?: string;

    @ApiPropertyOptional({ description: 'Media UUID for logo' })
    @IsOptional()
    @IsString()
    mediaUuid?: string;

    @ApiPropertyOptional({ description: 'Is active' })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}
