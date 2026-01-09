import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateNotificationDto, NotificationType } from './dto';
import { NotificationResource } from './resources/notification.resource';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: CreateNotificationDto) {
    const notification = await this.prisma.notification.create({
      data: {
        toRoleId: createDto.toRoleId,
        fromUserId: createDto.fromUserId,
        message: createDto.message,
        detailUrl: createDto.detailUrl,
        referenceId: createDto.referenceId,
        type: createDto.type || NotificationType.INFO,
      },
    });

    return {
      message: 'Notifikasi berhasil dibuat.',
      data: new NotificationResource(notification),
    };
  }

  async findAllForRole(roleId: number, page = 1, limit = 10, unreadOnly = false, search?: string) {
    const skip = (page - 1) * limit;
    
    const where: any = {
      toRoleId: roleId,
      deletedAt: null,
    };

    if (unreadOnly) {
      where.isRead = false;
    }

    if (search) {
      where.message = {
        contains: search,
        mode: 'insensitive',
      };
    }

    const [notifications, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.notification.count({ where }),
    ]);

    const sanitized = NotificationResource.collection(notifications);

    return {
      message: 'Success',
      data: {
        notifications: sanitized,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
    };
  }

  async getUnreadCount(roleId: number) {
    const count = await this.prisma.notification.count({
      where: {
        toRoleId: roleId,
        isRead: false,
        deletedAt: null,
      },
    });

    return {
      message: 'Success',
      data: { count },
    };
  }

  async markAsRead(uuids: string[]) {
    await this.prisma.notification.updateMany({
      where: {
        uuid: { in: uuids },
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return {
      message: 'Notifikasi berhasil ditandai sebagai dibaca.',
      data: {},
    };
  }

  async markAllAsRead(roleId: number) {
    await this.prisma.notification.updateMany({
      where: {
        toRoleId: roleId,
        isRead: false,
        deletedAt: null,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return {
      message: 'Semua notifikasi berhasil ditandai sebagai dibaca.',
      data: {},
    };
  }

  async remove(uuid: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { uuid },
    });

    if (!notification) {
      throw new NotFoundException('Notifikasi tidak ditemukan.');
    }

    await this.prisma.notification.update({
      where: { uuid },
      data: { deletedAt: new Date() },
    });

    return {
      message: 'Notifikasi berhasil dihapus.',
      data: {},
    };
  }

}
