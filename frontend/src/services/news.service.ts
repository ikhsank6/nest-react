import api from '@/config/axios';

export interface NewsMedia {
    uuid: string;
    filename: string;
    originalName: string;
    url: string;
}

export interface News {
    uuid: string;
    title: string;
    slug: string;
    excerpt: string | null;
    content: string;
    image: string | null;
    media: NewsMedia | null;
    isPublished: boolean;
    publishedAt: string | null;
    viewCount: number;
    createdBy?: string;
    createdAt: string;
    updatedAt: string;
    category: {
        uuid: string;
        name: string;
        slug: string;
    };
}

export interface CreateNewsData {
    title: string;
    slug: string;
    excerpt?: string;
    content: string;
    image?: string;
    mediaUuid?: string;
    categoryUuid: string;
    isPublished?: boolean;
}

export interface UpdateNewsData {
    title?: string;
    slug?: string;
    excerpt?: string;
    content?: string;
    image?: string;
    mediaUuid?: string;
    categoryUuid?: string;
    isPublished?: boolean;
}

export const newsService = {
    getAll: async (page = 1, limit = 10, search?: string, category?: string, includeUnpublished = false): Promise<any> => {
        let url = `/cms/news?page=${page}&limit=${limit}`;
        if (search) url += `&search=${encodeURIComponent(search)}`;
        if (category) url += `&category=${encodeURIComponent(category)}`;
        if (includeUnpublished) url += '&all=true';
        const response = await api.get(url) as any;
        return response;
    },

    getOne: async (uuid: string): Promise<News> => {
        const response = await api.get(`/cms/news/${uuid}`) as any;
        return response?.data;
    },

    getBySlug: async (slug: string): Promise<News> => {
        const response = await api.get(`/cms/news/slug/${slug}`) as any;
        return response?.data;
    },

    create: async (data: CreateNewsData) => {
        const response = await api.post('/cms/news', data) as any;
        return response?.data;
    },

    update: async (uuid: string, data: UpdateNewsData) => {
        const response = await api.put(`/cms/news/${uuid}`, data) as any;
        return response?.data;
    },

    delete: async (uuid: string) => {
        return api.delete(`/cms/news/${uuid}`);
    },
};
