import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateNewsCategoryDto, UpdateNewsCategoryDto } from './dto/news-category.dto';

@Injectable()
export class NewsCategoryService {
  constructor(private prisma: PrismaService) {}

  async findAll(includeInactive = false) {
    const where = includeInactive ? { deletedAt: null } : { deletedAt: null, isActive: true };
    
    const categories = await this.prisma.newsCategory.findMany({
      where,
      include: {
        _count: {
          select: { news: { where: { deletedAt: null } } },
        },
      },
      orderBy: { name: 'asc' },
    });

    return {
      message: 'Daftar kategori berita berhasil diambil',
      data: categories,
    };
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
      data: category,
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
      data: category,
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
      data: category,
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
