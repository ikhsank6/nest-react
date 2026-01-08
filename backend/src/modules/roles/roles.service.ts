import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateRoleDto, UpdateRoleDto } from './dto/role.dto';
import { excludeFields } from '../../common/utils/sanitize.util';
import { buildPaginatedResponse, calculateSkip } from '../../common/utils/pagination.util';

// Sanitize role object - remove id and deletedAt
function sanitizeRole(role: any) {
  const { id, deletedAt, menuAccess, ...rest } = role;
  return {
    ...rest,
    ...(menuAccess && {
      menuAccess: menuAccess.map((access: any) => {
        const { id: accessId, roleId, menuId, menu, ...accessRest } = access;
        return {
          ...accessRest,
          menu: menu ? excludeFields(menu, ['id', 'parentId', 'deletedAt']) : null,
        };
      }),
    }),
  };
}

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

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
      roles.map((role) => excludeFields(role, ['id', 'deletedAt'])),
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

    return { message: 'Success', data: sanitizeRole(role) };
  }

  async create(createRoleDto: CreateRoleDto) {
    const existingRole = await this.prisma.role.findFirst({
      where: { name: createRoleDto.name, deletedAt: null },
    });

    if (existingRole) {
      throw new BadRequestException('Nama role sudah ada.');
    }

    const role = await this.prisma.role.create({ data: createRoleDto });
    return { message: 'Role berhasil dibuat.', data: excludeFields(role, ['id', 'deletedAt']) };
  }

  async update(uuid: string, updateRoleDto: UpdateRoleDto) {
    const existing = await this.prisma.role.findFirst({
      where: { uuid, deletedAt: null },
    });

    if (!existing) {
      throw new NotFoundException('Role tidak ditemukan.');
    }

    if (updateRoleDto.name) {
      const existingRole = await this.prisma.role.findFirst({
        where: { name: updateRoleDto.name, id: { not: existing.id }, deletedAt: null },
      });
      if (existingRole) {
        throw new BadRequestException('Nama role sudah digunakan.');
      }
    }

    const role = await this.prisma.role.update({
      where: { id: existing.id },
      data: updateRoleDto,
    });

    return { message: 'Role berhasil diupdate.', data: excludeFields(role, ['id', 'deletedAt']) };
  }

  async remove(uuid: string) {
    const existing = await this.prisma.role.findFirst({
      where: { uuid, deletedAt: null },
    });

    if (!existing) {
      throw new NotFoundException('Role tidak ditemukan.');
    }

    const usersWithRole = await this.prisma.user.count({
      where: { roleId: existing.id, deletedAt: null },
    });

    if (usersWithRole > 0) {
      throw new BadRequestException('Role masih digunakan oleh user.');
    }

    // Soft delete
    await this.prisma.role.update({
      where: { id: existing.id },
      data: { deletedAt: new Date() },
    });

    return { message: 'Role berhasil dihapus.', data: {} };
  }
}

