import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateNewsDto, UpdateNewsDto } from './dto/news.dto';
import { buildPaginatedResponse } from '../../../common/utils/pagination.util';
import { NewsResource } from './resources/news.resource';

@Injectable()
export class NewsService {
  constructor(private prisma: PrismaService) { }

  async findAll(page = 1, limit = 10, search?: string, categorySlug?: string, publishedOnly = true) {
    const skip = (page - 1) * limit;

    const whereClause: any = { deletedAt: null };

    if (publishedOnly) {
      whereClause.isPublished = true;
    }

    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (categorySlug) {
      whereClause.category = { slug: categorySlug, deletedAt: null };
    }

    const [news, total] = await Promise.all([
      this.prisma.news.findMany({
        where: whereClause,
        include: {
          category: {
            select: { uuid: true, name: true, slug: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.news.count({ where: whereClause }),
    ]);

    return buildPaginatedResponse(
      NewsResource.collection(news),
      total,
      page,
      limit,
      'Daftar berita berhasil diambil',
    );
  }

  async findOne(uuid: string) {
    const news = await this.prisma.news.findFirst({
      where: { uuid, deletedAt: null },
      include: {
        category: {
          select: { uuid: true, name: true, slug: true },
        },
      },
    });

    if (!news) {
      throw new NotFoundException('Berita tidak ditemukan');
    }

    return {
      message: 'Detail berita berhasil diambil',
      data: new NewsResource(news),
    };
  }

  async findBySlug(slug: string) {
    return this.prisma.$transaction(async (prisma) => {
      const news = await prisma.news.findFirst({
        where: { slug, deletedAt: null, isPublished: true },
        include: {
          category: {
            select: { uuid: true, name: true, slug: true },
          },
        },
      });

      if (!news) {
        throw new NotFoundException('Berita tidak ditemukan');
      }

      // Increment view count
      await prisma.news.update({
        where: { id: news.id },
        data: { viewCount: { increment: 1 } },
      });

      return {
        message: 'Detail berita berhasil diambil',
        data: new NewsResource({ ...news, viewCount: news.viewCount + 1 }),
      };
    });
  }

  async create(dto: CreateNewsDto, createdBy?: string) {
    return this.prisma.$transaction(async (prisma) => {
      // Check if slug already exists
      const existing = await prisma.news.findFirst({
        where: { slug: dto.slug, deletedAt: null },
      });

      if (existing) {
        throw new ConflictException('Slug berita sudah digunakan');
      }

      // Get category ID from UUID
      const category = await prisma.newsCategory.findFirst({
        where: { uuid: dto.categoryUuid, deletedAt: null },
      });

      if (!category) {
        throw new NotFoundException('Kategori tidak ditemukan');
      }

      const { categoryUuid, ...newsData } = dto;

      const news = await prisma.news.create({
        data: {
          ...newsData,
          categoryId: category.id,
          publishedAt: dto.isPublished ? new Date() : null,
          createdBy,
          updatedBy: createdBy,
        },
        include: {
          category: {
            select: { uuid: true, name: true, slug: true },
          },
        },
      });

      return {
        message: 'Berita berhasil dibuat',
        data: new NewsResource(news),
      };
    });
  }

  async update(uuid: string, dto: UpdateNewsDto, updatedBy?: string) {
    return this.prisma.$transaction(async (prisma) => {
      const existing = await prisma.news.findFirst({
        where: { uuid, deletedAt: null },
      });

      if (!existing) {
        throw new NotFoundException('Berita tidak ditemukan');
      }

      // Check for duplicate slug
      if (dto.slug) {
        const duplicate = await prisma.news.findFirst({
          where: { slug: dto.slug, id: { not: existing.id }, deletedAt: null },
        });

        if (duplicate) {
          throw new ConflictException('Slug berita sudah digunakan');
        }
      }

      const updateData: any = { ...dto, updatedBy };
      delete updateData.categoryUuid;

      // Handle category change
      if (dto.categoryUuid) {
        const category = await prisma.newsCategory.findFirst({
          where: { uuid: dto.categoryUuid, deletedAt: null },
        });

        if (!category) {
          throw new NotFoundException('Kategori tidak ditemukan');
        }

        updateData.categoryId = category.id;
      }

      // Handle publish status change
      if (dto.isPublished !== undefined && dto.isPublished && !existing.publishedAt) {
        updateData.publishedAt = new Date();
      }

      const news = await prisma.news.update({
        where: { id: existing.id },
        data: updateData,
        include: {
          category: {
            select: { uuid: true, name: true, slug: true },
          },
        },
      });

      return {
        message: 'Berita berhasil diupdate',
        data: new NewsResource(news),
      };
    });
  }

  async remove(uuid: string, deletedBy?: string) {
    return this.prisma.$transaction(async (prisma) => {
      const existing = await prisma.news.findFirst({
        where: { uuid, deletedAt: null },
      });

      if (!existing) {
        throw new NotFoundException('Berita tidak ditemukan');
      }

      await prisma.news.update({
        where: { id: existing.id },
        data: {
          deletedAt: new Date(),
          deletedBy,
        },
      });

      return {
        message: 'Berita berhasil dihapus',
        data: {},
      };
    });
  }
}
