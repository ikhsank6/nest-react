import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { hashPassword } from '../../common/utils/hash.util';
import { buildPaginatedResponse, calculateSkip } from '../../common/utils/pagination.util';
import { QueueService } from '../queue/queue.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/dto';
import { v4 as uuidv4 } from 'uuid';
import { UserResource } from './resources/user.resource';


@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private queueService: QueueService,
    private notificationsService: NotificationsService,
  ) { }

  async findAll(page = 1, limit = 10, search?: string, isActive?: boolean) {
    const skip = calculateSkip(page, limit);

    const where: any = { deletedAt: null };

    // Apply search filter
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Apply isActive filter
    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        include: { role: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return buildPaginatedResponse(
      UserResource.collection(users),
      total,
      page,
      limit,
    );
  }

  async findOne(uuid: string) {
    const user = await this.prisma.user.findFirst({
      where: { uuid, deletedAt: null },
      include: { role: true },
    });

    if (!user) {
      throw new NotFoundException('User tidak ditemukan.');
    }

    return { message: 'Success', data: new UserResource(user) };
  }

  async findById(id: number) {
    const user = await this.prisma.user.findFirst({
      where: { id, deletedAt: null },
      include: { role: true },
    });

    if (!user) {
      throw new NotFoundException('User tidak ditemukan.');
    }

    return { message: 'Success', data: new UserResource(user) };
  }

  async create(createUserDto: CreateUserDto, currentUserId?: number) {
    return this.prisma.$transaction(async (prisma) => {
      const existingUser = await prisma.user.findFirst({
        where: { email: createUserDto.email, deletedAt: null },
      });

      if (existingUser) {
        throw new BadRequestException('Email sudah terdaftar.');
      }

      // Handle roleUuid -> roleId conversion
      let roleId = createUserDto.roleId;
      if (createUserDto.roleUuid && !roleId) {
        const role = await prisma.role.findFirst({
          where: { uuid: createUserDto.roleUuid, deletedAt: null },
        });
        if (!role) {
          throw new BadRequestException('Role tidak ditemukan.');
        }
        roleId = role.id;
      }

      if (!roleId) {
        throw new BadRequestException('roleId atau roleUuid harus diisi.');
      }

      const isActive = createUserDto.isActive ?? false;
      let temporaryPassword: string | undefined = undefined;
      let passwordToHash = createUserDto.password;

      if (!passwordToHash) {
        // Generate random 12-character password
        temporaryPassword = Math.random().toString(36).slice(-8) +
          Math.random().toString(36).toUpperCase().slice(-2) +
          "@1"; // Simple safe generation for example
        passwordToHash = temporaryPassword;
      }

      const hashedPassword = await hashPassword(passwordToHash);

      // Generate verification token if user is not active
      const verificationToken = !isActive ? uuidv4() : null;

      const { roleUuid, ...dataWithoutRoleUuid } = createUserDto;
      const user = await prisma.user.create({
        data: {
          ...dataWithoutRoleUuid,
          roleId,
          password: hashedPassword,
          isActive,
          // Only set verifiedAt if user is active
          verifiedAt: isActive ? new Date() : null,
          verificationToken,
        },
        include: { role: true },
      });

      // Send verification email if user is not active
      if (!isActive && verificationToken) {
        await this.queueService.addVerificationEmailJob({
          email: user.email,
          name: user.name,
          verificationToken,
          createdAt: user.createdAt.toISOString(),
          temporaryPassword, // Pass the raw password here to be sent in email
        });
      }

      // Create notification for Admin role
      try {
        const adminRole = await prisma.role.findFirst({
          where: { name: 'Admin', deletedAt: null },
        });

        if (adminRole) {
          await this.notificationsService.create({
            toRoleId: adminRole.id,
            fromUserId: currentUserId,
            message: `User baru telah didaftarkan: ${user.name}`,
            detailUrl: `/users`,
            referenceId: user.uuid,
            type: NotificationType.INFO,
          }, prisma); // Passing transaction client
        }
      } catch (error) {
        // Don't fail the user creation if notification fails
        console.error('Failed to create notification:', error);
      }

      return {
        message: isActive
          ? 'User berhasil dibuat.'
          : 'User berhasil dibuat. Email verifikasi telah dikirim.',
        data: new UserResource(user)
      };
    });
  }

  async update(uuid: string, updateUserDto: UpdateUserDto) {
    return this.prisma.$transaction(async (prisma) => {
      const existing = await prisma.user.findFirst({
        where: { uuid, deletedAt: null },
      });

      if (!existing) {
        throw new NotFoundException('User tidak ditemukan.');
      }

      if (updateUserDto.email) {
        const existingUser = await prisma.user.findFirst({
          where: { email: updateUserDto.email, id: { not: existing.id }, deletedAt: null },
        });
        if (existingUser) {
          throw new BadRequestException('Email sudah digunakan.');
        }
      }

      // Handle roleUuid -> roleId conversion
      let roleId = updateUserDto.roleId;
      if (updateUserDto.roleUuid && !roleId) {
        const role = await prisma.role.findFirst({
          where: { uuid: updateUserDto.roleUuid, deletedAt: null },
        });
        if (!role) {
          throw new BadRequestException('Role tidak ditemukan.');
        }
        roleId = role.id;
      }

      const { roleUuid, ...dataWithoutRoleUuid } = updateUserDto;
      const data: any = { ...dataWithoutRoleUuid };

      if (roleId) {
        data.roleId = roleId;
      }

      if (updateUserDto.password) {
        data.password = await hashPassword(updateUserDto.password);
      }

      const user = await prisma.user.update({
        where: { id: existing.id },
        data,
        include: { role: true },
      });

      return { message: 'User berhasil diupdate.', data: new UserResource(user) };
    });
  }

  async remove(uuid: string) {
    return this.prisma.$transaction(async (prisma) => {
      const existing = await prisma.user.findFirst({
        where: { uuid, deletedAt: null },
      });

      if (!existing) {
        throw new NotFoundException('User tidak ditemukan.');
      }

      // Soft delete
      await prisma.user.update({
        where: { id: existing.id },
        data: { deletedAt: new Date() },
      });

      return { message: 'User berhasil dihapus.', data: {} };
    });
  }

  async resendVerificationEmail(uuid: string) {
    return this.prisma.$transaction(async (prisma) => {
      const user = await prisma.user.findFirst({
        where: { uuid, deletedAt: null },
      });

      if (!user) {
        throw new NotFoundException('User tidak ditemukan.');
      }

      if (user.verifiedAt) {
        throw new BadRequestException('User sudah terverifikasi.');
      }

      // Generate new verification token
      const verificationToken = uuidv4();

      await prisma.user.update({
        where: { id: user.id },
        data: { verificationToken },
      });

      // Queue verification email
      await this.queueService.addVerificationEmailJob({
        email: user.email,
        name: user.name,
        verificationToken,
        createdAt: user.createdAt.toISOString(),
      });

      return {
        message: 'Email verifikasi telah dikirim ulang.',
        data: {}
      };
    });
  }
}
