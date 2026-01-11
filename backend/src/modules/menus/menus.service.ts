import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateMenuDto, UpdateMenuDto, ReorderMenusDto } from './dto/menu.dto';
import { MenuResource } from './resources/menu.resource';


@Injectable()
export class MenusService {
  constructor(private prisma: PrismaService) { }

  async findAll(query?: string) {
    const whereCondition: any = { deletedAt: null };

    if (query) {
      whereCondition.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { path: { contains: query, mode: 'insensitive' } },
      ];
    }

    const menus = await this.prisma.menu.findMany({
      where: whereCondition,
      include: {
        parent: true,
        children: {
          where: { deletedAt: null },
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { order: 'asc' },
    });

    // Sort menus: parents first (by order), then their children (by order)
    const sortedMenus: any[] = [];
    const rootMenus = menus.filter((m) => !m.parentId);
    const childMenuMap = new Map<number, any[]>();

    for (const menu of menus) {
      if (menu.parentId) {
        if (!childMenuMap.has(menu.parentId)) {
          childMenuMap.set(menu.parentId, []);
        }
        childMenuMap.get(menu.parentId)!.push(menu);
      }
    }

    for (const parent of rootMenus) {
      sortedMenus.push(parent);
      const children = childMenuMap.get(parent.id) || [];
      children.sort((a, b) => a.order - b.order);
      for (const child of children) {
        sortedMenus.push(child);
      }
    }

    return { message: 'Success', data: MenuResource.collection(sortedMenus) };
  }

  async getTree() {
    const menus = await this.prisma.menu.findMany({
      where: { parentId: null, deletedAt: null },
      include: {
        children: {
          where: { deletedAt: null },
          orderBy: { order: 'asc' },
          include: {
            children: {
              where: { deletedAt: null },
              orderBy: { order: 'asc' },
              include: {
                children: {
                  where: { deletedAt: null },
                  orderBy: { order: 'asc' },
                }
              }
            }
          }
        },
      },
      orderBy: { order: 'asc' },
    });

    return { message: 'Success', data: MenuResource.collection(menus) };
  }

  async findOne(uuid: string) {
    const menu = await this.prisma.menu.findFirst({
      where: { uuid, deletedAt: null },
      include: {
        children: { where: { deletedAt: null } },
        parent: true,
      },
    });

    if (!menu) {
      throw new NotFoundException('Menu tidak ditemukan.');
    }

    return { message: 'Success', data: new MenuResource(menu) };
  }

  async create(createMenuDto: CreateMenuDto) {
    return this.prisma.$transaction(async (prisma) => {
      if (createMenuDto.parentUuid) {
        const parent = await prisma.menu.findFirst({
          where: { uuid: createMenuDto.parentUuid, deletedAt: null },
        });
        if (!parent) {
          throw new BadRequestException('Parent menu tidak ditemukan.');
        }
        // Replace parentUuid with parentId for database
        const { parentUuid, ...dataWithoutParentUuid } = createMenuDto;
        const menu = await prisma.menu.create({
          data: {
            ...dataWithoutParentUuid,
            parentId: parent.id,
          },
          include: { parent: true },
        });
        return { message: 'Menu berhasil dibuat.', data: new MenuResource(menu) };
      }

      const { parentUuid, ...data } = createMenuDto;
      const menu = await prisma.menu.create({
        data: data,
        include: { parent: true },
      });
      return { message: 'Menu berhasil dibuat.', data: new MenuResource(menu) };
    });
  }

  async update(uuid: string, updateMenuDto: UpdateMenuDto) {
    return this.prisma.$transaction(async (prisma) => {
      const existing = await prisma.menu.findFirst({
        where: { uuid, deletedAt: null },
      });

      if (!existing) {
        throw new NotFoundException('Menu tidak ditemukan.');
      }

      let parentId: number | null | undefined = undefined;

      if (updateMenuDto.parentUuid !== undefined) {
        if (updateMenuDto.parentUuid === null) {
          parentId = null;
        } else if (updateMenuDto.parentUuid === uuid) {
          throw new BadRequestException('Menu tidak bisa menjadi parent sendiri.');
        } else {
          const parent = await prisma.menu.findFirst({
            where: { uuid: updateMenuDto.parentUuid, deletedAt: null },
          });
          if (!parent) {
            throw new BadRequestException('Parent menu tidak ditemukan.');
          }
          parentId = parent.id;
        }
      }

      const { parentUuid, ...dataWithoutParentUuid } = updateMenuDto;
      const menu = await prisma.menu.update({
        where: { id: existing.id },
        data: {
          ...dataWithoutParentUuid,
          ...(parentId !== undefined && { parentId }),
        },
        include: { parent: true },
      });

      return { message: 'Menu berhasil diupdate.', data: new MenuResource(menu) };
    });
  }

  async remove(uuid: string) {
    return this.prisma.$transaction(async (prisma) => {
      const existing = await prisma.menu.findFirst({
        where: { uuid, deletedAt: null },
      });

      if (!existing) {
        throw new NotFoundException('Menu tidak ditemukan.');
      }

      const children = await prisma.menu.count({
        where: { parentId: existing.id, deletedAt: null },
      });

      if (children > 0) {
        throw new BadRequestException('Menu masih memiliki child menu.');
      }

      // Soft delete
      await prisma.menu.update({
        where: { id: existing.id },
        data: { deletedAt: new Date() },
      });

      return { message: 'Menu berhasil dihapus.', data: {} };
    });
  }

  async reorder(reorderMenusDto: ReorderMenusDto) {
    return this.prisma.$transaction(async (prisma) => {
      const results: any[] = [];
      const { items } = reorderMenusDto;

      // Validate all items exist first to avoid partial updates if one fails?
      // Or just let it fail. Proritize performance.

      for (const item of items) {
        const menu = await prisma.menu.findFirst({
          where: { uuid: item.uuid, deletedAt: null },
        });

        if (!menu) {
          throw new NotFoundException(`Menu dengan UUID ${item.uuid} tidak ditemukan.`);
        }

        let parentId: number | null | undefined = undefined;

        if (item.parentUuid !== undefined) {
          if (item.parentUuid === null) {
            parentId = null;
          } else if (item.parentUuid === item.uuid) {
            throw new BadRequestException(`Menu ${item.uuid} tidak bisa menjadi parent sendiri.`);
          } else {
            const parent = await prisma.menu.findFirst({
              where: { uuid: item.parentUuid, deletedAt: null },
            });
            if (!parent) {
              throw new BadRequestException(`Parent menu ${item.parentUuid} tidak ditemukan.`);
            }
            parentId = parent.id;
          }
        }

        const updatedMenu = await prisma.menu.update({
          where: { id: menu.id },
          data: {
            order: item.order,
            ...(parentId !== undefined && { parentId }),
          },
        });
        results.push(updatedMenu);
      }

      return { message: 'Menu berhasil di-reorder.', data: MenuResource.collection(results) };
    });
  }
}

