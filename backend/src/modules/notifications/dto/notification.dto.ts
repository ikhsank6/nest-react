import { IsString, IsOptional, IsInt, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum NotificationType {
  INFO = 'info',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
}

export class CreateNotificationDto {
  @ApiProperty({ description: 'Target role ID to receive notification' })
  @IsInt()
  toRoleId: number;

  @ApiPropertyOptional({ description: 'User ID who triggered the notification' })
  @IsOptional()
  @IsInt()
  fromUserId?: number;

  @ApiProperty({ description: 'Notification message' })
  @IsString()
  message: string;

  @ApiPropertyOptional({ description: 'URL to navigate when clicked' })
  @IsOptional()
  @IsString()
  detailUrl?: string;

  @ApiPropertyOptional({ description: 'Reference ID (e.g., user UUID)' })
  @IsOptional()
  @IsString()
  referenceId?: string;

  @ApiPropertyOptional({ description: 'Notification type', enum: NotificationType, default: NotificationType.INFO })
  @IsOptional()
  @IsEnum(NotificationType)
  type?: NotificationType;
}

export class MarkAsReadDto {
  @ApiProperty({ description: 'Notification UUIDs to mark as read', type: [String] })
  @IsString({ each: true })
  uuids: string[];
}
