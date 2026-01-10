import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateCarouselDto, UpdateCarouselDto } from './dto/carousel.dto';

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
      this.prisma.carousel.findMany({
        where: whereClause,
        orderBy: { order: 'asc' },
        skip,
        take: limit,
      }),
      this.prisma.carousel.count({ where: whereClause }),
    ]);

    return {
      message: 'Daftar carousel berhasil diambil',
      data: carousels,
      meta: {
        page: {
          total,
          current_page: page,
          per_page: limit,
          from: skip + 1,
        },
      },
    };
  }

  async findOne(uuid: string) {
    const carousel = await this.prisma.carousel.findFirst({
      where: { uuid, deletedAt: null },
    });

    if (!carousel) {
      throw new NotFoundException('Carousel tidak ditemukan');
    }

    return {
      message: 'Detail carousel berhasil diambil',
      data: carousel,
    };
  }

  async create(dto: CreateCarouselDto, createdBy?: string) {
    const carousel = await this.prisma.carousel.create({
      data: {
        ...dto,
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
    const existing = await this.prisma.carousel.findFirst({
      where: { uuid, deletedAt: null },
    });

    if (!existing) {
      throw new NotFoundException('Carousel tidak ditemukan');
    }

    const carousel = await this.prisma.carousel.update({
      where: { id: existing.id },
      data: {
        ...dto,
        updatedBy,
      },
    });

    return {
      message: 'Carousel berhasil diupdate',
      data: carousel,
    };
  }

  async remove(uuid: string, deletedBy?: string) {
    const existing = await this.prisma.carousel.findFirst({
      where: { uuid, deletedAt: null },
    });

    if (!existing) {
      throw new NotFoundException('Carousel tidak ditemukan');
    }

    await this.prisma.carousel.update({
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
