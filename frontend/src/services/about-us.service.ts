import api from '@/config/axios';

export interface AboutUs {
    uuid: string;
    section: string;
    title: string;
    content: string;
    image: string | null;
    order: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    createdBy?: string | null;
}

export interface CreateAboutUsData {
    section: string;
    title: string;
    content: string;
    image?: string;
    order?: number;
    isActive?: boolean;
}

export interface UpdateAboutUsData {
    section?: string;
    title?: string;
    content?: string;
    image?: string;
    order?: number;
    isActive?: boolean;
}

export const aboutUsService = {
    getAll: async (page = 1, limit = 10, search?: string): Promise<any> => {
        let url = `/cms/about-us?page=${page}&limit=${limit}&all=true`;
        if (search) url += `&search=${encodeURIComponent(search)}`;
        const response = await api.get(url) as any;
        return response;
    },

    getOne: async (uuid: string): Promise<AboutUs> => {
        const response = await api.get(`/cms/about-us/${uuid}`) as any;
        return response?.data;
    },

    create: async (data: CreateAboutUsData) => {
        const response = await api.post('/cms/about-us', data) as any;
        return response?.data;
    },

    update: async (uuid: string, data: UpdateAboutUsData) => {
        const response = await api.put(`/cms/about-us/${uuid}`, data) as any;
        return response?.data;
    },

    delete: async (uuid: string) => {
        return api.delete(`/cms/about-us/${uuid}`);
    },
};
