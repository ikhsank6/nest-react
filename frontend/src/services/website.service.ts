import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Create axios instance for public website (no auth required)
const websiteApi = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Types
export interface CarouselItem {
    uuid: string;
    title: string;
    subtitle: string | null;
    linkUrl: string | null;
    linkText: string | null;
    order: number;
    image: {
        uuid: string;
        path: string;
        filename: string;
    } | null;
}

export interface AboutUsData {
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
    logo: {
        uuid: string;
        path: string;
        filename: string;
    } | null;
}

export interface NewsCategory {
    uuid: string;
    name: string;
    slug: string;
    description: string | null;
}

export interface NewsItem {
    uuid: string;
    title: string;
    slug: string;
    excerpt: string | null;
    content?: string;
    publishedAt: string;
    viewCount: number;
    category: NewsCategory | null;
    image: {
        uuid: string;
        path: string;
        filename: string;
    } | null;
}

export interface HomePageData {
    carousels: CarouselItem[];
    aboutUs: AboutUsData | null;
    latestNews: NewsItem[];
}

export interface PaginatedNews {
    data: NewsItem[];
    meta: {
        currentPage: number;
        lastPage: number;
        perPage: number;
        total: number;
    };
}

// API Functions
export const websiteService = {
    // Get homepage data (carousels, about us, latest news)
    async getHomePageData(): Promise<HomePageData> {
        const response = await websiteApi.get('/website/home');
        return response.data.data;
    },

    // Get carousels
    async getCarousels(): Promise<CarouselItem[]> {
        const response = await websiteApi.get('/website/carousels');
        return response.data.data;
    },

    // Get about us
    async getAboutUs(): Promise<AboutUsData | null> {
        const response = await websiteApi.get('/website/about-us');
        return response.data.data;
    },

    // Get news list with pagination
    async getNewsList(params?: {
        page?: number;
        limit?: number;
        search?: string;
        category?: string;
    }): Promise<PaginatedNews> {
        const response = await websiteApi.get('/website/news', { params });
        return {
            data: response.data.data,
            meta: response.data.meta,
        };
    },

    // Get news by slug
    async getNewsBySlug(slug: string): Promise<NewsItem> {
        const response = await websiteApi.get(`/website/news/${slug}`);
        return response.data.data;
    },

    // Get news categories
    async getNewsCategories(): Promise<NewsCategory[]> {
        const response = await websiteApi.get('/website/news-categories');
        return response.data.data;
    },
};
