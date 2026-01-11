import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateCarouselDto, UpdateCarouselDto } from './dto/carousel.dto';
import { buildPaginatedResponse } from '../../../common/utils/pagination.util';

@Injectable()
export class CarouselService {
  constructor(private prisma: PrismaService) { }

  async findAll(page = 1, limit = 10, search?: string, includeInactive = false) {
    const skip = (page - 1) * limit;

    const whereClause: any = { deletedAt: null };

    if (!includeInactive) {
      whereClause.isActive = true;
    }

    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { subtitle: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [carousels, total] = await Promise.all([
      (this.prisma as any).carousel.findMany({
        where: whereClause,
        include: {
          media: {
            select: {
              uuid: true,
              filename: true,
              originalName: true,
            },
          },
        },
        orderBy: { order: 'asc' },
        skip,
        take: limit,
      }),
      (this.prisma as any).carousel.count({ where: whereClause }),
    ]);

    const items = carousels.map((c: any) => ({
      ...c,
      media: c.media ? {
        uuid: c.media.uuid,
        filename: c.media.filename,
        original_name: c.media.originalName,
        url: `/upload/images/${c.media.uuid}`,
      } : null,
    }));

    return buildPaginatedResponse(items, total, page, limit, 'Daftar carousel berhasil diambil');
  }

  async findOne(uuid: string) {
    const carousel = await (this.prisma as any).carousel.findFirst({
      where: { uuid, deletedAt: null },
      include: {
        media: {
          select: {
            uuid: true,
            filename: true,
            originalName: true,
          },
        },
      },
    });

    if (!carousel) {
      throw new NotFoundException('Carousel tidak ditemukan');
    }

    return {
      message: 'Detail carousel berhasil diambil',
      data: carousel ? {
        ...carousel,
        media: (carousel as any).media ? {
          uuid: (carousel as any).media.uuid,
          filename: (carousel as any).media.filename,
          original_name: (carousel as any).media.originalName,
          url: `/upload/images/${(carousel as any).media.uuid}`,
        } : null,
      } : null,
    };
  }

  async create(dto: CreateCarouselDto, createdBy?: string) {
    const { mediaUuid, ...data } = dto;
    let mediaId: number | undefined = undefined;

    if (mediaUuid) {
      const media = await (this.prisma as any).media.findUnique({
        where: { uuid: mediaUuid },
      });
      if (media) mediaId = media.id;
    }

    const carousel = await (this.prisma as any).carousel.create({
      data: {
        ...data,
        mediaId,
        createdBy,
        updatedBy: createdBy,
      },
    });

    return {
      message: 'Carousel berhasil dibuat',
      data: carousel,
    };
  }

  async update(uuid: string, dto: UpdateCarouselDto, updatedBy?: string) {
    const existing = await (this.prisma as any).carousel.findFirst({
      where: { uuid, deletedAt: null },
    });

    if (!existing) {
      throw new NotFoundException('Carousel tidak ditemukan');
    }

    const { mediaUuid, ...data } = dto;
    let mediaId: number | undefined = undefined;

    if (mediaUuid) {
      const media = await (this.prisma as any).media.findUnique({
        where: { uuid: mediaUuid },
      });
      if (media) mediaId = media.id;
    }

    const carousel = await (this.prisma as any).carousel.update({
      where: { id: existing.id },
      data: {
        ...data,
        mediaId,
        updatedBy,
      },
    });

    return {
      message: 'Carousel berhasil diupdate',
      data: carousel,
    };
  }

  async remove(uuid: string, deletedBy?: string) {
    const existing = await (this.prisma as any).carousel.findFirst({
      where: { uuid, deletedAt: null },
    });

    if (!existing) {
      throw new NotFoundException('Carousel tidak ditemukan');
    }

    await (this.prisma as any).carousel.update({
      where: { id: existing.id },
      data: {
        deletedAt: new Date(),
        deletedBy,
      },
    });

    return {
      message: 'Carousel berhasil dihapus',
      data: {},
    };
  }
}
