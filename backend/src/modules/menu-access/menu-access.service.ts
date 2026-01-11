import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateMenuAccessDto, UpdateMenuAccessDto, BulkMenuAccessDto } from './dto/menu-access.dto';
import { MenuAccessResource } from './resources/menu-access.resource';

@Injectable()
export class MenuAccessService {
  constructor(private prisma: PrismaService) { }

  async findByRole(roleUuid: string) {
    const role = await this.prisma.role.findFirst({ where: { uuid: roleUuid, deletedAt: null } });
    if (!role) {
      throw new NotFoundException('Role tidak ditemukan.');
    }

    const menuAccess = await this.prisma.menuAccess.findMany({
      where: { roleId: role.id, deletedAt: null },
      include: { menu: true },
      orderBy: { menu: { order: 'asc' } },
    });

    return { message: 'Success', data: MenuAccessResource.collection(menuAccess) };
  }

  async getAccessibleMenus(roleId: number) {
    const menuAccess = await this.prisma.menuAccess.findMany({
      where: { roleId, deletedAt: null },
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
        deletedAt: null,
      },
      include: {
        children: {
          where: {
            isActive: true,
            id: { in: accessibleMenuIds },
            deletedAt: null,
          },
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { order: 'asc' },
    });

    return { message: 'Success', data: rootMenus };
  }

  async create(createMenuAccessDto: CreateMenuAccessDto) {
    return this.prisma.$transaction(async (prisma) => {
      const role = await prisma.role.findFirst({
        where: { uuid: createMenuAccessDto.roleUuid, deletedAt: null },
      });
      if (!role) throw new NotFoundException('Role tidak ditemukan');

      const menu = await prisma.menu.findFirst({
        where: { uuid: createMenuAccessDto.menuUuid, deletedAt: null },
      });
      if (!menu) throw new NotFoundException('Menu tidak ditemukan');

      const existing = await prisma.menuAccess.findFirst({
        where: {
          roleId: role.id,
          menuId: menu.id,
          deletedAt: null,
        },
      });

      if (existing) {
        throw new BadRequestException('Menu access sudah ada.');
      }

      const menuAccess = await prisma.menuAccess.create({
        data: {
          roleId: role.id,
          menuId: menu.id,
        },
        include: { menu: true, role: true },
      });

      return { message: 'Menu access berhasil dibuat.', data: new MenuAccessResource(menuAccess) };
    });
  }

  async update(uuid: string, updateMenuAccessDto: UpdateMenuAccessDto) {
    const existing = await this.prisma.menuAccess.findFirst({ where: { uuid, deletedAt: null } });
    if (!existing) {
      throw new NotFoundException('Menu access tidak ditemukan.');
    }

    if (updateMenuAccessDto.menuUuid) {
      const menu = await this.prisma.menu.findFirst({ where: { uuid: updateMenuAccessDto.menuUuid, deletedAt: null } });
      if (!menu) throw new NotFoundException('Menu tidak ditemukan');

      const menuAccess = await this.prisma.menuAccess.update({
        where: { id: existing.id },
        data: { menuId: menu.id },
        include: { menu: true, role: true },
      });
      return { message: 'Menu access berhasil diupdate.', data: new MenuAccessResource(menuAccess) };
    }

    return { message: 'Menu access berhasil diupdate.', data: new MenuAccessResource(existing) };
  }

  async bulkUpdate(bulkDto: BulkMenuAccessDto) {
    const { roleUuid, menuUuids } = bulkDto;

    return this.prisma.$transaction(async (prisma) => {
      const role = await prisma.role.findFirst({ where: { uuid: roleUuid, deletedAt: null } });
      if (!role) {
        throw new NotFoundException('Role tidak ditemukan.');
      }

      const menus = await prisma.menu.findMany({
        where: { uuid: { in: menuUuids }, deletedAt: null },
      });

      const menuIds = menus.map(m => m.id);

      // Delete existing menu access for this role
      await prisma.menuAccess.deleteMany({ where: { roleId: role.id } });

      // Create new menu access entries
      const data = menuIds.map((menuId) => ({
        roleId: role.id,
        menuId,
      }));

      if (data.length > 0) {
        await prisma.menuAccess.createMany({ data });
      }

      return { message: 'Menu access berhasil diupdate.', data: {} };
    });
  }

  async remove(uuid: string) {
    return this.prisma.$transaction(async (prisma) => {
      const existing = await prisma.menuAccess.findFirst({ where: { uuid, deletedAt: null } });
      if (!existing) {
        throw new NotFoundException('Menu access tidak ditemukan.');
      }

      await prisma.menuAccess.delete({ where: { id: existing.id } });
      return { message: 'Menu access berhasil dihapus.', data: {} };
    });
  }
}
