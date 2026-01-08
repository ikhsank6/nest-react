import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateMenuDto, UpdateMenuDto, ReorderMenusDto } from './dto/menu.dto';
import { excludeFieldsDeep } from '../../common/utils/sanitize.util';

// Sanitize menu using the reusable utility
const sanitizeMenu = (menu: any) => excludeFieldsDeep(
  menu,
  ['id', 'parentId', 'deletedAt'],
  ['children', 'parent']
);

@Injectable()
export class MenusService {
  constructor(private prisma: PrismaService) {}

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
      },
      orderBy: { order: 'asc' },
    });
    return { message: 'Success', data: menus.map(sanitizeMenu) };
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

    return { message: 'Success', data: sanitizeMenu(menu) };
  }

  async create(createMenuDto: CreateMenuDto) {
    if (createMenuDto.parentUuid) {
      const parent = await this.prisma.menu.findFirst({
        where: { uuid: createMenuDto.parentUuid, deletedAt: null },
      });
      if (!parent) {
        throw new BadRequestException('Parent menu tidak ditemukan.');
      }
      // Replace parentUuid with parentId for database
      const { parentUuid, ...dataWithoutParentUuid } = createMenuDto;
      const menu = await this.prisma.menu.create({
        data: { ...dataWithoutParentUuid, parentId: parent.id },
        include: { parent: true },
      });
      return { message: 'Menu berhasil dibuat.', data: sanitizeMenu(menu) };
    }

    const { parentUuid, ...data } = createMenuDto;
    const menu = await this.prisma.menu.create({
      data,
      include: { parent: true },
    });
    return { message: 'Menu berhasil dibuat.', data: sanitizeMenu(menu) };
  }

  async update(uuid: string, updateMenuDto: UpdateMenuDto) {
    const existing = await this.prisma.menu.findFirst({
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
        const parent = await this.prisma.menu.findFirst({
          where: { uuid: updateMenuDto.parentUuid, deletedAt: null },
        });
        if (!parent) {
          throw new BadRequestException('Parent menu tidak ditemukan.');
        }
        parentId = parent.id;
      }
    }

    const { parentUuid, ...dataWithoutParentUuid } = updateMenuDto;
    const menu = await this.prisma.menu.update({
      where: { id: existing.id },
      data: {
        ...dataWithoutParentUuid,
        ...(parentId !== undefined && { parentId }),
      },
      include: { parent: true },
    });

    return { message: 'Menu berhasil diupdate.', data: sanitizeMenu(menu) };
  }

  async remove(uuid: string) {
    const existing = await this.prisma.menu.findFirst({
      where: { uuid, deletedAt: null },
    });

    if (!existing) {
      throw new NotFoundException('Menu tidak ditemukan.');
    }

    const children = await this.prisma.menu.count({
      where: { parentId: existing.id, deletedAt: null },
    });

    if (children > 0) {
      throw new BadRequestException('Menu masih memiliki child menu.');
    }

    // Soft delete
    await this.prisma.menu.update({
      where: { id: existing.id },
      data: { deletedAt: new Date() },
    });

    return { message: 'Menu berhasil dihapus.', data: {} };
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

      return { message: 'Menu berhasil di-reorder.', data: results.map(sanitizeMenu) };
    });
  }
}

