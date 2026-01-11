import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateCarouselDto, UpdateCarouselDto, ReorderCarouselDto } from './dto/carousel.dto';
import { buildPaginatedResponse } from '../../../common/utils/pagination.util';
import { CarouselResource } from './resources/carousel.resource';

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
        include: { media: true },
        orderBy: { order: 'asc' },
        skip,
        take: limit,
      }),
      (this.prisma as any).carousel.count({ where: whereClause }),
    ]);

    return buildPaginatedResponse(
      CarouselResource.collection(carousels),
      total,
      page,
      limit,
      'Daftar carousel berhasil diambil',
    );
  }

  async findOne(uuid: string) {
    const carousel = await (this.prisma as any).carousel.findFirst({
      where: { uuid, deletedAt: null },
      include: { media: true },
    });

    if (!carousel) {
      throw new NotFoundException('Carousel tidak ditemukan');
    }

    return {
      message: 'Detail carousel berhasil diambil',
      data: new CarouselResource(carousel),
    };
  }

  async create(dto: CreateCarouselDto, createdBy?: string) {
    return (this.prisma as any).$transaction(async (prisma: any) => {
      const { mediaUuid, ...data } = dto;
      let mediaId: number | undefined = undefined;

      if (mediaUuid) {
        const media = await prisma.media.findUnique({
          where: { uuid: mediaUuid },
        });
        if (media) mediaId = media.id;
      }

      const carousel = await prisma.carousel.create({
        data: {
          ...data,
          mediaId,
          createdBy,
          updatedBy: createdBy,
        },
        include: { media: true },
      });

      return {
        message: 'Carousel berhasil dibuat',
        data: new CarouselResource(carousel),
      };
    });
  }

  async update(uuid: string, dto: UpdateCarouselDto, updatedBy?: string) {
    return (this.prisma as any).$transaction(async (prisma: any) => {
      const existing = await prisma.carousel.findFirst({
        where: { uuid, deletedAt: null },
      });

      if (!existing) {
        throw new NotFoundException('Carousel tidak ditemukan');
      }

      const { mediaUuid, ...data } = dto;
      let mediaId: number | undefined = undefined;

      if (mediaUuid) {
        const media = await prisma.media.findUnique({
          where: { uuid: mediaUuid },
        });
        if (media) mediaId = media.id;
      }

      const carousel = await prisma.carousel.update({
        where: { id: existing.id },
        data: {
          ...data,
          mediaId,
          updatedBy,
        },
        include: { media: true },
      });

      return {
        message: 'Carousel berhasil diupdate',
        data: new CarouselResource(carousel),
      };
    });
  }

  async remove(uuid: string, deletedBy?: string) {
    return (this.prisma as any).$transaction(async (prisma: any) => {
      const existing = await prisma.carousel.findFirst({
        where: { uuid, deletedAt: null },
      });

      if (!existing) {
        throw new NotFoundException('Carousel tidak ditemukan');
      }

      await prisma.carousel.update({
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
    });
  }

  async reorder(dto: ReorderCarouselDto) {
    return (this.prisma as any).$transaction(async (prisma: any) => {
      const results: any[] = [];

      for (const item of dto.items) {
        const carousel = await prisma.carousel.findFirst({
          where: { uuid: item.uuid, deletedAt: null },
        });

        if (!carousel) {
          throw new NotFoundException(`Carousel dengan UUID ${item.uuid} tidak ditemukan.`);
        }

        const updated = await prisma.carousel.update({
          where: { id: carousel.id },
          data: { order: item.order },
          include: { media: true },
        });
        results.push(updated);
      }

      return {
        message: 'Carousel berhasil di-reorder.',
        data: CarouselResource.collection(results),
      };
    });
  }
}
