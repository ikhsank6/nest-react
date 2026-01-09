import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateMenuAccessDto, UpdateMenuAccessDto, BulkMenuAccessDto } from './dto/menu-access.dto';

@Injectable()
export class MenuAccessService {
  constructor(private prisma: PrismaService) {}

  async findByRole(roleUuid: string) {
    const role = await this.prisma.role.findFirst({ where: { uuid: roleUuid } });
    if (!role) {
      throw new NotFoundException('Role tidak ditemukan.');
    }

    const menuAccess = await this.prisma.menuAccess.findMany({
      where: { roleId: role.id },
      include: { menu: true },
      orderBy: { menu: { order: 'asc' } },
    });

    return { message: 'Success', data: menuAccess };
  }

  async getAccessibleMenus(roleId: number) {
    const menuAccess = await this.prisma.menuAccess.findMany({
      where: { roleId },
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
    const role = await this.prisma.role.findFirst({
      where: { uuid: createMenuAccessDto.roleUuid },
    });
    if (!role) throw new NotFoundException('Role tidak ditemukan');

    const menu = await this.prisma.menu.findFirst({
      where: { uuid: createMenuAccessDto.menuUuid },
    });
    if (!menu) throw new NotFoundException('Menu tidak ditemukan');

    const existing = await this.prisma.menuAccess.findUnique({
      where: {
        roleId_menuId: {
          roleId: role.id,
          menuId: menu.id,
        },
      },
    });

    if (existing) {
      throw new BadRequestException('Menu access sudah ada.');
    }

    const menuAccess = await this.prisma.menuAccess.create({
      data: {
        roleId: role.id,
        menuId: menu.id,
      },
      include: { menu: true, role: true },
    });

    return { message: 'Menu access berhasil dibuat.', data: menuAccess };
  }

  async update(uuid: string, updateMenuAccessDto: UpdateMenuAccessDto) {
    const existing = await this.prisma.menuAccess.findFirst({ where: { uuid } });
    if (!existing) {
      throw new NotFoundException('Menu access tidak ditemukan.');
    }

    if (updateMenuAccessDto.menuUuid) {
      const menu = await this.prisma.menu.findFirst({ where: { uuid: updateMenuAccessDto.menuUuid } });
      if (!menu) throw new NotFoundException('Menu tidak ditemukan');
      
      const menuAccess = await this.prisma.menuAccess.update({
        where: { id: existing.id },
        data: { menuId: menu.id },
        include: { menu: true, role: true },
      });
      return { message: 'Menu access berhasil diupdate.', data: menuAccess };
    }

    return { message: 'Menu access berhasil diupdate.', data: existing };
  }

  async bulkUpdate(bulkDto: BulkMenuAccessDto) {
    const { roleUuid, menuUuids } = bulkDto;

    const role = await this.prisma.role.findFirst({ where: { uuid: roleUuid } });
    if (!role) {
      throw new NotFoundException('Role tidak ditemukan.');
    }

    const menus = await this.prisma.menu.findMany({
      where: { uuid: { in: menuUuids } },
    });
    
    const menuIds = menus.map(m => m.id);

    // Delete existing menu access for this role
    await this.prisma.menuAccess.deleteMany({ where: { roleId: role.id } });

    // Create new menu access entries
    const data = menuIds.map((menuId) => ({
      roleId: role.id,
      menuId,
    }));

    if (data.length > 0) {
      await this.prisma.menuAccess.createMany({ data });
    }

    return { message: 'Menu access berhasil diupdate.', data: {} };
  }

  async remove(uuid: string) {
    const existing = await this.prisma.menuAccess.findFirst({ where: { uuid } });
    if (!existing) {
      throw new NotFoundException('Menu access tidak ditemukan.');
    }

    await this.prisma.menuAccess.delete({ where: { id: existing.id } });
    return { message: 'Menu access berhasil dihapus.', data: {} };
  }
}
