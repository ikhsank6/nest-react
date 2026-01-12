/**
 * Website Image Resource - Simplified image format for public API
 * Frontend expects: { uuid, path, filename }
 */
export interface WebsiteImageResource {
    uuid: string;
    path: string;
    filename: string;
}

/**
 * Helper function to format media for website API
 * Uses public endpoint: /api/website/media/:uuid
 */
function formatImage(media: any): WebsiteImageResource | null {
    if (!media) return null;
    return {
        uuid: media.uuid,
        path: `/api/website/media/${media.uuid}`,
        filename: media.filename,
    };
}

/**
 * Website Carousel Resource - Public API response format
 */
export class WebsiteCarouselResource {
    uuid: string;
    title: string;
    subtitle: string | null;
    linkUrl: string | null;
    linkText: string | null;
    order: number;
    image: WebsiteImageResource | null;

    constructor(carousel: any) {
        this.uuid = carousel.uuid;
        this.title = carousel.title;
        this.subtitle = carousel.subtitle || null;
        this.linkUrl = carousel.link || null;
        this.linkText = carousel.linkText || null;
        this.order = carousel.order;
        this.image = formatImage(carousel.media);
    }

    static collection(carousels: any[]): WebsiteCarouselResource[] {
        return carousels.map((carousel) => new WebsiteCarouselResource(carousel));
    }
}

/**
 * Website About Us Resource - Public API response format
 */
export class WebsiteAboutUsResource {
    uuid: string;
    companyName: string;
    description: string;
    address: string | null;
    phone: string | null;
    email: string | null;
    whatsapp: string | null;
    facebook: string | null;
    instagram: string | null;
    twitter: string | null;
    youtube: string | null;
    linkedin: string | null;
    mapsUrl: string | null;
    logo: WebsiteImageResource | null;

    constructor(aboutUs: any) {
        this.uuid = aboutUs.uuid;
        this.companyName = aboutUs.companyName;
        this.description = aboutUs.description;
        this.address = aboutUs.address || null;
        this.phone = aboutUs.phone || null;
        this.email = aboutUs.email || null;
        this.whatsapp = aboutUs.whatsapp || null;
        this.facebook = aboutUs.facebook || null;
        this.instagram = aboutUs.instagram || null;
        this.twitter = aboutUs.twitter || null;
        this.youtube = aboutUs.youtube || null;
        this.linkedin = aboutUs.linkedin || null;
        this.mapsUrl = aboutUs.mapsUrl || null;
        this.logo = formatImage(aboutUs.media);
    }
}

/**
 * Website News Resource - Public API response format (list view)
 */
export class WebsiteNewsResource {
    uuid: string;
    title: string;
    slug: string;
    excerpt: string | null;
    publishedAt: string | null;
    viewCount: number;
    category: {
        uuid: string;
        name: string;
        slug: string;
    } | null;
    image: WebsiteImageResource | null;

    constructor(news: any) {
        this.uuid = news.uuid;
        this.title = news.title;
        this.slug = news.slug;
        this.excerpt = news.excerpt || null;
        this.publishedAt = news.publishedAt?.toISOString?.() || news.publishedAt || null;
        this.viewCount = news.viewCount || 0;
        this.category = news.category
            ? {
                uuid: news.category.uuid,
                name: news.category.name,
                slug: news.category.slug,
            }
            : null;
        this.image = formatImage(news.media);
    }

    static collection(newsList: any[]): WebsiteNewsResource[] {
        return newsList.map((news) => new WebsiteNewsResource(news));
    }
}

/**
 * Website News Detail Resource - Public API response format (detail view)
 */
export class WebsiteNewsDetailResource extends WebsiteNewsResource {
    content: string;

    constructor(news: any) {
        super(news);
        this.content = news.content;
    }
}

/**
 * Website News Category Resource - Public API response format
 */
export class WebsiteNewsCategoryResource {
    uuid: string;
    name: string;
    slug: string;
    description: string | null;

    constructor(category: any) {
        this.uuid = category.uuid;
        this.name = category.name;
        this.slug = category.slug;
        this.description = category.description || null;
    }

    static collection(categories: any[]): WebsiteNewsCategoryResource[] {
        return categories.map((cat) => new WebsiteNewsCategoryResource(cat));
    }
}
