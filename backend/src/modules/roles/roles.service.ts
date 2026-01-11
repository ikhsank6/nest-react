import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateRoleDto, UpdateRoleDto } from './dto/role.dto';
import { buildPaginatedResponse, calculateSkip } from '../../common/utils/pagination.util';
import { RoleResource } from './resources/role.resource';


@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) { }

  async findAll(page = 1, limit = 10, search?: string) {
    const skip = calculateSkip(page, limit);

    const where: any = { deletedAt: null };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [roles, total] = await Promise.all([
      this.prisma.role.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      this.prisma.role.count({ where }),
    ]);

    return buildPaginatedResponse(
      RoleResource.collection(roles),
      total,
      page,
      limit,
    );
  }

  async findOne(uuid: string) {
    const role = await this.prisma.role.findFirst({
      where: { uuid, deletedAt: null },
      include: { menuAccess: { include: { menu: true } } },
    });

    if (!role) {
      throw new NotFoundException('Role tidak ditemukan.');
    }

    return { message: 'Success', data: new RoleResource(role) };
  }

  async create(createRoleDto: CreateRoleDto) {
    return this.prisma.$transaction(async (prisma) => {
      const existingRole = await prisma.role.findFirst({
        where: { name: createRoleDto.name, deletedAt: null },
      });

      if (existingRole) {
        throw new BadRequestException('Nama role sudah ada.');
      }

      const role = await prisma.role.create({
        data: createRoleDto
      });
      return { message: 'Role berhasil dibuat.', data: new RoleResource(role) };
    });
  }

  async update(uuid: string, updateRoleDto: UpdateRoleDto) {
    return this.prisma.$transaction(async (prisma) => {
      const existing = await prisma.role.findFirst({
        where: { uuid, deletedAt: null },
      });

      if (!existing) {
        throw new NotFoundException('Role tidak ditemukan.');
      }

      if (updateRoleDto.name) {
        const existingRole = await prisma.role.findFirst({
          where: { name: updateRoleDto.name, id: { not: existing.id }, deletedAt: null },
        });
        if (existingRole) {
          throw new BadRequestException('Nama role sudah digunakan.');
        }
      }

      const role = await prisma.role.update({
        where: { id: existing.id },
        data: updateRoleDto,
      });

      return { message: 'Role berhasil diupdate.', data: new RoleResource(role) };
    });
  }

  async remove(uuid: string) {
    return this.prisma.$transaction(async (prisma) => {
      const existing = await prisma.role.findFirst({
        where: { uuid, deletedAt: null },
      });

      if (!existing) {
        throw new NotFoundException('Role tidak ditemukan.');
      }

      const usersWithRole = await prisma.user.count({
        where: { roleId: existing.id, deletedAt: null },
      });

      if (usersWithRole > 0) {
        throw new BadRequestException('Role masih digunakan oleh user.');
      }

      // Soft delete
      await prisma.role.update({
        where: { id: existing.id },
        data: { deletedAt: new Date() },
      });

      return { message: 'Role berhasil dihapus.', data: {} };
    });
  }
}

