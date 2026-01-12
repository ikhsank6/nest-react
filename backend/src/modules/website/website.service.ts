import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { buildPaginatedResponse } from '../../common/utils/pagination.util';

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
            data: carousels.map((carousel: any) => ({
                uuid: carousel.uuid,
                title: carousel.title,
                subtitle: carousel.subtitle,
                linkUrl: carousel.linkUrl,
                linkText: carousel.linkText,
                order: carousel.order,
                image: carousel.media
                    ? {
                        uuid: carousel.media.uuid,
                        path: carousel.media.path,
                        filename: carousel.media.filename,
                    }
                    : null,
            })),
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
            data: {
                uuid: profile.uuid,
                companyName: profile.companyName,
                description: profile.description,
                address: profile.address,
                phone: profile.phone,
                email: profile.email,
                whatsapp: profile.whatsapp,
                facebook: profile.facebook,
                instagram: profile.instagram,
                twitter: profile.twitter,
                youtube: profile.youtube,
                linkedin: profile.linkedin,
                mapsUrl: profile.mapsUrl,
                logo: profile.media
                    ? {
                        uuid: profile.media.uuid,
                        path: profile.media.path,
                        filename: profile.media.filename,
                    }
                    : null,
            },
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
                    media: {
                        select: { uuid: true, filename: true, originalName: true, path: true },
                    },
                },
                orderBy: { publishedAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.news.count({ where: whereClause }),
        ]);

        const formattedNews = news.map((item) => ({
            uuid: item.uuid,
            title: item.title,
            slug: item.slug,
            excerpt: item.excerpt,
            publishedAt: item.publishedAt,
            viewCount: item.viewCount,
            category: item.category
                ? {
                    uuid: item.category.uuid,
                    name: item.category.name,
                    slug: item.category.slug,
                }
                : null,
            image: item.media
                ? {
                    uuid: item.media.uuid,
                    path: item.media.path,
                    filename: item.media.filename,
                }
                : null,
        }));

        return buildPaginatedResponse(formattedNews, total, page, limit, 'Daftar berita berhasil diambil');
    }

    async getNewsBySlug(slug: string) {
        const news = await this.prisma.news.findFirst({
            where: { slug, deletedAt: null, isPublished: true },
            include: {
                category: {
                    select: { uuid: true, name: true, slug: true },
                },
                media: {
                    select: { uuid: true, filename: true, originalName: true, path: true },
                },
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

        return {
            message: 'Berita berhasil diambil',
            data: {
                uuid: news.uuid,
                title: news.title,
                slug: news.slug,
                excerpt: news.excerpt,
                content: news.content,
                publishedAt: news.publishedAt,
                viewCount: news.viewCount + 1,
                category: news.category
                    ? {
                        uuid: news.category.uuid,
                        name: news.category.name,
                        slug: news.category.slug,
                    }
                    : null,
                image: news.media
                    ? {
                        uuid: news.media.uuid,
                        path: news.media.path,
                        filename: news.media.filename,
                    }
                    : null,
            },
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
            data: categories.map((cat) => ({
                uuid: cat.uuid,
                name: cat.name,
                slug: cat.slug,
                description: cat.description,
            })),
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
