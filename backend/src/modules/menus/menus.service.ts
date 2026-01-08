import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateMenuDto, UpdateMenuDto } from './dto/menu.dto';
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

  async findAll() {
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
            },
          },
        },
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
}

