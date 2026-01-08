import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { hashPassword } from '../../common/utils/hash.util';
import { excludeFields } from '../../common/utils/sanitize.util';
import { buildPaginatedResponse, calculateSkip } from '../../common/utils/pagination.util';

// Sanitize user object - remove id, password, and roleId; sanitize nested role
function sanitizeUser(user: any) {
  const { id, password, roleId, role, ...rest } = user;
  return {
    ...rest,
    role: role ? excludeFields(role, ['id', 'deletedAt']) : null,
  };
}

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(page = 1, limit = 10) {
    const skip = calculateSkip(page, limit);
    
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where: { deletedAt: null },
        skip,
        take: limit,
        include: { role: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where: { deletedAt: null } }),
    ]);

    return buildPaginatedResponse(
      users.map(sanitizeUser),
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

    return { message: 'Success', data: sanitizeUser(user) };
  }

  async findById(id: number) {
    const user = await this.prisma.user.findFirst({
      where: { id, deletedAt: null },
      include: { role: true },
    });

    if (!user) {
      throw new NotFoundException('User tidak ditemukan.');
    }

    return { message: 'Success', data: sanitizeUser(user) };
  }

  async create(createUserDto: CreateUserDto) {
    const existingUser = await this.prisma.user.findFirst({
      where: { email: createUserDto.email, deletedAt: null },
    });

    if (existingUser) {
      throw new BadRequestException('Email sudah terdaftar.');
    }

    const hashedPassword = await hashPassword(createUserDto.password);

    const user = await this.prisma.user.create({
      data: {
        ...createUserDto,
        password: hashedPassword,
      },
      include: { role: true },
    });

    return { message: 'User berhasil dibuat.', data: sanitizeUser(user) };
  }

  async update(uuid: string, updateUserDto: UpdateUserDto) {
    const existing = await this.prisma.user.findFirst({
      where: { uuid, deletedAt: null },
    });

    if (!existing) {
      throw new NotFoundException('User tidak ditemukan.');
    }

    if (updateUserDto.email) {
      const existingUser = await this.prisma.user.findFirst({
        where: { email: updateUserDto.email, id: { not: existing.id }, deletedAt: null },
      });
      if (existingUser) {
        throw new BadRequestException('Email sudah digunakan.');
      }
    }

    const data: any = { ...updateUserDto };
    if (updateUserDto.password) {
      data.password = await hashPassword(updateUserDto.password);
    }

    const user = await this.prisma.user.update({
      where: { id: existing.id },
      data,
      include: { role: true },
    });

    return { message: 'User berhasil diupdate.', data: sanitizeUser(user) };
  }

  async remove(uuid: string) {
    const existing = await this.prisma.user.findFirst({
      where: { uuid, deletedAt: null },
    });

    if (!existing) {
      throw new NotFoundException('User tidak ditemukan.');
    }

    // Soft delete
    await this.prisma.user.update({
      where: { id: existing.id },
      data: { deletedAt: new Date() },
    });

    return { message: 'User berhasil dihapus.', data: {} };
  }
}

