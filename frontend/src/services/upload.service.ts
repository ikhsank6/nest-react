import api from '@/config/axios';

export interface UploadResponse {
    uuid: string;
    filename: string;
    original_name: string;
    url: string;
}

export const uploadService = {
    uploadImage: async (file: File): Promise<UploadResponse> => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await api.post('/upload/image', formData, {
            headers: {
                'Content-Type': null as any,
            },
        }) as any;

        return response.data;
    },

    deleteMedia: async (uuid: string): Promise<any> => {
        const response = await api.delete(`/upload/${uuid}`) as any;
        return response.data;
    }
};
