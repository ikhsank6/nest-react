import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateNewsCategoryDto, UpdateNewsCategoryDto } from './dto/news-category.dto';
import { buildPaginatedResponse } from '../../../common/utils/pagination.util';
import { NewsCategoryResource } from './resources/news-category.resource';

@Injectable()
export class NewsCategoryService {
  constructor(private prisma: PrismaService) { }

  async findAll(page = 1, limit = 10, search?: string, includeInactive = false) {
    const skip = (page - 1) * limit;

    const whereClause: any = { deletedAt: null };

    if (!includeInactive) {
      whereClause.isActive = true;
    }

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [categories, total] = await Promise.all([
      this.prisma.newsCategory.findMany({
        where: whereClause,
        include: {
          _count: {
            select: { news: { where: { deletedAt: null } } },
          },
        },
        orderBy: { name: 'asc' },
        skip,
        take: limit,
      }),
      this.prisma.newsCategory.count({ where: whereClause }),
    ]);

    return buildPaginatedResponse(
      NewsCategoryResource.collection(categories),
      total,
      page,
      limit,
      'Daftar kategori berita berhasil diambil',
    );
  }

  async findOne(uuid: string) {
    const category = await this.prisma.newsCategory.findFirst({
      where: { uuid, deletedAt: null },
      include: {
        _count: {
          select: { news: { where: { deletedAt: null } } },
        },
      },
    });

    if (!category) {
      throw new NotFoundException('Kategori tidak ditemukan');
    }

    return {
      message: 'Detail kategori berhasil diambil',
      data: new NewsCategoryResource(category),
    };
  }

  async create(dto: CreateNewsCategoryDto, createdBy?: string) {
    // Check if slug already exists
    const existing = await this.prisma.newsCategory.findFirst({
      where: {
        OR: [{ slug: dto.slug }, { name: dto.name }],
        deletedAt: null,
      },
    });

    if (existing) {
      throw new ConflictException('Nama atau slug kategori sudah digunakan');
    }

    const category = await this.prisma.newsCategory.create({
      data: {
        ...dto,
        createdBy,
        updatedBy: createdBy,
      },
    });

    return {
      message: 'Kategori berhasil dibuat',
      data: new NewsCategoryResource(category),
    };
  }

  async update(uuid: string, dto: UpdateNewsCategoryDto, updatedBy?: string) {
    const existing = await this.prisma.newsCategory.findFirst({
      where: { uuid, deletedAt: null },
    });

    if (!existing) {
      throw new NotFoundException('Kategori tidak ditemukan');
    }

    // Check for duplicate slug/name
    if (dto.slug || dto.name) {
      const duplicate = await this.prisma.newsCategory.findFirst({
        where: {
          OR: [
            dto.slug ? { slug: dto.slug } : {},
            dto.name ? { name: dto.name } : {},
          ],
          id: { not: existing.id },
          deletedAt: null,
        },
      });

      if (duplicate) {
        throw new ConflictException('Nama atau slug kategori sudah digunakan');
      }
    }

    const category = await this.prisma.newsCategory.update({
      where: { id: existing.id },
      data: {
        ...dto,
        updatedBy,
      },
    });

    return {
      message: 'Kategori berhasil diupdate',
      data: new NewsCategoryResource(category),
    };
  }

  async remove(uuid: string, deletedBy?: string) {
    const existing = await this.prisma.newsCategory.findFirst({
      where: { uuid, deletedAt: null },
    });

    if (!existing) {
      throw new NotFoundException('Kategori tidak ditemukan');
    }

    await this.prisma.newsCategory.update({
      where: { id: existing.id },
      data: {
        deletedAt: new Date(),
        deletedBy,
      },
    });

    return {
      message: 'Kategori berhasil dihapus',
      data: {},
    };
  }
}
