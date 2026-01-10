import api from '@/config/axios';

export interface NewsCategory {
    uuid: string;
    name: string;
    slug: string;
    description: string | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    _count?: {
        news: number;
    };
}

export interface CreateNewsCategoryData {
    name: string;
    slug: string;
    description?: string;
    isActive?: boolean;
}

export interface UpdateNewsCategoryData {
    name?: string;
    slug?: string;
    description?: string;
    isActive?: boolean;
}

export const newsCategoryService = {
    getAll: async (includeInactive = false): Promise<any> => {
        const url = includeInactive ? '/cms/news-category?all=true' : '/cms/news-category';
        const response = await api.get(url) as any;
        return response;
    },

    getOne: async (uuid: string): Promise<NewsCategory> => {
        const response = await api.get(`/cms/news-category/${uuid}`) as any;
        return response?.data;
    },

    create: async (data: CreateNewsCategoryData) => {
        const response = await api.post('/cms/news-category', data) as any;
        return response?.data;
    },

    update: async (uuid: string, data: UpdateNewsCategoryData) => {
        const response = await api.put(`/cms/news-category/${uuid}`, data) as any;
        return response?.data;
    },

    delete: async (uuid: string) => {
        return api.delete(`/cms/news-category/${uuid}`);
    },
};
