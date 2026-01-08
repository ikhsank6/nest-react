import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateMenuAccessDto, UpdateMenuAccessDto, BulkMenuAccessDto } from './dto/menu-access.dto';

@Injectable()
export class MenuAccessService {
  constructor(private prisma: PrismaService) {}

  async findByRole(roleId: number) {
    const role = await this.prisma.role.findUnique({ where: { id: roleId } });
    if (!role) {
      throw new NotFoundException('Role tidak ditemukan.');
    }

    const menuAccess = await this.prisma.menuAccess.findMany({
      where: { roleId },
      include: { menu: true },
      orderBy: { menu: { order: 'asc' } },
    });

    return { message: 'Success', data: menuAccess };
  }

  async getAccessibleMenus(roleId: number) {
    const menuAccess = await this.prisma.menuAccess.findMany({
      where: { roleId, canView: true },
      include: {
        menu: {
          include: {
            children: {
              where: { isActive: true },
              orderBy: { order: 'asc' },
            },
          },
        },
      },
    });

    // Filter to only root menus that user can access
    const accessibleMenuIds = menuAccess.map((ma) => ma.menuId);
    const rootMenus = await this.prisma.menu.findMany({
      where: {
        parentId: null,
        isActive: true,
        id: { in: accessibleMenuIds },
      },
      include: {
        children: {
          where: {
            isActive: true,
            id: { in: accessibleMenuIds },
          },
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { order: 'asc' },
    });

    return { message: 'Success', data: rootMenus };
  }

  async create(createMenuAccessDto: CreateMenuAccessDto) {
    const existing = await this.prisma.menuAccess.findUnique({
      where: {
        roleId_menuId: {
          roleId: createMenuAccessDto.roleId,
          menuId: createMenuAccessDto.menuId,
        },
      },
    });

    if (existing) {
      throw new BadRequestException('Menu access sudah ada.');
    }

    const menuAccess = await this.prisma.menuAccess.create({
      data: createMenuAccessDto,
      include: { menu: true, role: true },
    });

    return { message: 'Menu access berhasil dibuat.', data: menuAccess };
  }

  async update(id: number, updateMenuAccessDto: UpdateMenuAccessDto) {
    const existing = await this.prisma.menuAccess.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Menu access tidak ditemukan.');
    }

    const menuAccess = await this.prisma.menuAccess.update({
      where: { id },
      data: updateMenuAccessDto,
      include: { menu: true, role: true },
    });

    return { message: 'Menu access berhasil diupdate.', data: menuAccess };
  }

  async bulkUpdate(bulkDto: BulkMenuAccessDto) {
    const { roleId, menuAccess } = bulkDto;

    const role = await this.prisma.role.findUnique({ where: { id: roleId } });
    if (!role) {
      throw new NotFoundException('Role tidak ditemukan.');
    }

    // Delete existing menu access for this role
    await this.prisma.menuAccess.deleteMany({ where: { roleId } });

    // Create new menu access entries
    const data = menuAccess.map((item) => ({
      roleId,
      menuId: item.menuId,
      canView: item.canView ?? true,
      canCreate: item.canCreate ?? false,
      canEdit: item.canEdit ?? false,
      canDelete: item.canDelete ?? false,
    }));

    await this.prisma.menuAccess.createMany({ data });

    return { message: 'Menu access berhasil diupdate.', data: {} };
  }

  async remove(id: number) {
    const existing = await this.prisma.menuAccess.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Menu access tidak ditemukan.');
    }

    await this.prisma.menuAccess.delete({ where: { id } });
    return { message: 'Menu access berhasil dihapus.', data: {} };
  }
}
