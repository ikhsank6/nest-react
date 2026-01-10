import api from '@/config/axios';

export interface Carousel {
    uuid: string;
    title: string;
    subtitle: string | null;
    image: string;
    link: string | null;
    order: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateCarouselData {
    title: string;
    subtitle?: string;
    image: string;
    link?: string;
    order?: number;
    isActive?: boolean;
}

export interface UpdateCarouselData {
    title?: string;
    subtitle?: string;
    image?: string;
    link?: string;
    order?: number;
    isActive?: boolean;
}

export const carouselService = {
    getAll: async (includeInactive = false): Promise<any> => {
        const url = includeInactive ? '/cms/carousel?all=true' : '/cms/carousel';
        const response = await api.get(url) as any;
        return response;
    },

    getOne: async (uuid: string): Promise<Carousel> => {
        const response = await api.get(`/cms/carousel/${uuid}`) as any;
        return response?.data;
    },

    create: async (data: CreateCarouselData) => {
        const response = await api.post('/cms/carousel', data) as any;
        return response?.data;
    },

    update: async (uuid: string, data: UpdateCarouselData) => {
        const response = await api.put(`/cms/carousel/${uuid}`, data) as any;
        return response?.data;
    },

    delete: async (uuid: string) => {
        return api.delete(`/cms/carousel/${uuid}`);
    },
};
