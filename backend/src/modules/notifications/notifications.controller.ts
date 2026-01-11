import { Controller, Get, Post, Body, Param, Delete, Query, UseGuards, Request, ParseIntPipe, HttpCode } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto, MarkAsReadDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('1. System : Notifications')
@ApiBearerAuth('JWT-auth')
@Controller('notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) { }

  @Post()
  @HttpCode(200)
  @Roles('Admin')
  @ApiOperation({ summary: 'Create a new notification' })
  async create(@Body() createDto: CreateNotificationDto) {
    return this.notificationsService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get notifications for current user role' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'unreadOnly', required: false, type: Boolean })
  @ApiQuery({ name: 'search', required: false, type: String })
  async findAll(
    @Request() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('unreadOnly') unreadOnly?: string,
    @Query('search') search?: string,
  ) {
    const roleId = req.user?.role?.id;
    return this.notificationsService.findAllForRole(
      roleId,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10,
      unreadOnly === 'true',
      search,
    );
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get unread notification count for current user role' })
  async getUnreadCount(@Request() req: any) {
    const roleId = req.user?.role?.id;
    return this.notificationsService.getUnreadCount(roleId);
  }

  @Post('mark-read')
  @HttpCode(200)
  @ApiOperation({ summary: 'Mark notifications as read' })
  async markAsRead(@Body() markAsReadDto: MarkAsReadDto) {
    return this.notificationsService.markAsRead(markAsReadDto.uuids);
  }

  @Post('mark-all-read')
  @HttpCode(200)
  @ApiOperation({ summary: 'Mark all notifications as read for current user role' })
  async markAllAsRead(@Request() req: any) {
    const roleId = req.user?.role?.id;
    return this.notificationsService.markAllAsRead(roleId);
  }

  @Delete(':uuid')
  @ApiOperation({ summary: 'Delete a notification' })
  async remove(@Param('uuid') uuid: string) {
    return this.notificationsService.remove(uuid);
  }
}
