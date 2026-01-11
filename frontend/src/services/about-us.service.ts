import api from '@/config/axios';

export interface Media {
    uuid: string;
    filename: string;
    originalName: string;
    mimeType: string;
    size: number;
    path: string;
    url: string;
}

export interface AboutUs {
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
    latitude: number | null;
    longitude: number | null;
    mapsUrl: string | null;
    logo: string | null;
    media: Media | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    createdBy?: string | null;
    updatedBy?: string | null;
}

export interface CreateAboutUsData {
    companyName: string;
    description: string;
    address?: string;
    phone?: string;
    email?: string;
    whatsapp?: string;
    facebook?: string;
    instagram?: string;
    twitter?: string;
    youtube?: string;
    linkedin?: string;
    latitude?: number | null;
    longitude?: number | null;
    mapsUrl?: string;
    logo?: string;
    mediaUuid?: string;
    isActive?: boolean;
}

export interface UpdateAboutUsData {
    companyName?: string;
    description?: string;
    address?: string;
    phone?: string;
    email?: string;
    whatsapp?: string;
    facebook?: string;
    instagram?: string;
    twitter?: string;
    youtube?: string;
    linkedin?: string;
    latitude?: number | null;
    longitude?: number | null;
    mapsUrl?: string;
    logo?: string;
    mediaUuid?: string;
    isActive?: boolean;
}

export const aboutUsService = {
    get: async (): Promise<AboutUs | null> => {
        const response = await api.get('/cms/about-us') as any;
        return response?.data;
    },

    create: async (data: CreateAboutUsData): Promise<AboutUs> => {
        const response = await api.post('/cms/about-us', data) as any;
        return response?.data;
    },

    update: async (uuid: string, data: UpdateAboutUsData): Promise<AboutUs> => {
        const response = await api.put(`/cms/about-us/${uuid}`, data) as any;
        return response?.data;
    },
};
