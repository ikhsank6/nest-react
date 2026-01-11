import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateAboutUsDto, UpdateAboutUsDto } from './dto/about-us.dto';
import { AboutUsResource } from './resources/about-us.resource';

@Injectable()
export class AboutUsService {
    constructor(private prisma: PrismaService) { }

    async get() {
        const profile = await this.prisma.aboutUs.findFirst({
            where: { deletedAt: null },
            include: { media: true },
            orderBy: { createdAt: 'desc' },
        });

        if (!profile) {
            return {
                message: 'Belum ada data profil perusahaan',
                data: null,
            };
        }

        return {
            message: 'Profil perusahaan berhasil diambil',
            data: new AboutUsResource(profile),
        };
    }

    async create(dto: CreateAboutUsDto, createdBy?: string) {
        let mediaId: number | null = null;
        if (dto.mediaUuid) {
            const media = await this.prisma.media.findUnique({
                where: { uuid: dto.mediaUuid },
            });
            if (media) mediaId = media.id;
        }

        const { mediaUuid, image, ...data } = dto as any;

        const profile = await this.prisma.aboutUs.create({
            data: {
                ...data,
                mediaId,
                createdBy,
                updatedBy: createdBy,
            } as any,
            include: { media: true },
        });

        return {
            message: 'Profil perusahaan berhasil dibuat',
            data: new AboutUsResource(profile),
        };
    }

    async update(uuid: string, dto: UpdateAboutUsDto, updatedBy?: string) {
        const existing = await this.prisma.aboutUs.findFirst({
            where: { uuid, deletedAt: null },
        });

        if (!existing) {
            throw new NotFoundException('Profil perusahaan tidak ditemukan');
        }

        let mediaId: number | null | undefined = undefined; // Use undefined to skip update if not provided
        if (dto.mediaUuid !== undefined) {
            if (dto.mediaUuid) {
                const media = await this.prisma.media.findUnique({
                    where: { uuid: dto.mediaUuid },
                });
                mediaId = media ? media.id : null;
            } else {
                mediaId = null;
            }
        }

        const { mediaUuid, image, ...data } = dto as any;

        const profile = await this.prisma.aboutUs.update({
            where: { id: existing.id },
            data: {
                ...data,
                ...(mediaId !== undefined && { mediaId }),
                updatedBy,
            } as any,
            include: { media: true },
        });

        return {
            message: 'Profil perusahaan berhasil diupdate',
            data: new AboutUsResource(profile),
        };
    }
}
