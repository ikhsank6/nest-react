import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateAboutUsDto, UpdateAboutUsDto } from './dto/about-us.dto';

@Injectable()
export class AboutUsService {
    constructor(private prisma: PrismaService) { }

    async findAll(includeInactive = false) {
        const where = includeInactive ? { deletedAt: null } : { deletedAt: null, isActive: true };

        const sections = await this.prisma.aboutUs.findMany({
            where,
            orderBy: { order: 'asc' },
        });

        return {
            message: 'Daftar section About Us berhasil diambil',
            data: sections,
        };
    }

    async findOne(uuid: string) {
        const section = await this.prisma.aboutUs.findFirst({
            where: { uuid, deletedAt: null },
        });

        if (!section) {
            throw new NotFoundException('Section tidak ditemukan');
        }

        return {
            message: 'Detail section berhasil diambil',
            data: section,
        };
    }

    async findBySection(sectionName: string) {
        const section = await this.prisma.aboutUs.findFirst({
            where: { section: sectionName, deletedAt: null, isActive: true },
        });

        if (!section) {
            throw new NotFoundException('Section tidak ditemukan');
        }

        return {
            message: 'Detail section berhasil diambil',
            data: section,
        };
    }

    async create(dto: CreateAboutUsDto, createdBy?: string) {
        // Check if section already exists
        const existing = await this.prisma.aboutUs.findFirst({
            where: { section: dto.section, deletedAt: null },
        });

        if (existing) {
            throw new ConflictException('Section sudah ada');
        }

        const section = await this.prisma.aboutUs.create({
            data: {
                ...dto,
                createdBy,
                updatedBy: createdBy,
            },
        });

        return {
            message: 'Section berhasil dibuat',
            data: section,
        };
    }

    async update(uuid: string, dto: UpdateAboutUsDto, updatedBy?: string) {
        const existing = await this.prisma.aboutUs.findFirst({
            where: { uuid, deletedAt: null },
        });

        if (!existing) {
            throw new NotFoundException('Section tidak ditemukan');
        }

        // Check for duplicate section
        if (dto.section) {
            const duplicate = await this.prisma.aboutUs.findFirst({
                where: { section: dto.section, id: { not: existing.id }, deletedAt: null },
            });

            if (duplicate) {
                throw new ConflictException('Section sudah ada');
            }
        }

        const section = await this.prisma.aboutUs.update({
            where: { id: existing.id },
            data: {
                ...dto,
                updatedBy,
            },
        });

        return {
            message: 'Section berhasil diupdate',
            data: section,
        };
    }

    async remove(uuid: string, deletedBy?: string) {
        const existing = await this.prisma.aboutUs.findFirst({
            where: { uuid, deletedAt: null },
        });

        if (!existing) {
            throw new NotFoundException('Section tidak ditemukan');
        }

        await this.prisma.aboutUs.update({
            where: { id: existing.id },
            data: {
                deletedAt: new Date(),
                deletedBy,
            },
        });

        return {
            message: 'Section berhasil dihapus',
            data: {},
        };
    }
}
