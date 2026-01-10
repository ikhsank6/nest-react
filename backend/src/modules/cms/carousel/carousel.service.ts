import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateCarouselDto, UpdateCarouselDto } from './dto/carousel.dto';

@Injectable()
export class CarouselService {
  constructor(private prisma: PrismaService) {}

  async findAll(includeInactive = false) {
    const where = includeInactive ? { deletedAt: null } : { deletedAt: null, isActive: true };
    
    const carousels = await this.prisma.carousel.findMany({
      where,
      orderBy: { order: 'asc' },
    });

    return {
      message: 'Daftar carousel berhasil diambil',
      data: carousels,
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
