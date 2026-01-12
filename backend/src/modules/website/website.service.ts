import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { buildPaginatedResponse } from '../../common/utils/pagination.util';
import {
    WebsiteCarouselResource,
    WebsiteAboutUsResource,
    WebsiteNewsResource,
    WebsiteNewsDetailResource,
    WebsiteNewsCategoryResource,
} from './resources/website.resource';

@Injectable()
export class WebsiteService {
    constructor(private prisma: PrismaService) { }

    // ===== CAROUSEL =====
    async getCarousels() {
        const carousels = await (this.prisma as any).carousel.findMany({
            where: { deletedAt: null, isActive: true },
            include: { media: true },
            orderBy: { order: 'asc' },
        });

        return {
            message: 'Carousel berhasil diambil',
            data: WebsiteCarouselResource.collection(carousels),
        };
    }

    // ===== ABOUT US =====
    async getAboutUs() {
        const profile = await this.prisma.aboutUs.findFirst({
            where: { deletedAt: null },
            include: { media: true },
            orderBy: { createdAt: 'desc' },
        });

        if (!profile) {
            return {
                message: 'About us tidak ditemukan',
                data: null,
            };
        }

        return {
            message: 'About us berhasil diambil',
            data: new WebsiteAboutUsResource(profile),
        };
    }

    // ===== NEWS =====
    async getNewsList(page = 1, limit = 10, search?: string, categorySlug?: string) {
        const skip = (page - 1) * limit;

        const whereClause: any = {
            deletedAt: null,
            isPublished: true,
        };

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
                    media: true,
                },
                orderBy: { publishedAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.news.count({ where: whereClause }),
        ]);

        return buildPaginatedResponse(
            WebsiteNewsResource.collection(news),
            total,
            page,
            limit,
            'Daftar berita berhasil diambil',
        );
    }

    async getNewsBySlug(slug: string) {
        const news = await this.prisma.news.findFirst({
            where: { slug, deletedAt: null, isPublished: true },
            include: {
                category: {
                    select: { uuid: true, name: true, slug: true },
                },
                media: true,
            },
        });

        if (!news) {
            throw new NotFoundException('Berita tidak ditemukan');
        }

        // Increment view count
        await this.prisma.news.update({
            where: { id: news.id },
            data: { viewCount: { increment: 1 } },
        });

        // Return with updated view count
        const updatedNews = { ...news, viewCount: news.viewCount + 1 };

        return {
            message: 'Berita berhasil diambil',
            data: new WebsiteNewsDetailResource(updatedNews),
        };
    }

    // ===== NEWS CATEGORIES =====
    async getNewsCategories() {
        const categories = await this.prisma.newsCategory.findMany({
            where: { deletedAt: null },
            orderBy: { name: 'asc' },
        });

        return {
            message: 'Kategori berita berhasil diambil',
            data: WebsiteNewsCategoryResource.collection(categories),
        };
    }

    // ===== HOME PAGE DATA =====
    async getHomePageData() {
        const [carousels, aboutUs, latestNews] = await Promise.all([
            this.getCarousels(),
            this.getAboutUs(),
            this.getNewsList(1, 6),
        ]);

        return {
            message: 'Data homepage berhasil diambil',
            data: {
                carousels: carousels.data,
                aboutUs: aboutUs.data,
                latestNews: latestNews.data,
            },
        };
    }
}
