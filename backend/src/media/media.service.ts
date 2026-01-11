import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { existsSync, unlinkSync } from 'fs';
import { join } from 'path';

const uploadPath = './uploads/images';

export interface CreateMediaDto {
    filename: string;
    originalName: string;
    mimeType: string;
    size: number;
    path: string;
    createdBy?: string;
}

@Injectable()
export class MediaService {
    constructor(private prisma: PrismaService) { }

    async create(data: CreateMediaDto) {
        return (this.prisma as any).media.create({
            data,
        });
    }

    async findByUuid(uuid: string) {
        return (this.prisma as any).media.findUnique({
            where: { uuid },
        });
    }

    async findById(id: number) {
        return (this.prisma as any).media.findUnique({
            where: { id },
        });
    }

    async delete(uuid: string) {
        const media = await this.findByUuid(uuid);

        if (!media) {
            throw new NotFoundException('Media not found');
        }

        // Delete from storage
        const filePath = join(process.cwd(), uploadPath, media.filename);
        if (existsSync(filePath)) {
            try {
                unlinkSync(filePath);
            } catch (err) {
                console.error(`Failed to delete file: ${filePath}`, err);
            }
        }

        // Delete from db
        await (this.prisma as any).media.delete({
            where: { uuid },
        });

        return true;
    }

    async softDelete(uuid: string, deletedBy?: string) {
        const media = await this.findByUuid(uuid);

        if (!media) {
            throw new NotFoundException('Media not found');
        }

        return (this.prisma as any).media.update({
            where: { uuid },
            data: {
                deletedAt: new Date(),
                deletedBy,
            },
        });
    }
}
