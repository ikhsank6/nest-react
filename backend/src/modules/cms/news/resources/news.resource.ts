import { MediaResource } from "src/media/resources/media.resource";

export class NewsResource {
    uuid: string;
    title: string;
    slug: string;
    excerpt: string | null;
    content: string;
    image: string | null;
    media: MediaResource | null;
    viewCount: number;
    isPublished: boolean;
    publishedAt: string | null;
    category: {
        uuid: string;
        name: string;
        slug: string;
    } | null;
    createdAt: string;
    updatedAt: string;
    createdBy: string | null;
    updatedBy: string | null;

    constructor(news: any) {
        this.uuid = news.uuid;
        this.title = news.title;
        this.slug = news.slug;
        this.excerpt = news.excerpt || null;
        this.content = news.content;
        this.image = news.image || null;
        this.media = MediaResource.fromEntity(news.media);
        this.viewCount = news.viewCount || 0;
        this.isPublished = news.isPublished;
        this.publishedAt = news.publishedAt?.toISOString?.() || news.publishedAt || null;
        this.category = news.category
            ? {
                uuid: news.category.uuid,
                name: news.category.name,
                slug: news.category.slug,
            }
            : null;
        this.createdAt = news.createdAt?.toISOString?.() || news.createdAt;
        this.updatedAt = news.updatedAt?.toISOString?.() || news.updatedAt;
        this.createdBy = news.createdBy || null;
        this.updatedBy = news.updatedBy || null;
    }

    static collection(newsList: any[]): NewsResource[] {
        return newsList.map((news) => new NewsResource(news));
    }

    toJSON() {
        return {
            uuid: this.uuid,
            title: this.title,
            slug: this.slug,
            excerpt: this.excerpt,
            content: this.content,
            image: this.image,
            media: this.media,
            viewCount: this.viewCount,
            isPublished: this.isPublished,
            publishedAt: this.publishedAt,
            category: this.category,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            createdBy: this.createdBy,
            updatedBy: this.updatedBy,
        };
    }
}
