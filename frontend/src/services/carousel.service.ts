import api from '@/config/axios';
import { createQueryParams } from '@/lib/utils';
import type { TableFilters } from '@/stores/table.store';

export interface Carousel {
    uuid: string;
    title: string;
    subtitle: string | null;
    image: string | null;
    media?: {
        uuid: string;
        filename: string;
        original_name: string;
        url?: string;
    } | null;
    link: string | null;
    order: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    createdBy?: string | null;
}

export interface CreateCarouselData {
    title: string;
    subtitle?: string;
    image?: any;
    mediaUuid?: string;
    link?: string;
    order?: number;
    isActive?: boolean;
}

export interface UpdateCarouselData {
    title?: string;
    subtitle?: string;
    image?: any;
    mediaUuid?: string;
    link?: string;
    order?: number;
    isActive?: boolean;
}

export interface ReorderCarouselItem {
    uuid: string;
    order: number;
}

export const carouselService = {
    getAll: async (page = 1, limit = 10, filters: TableFilters = {}): Promise<any> => {
        const query = createQueryParams({ page, limit, all: true, ...filters });
        const response = await api.get(`/cms/carousel?${query}`) as any;
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

    reorder: async (items: ReorderCarouselItem[]) => {
        const response = await api.post('/cms/carousel/reorder', { items }) as any;
        return response?.data;
    },
};
