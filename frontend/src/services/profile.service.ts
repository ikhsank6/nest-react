import api from '@/config/axios';
import type { User } from './user.service';

export interface UpdateProfileData {
  name?: string;
  email?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export const profileService = {
  getProfile: async (): Promise<User> => {
    const response = await api.get('/profile') as any;
    return response?.data;
  },

  updateProfile: async (data: UpdateProfileData): Promise<User> => {
    const response = await api.post('/profile/update', data) as any;
    return response?.data;
  },

  changePassword: async (data: ChangePasswordData): Promise<any> => {
    const response = await api.post('/profile/change-password', data) as any;
    return response;
  },

  updateAvatar: async (file: File): Promise<User> => {
    const formData = new FormData();
    formData.append('avatar', file);
    const response = await api.post('/profile/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }) as any;
    return response?.data;
  },

  /**
   * Get avatar as blob URL for secure image display
   * Uses axios interceptor for automatic auth token
   */
  getAvatarBlob: async (uuid: string): Promise<string | null> => {
    try {
      const response = await api.get(`/profile/avatar/${uuid}`, {
        responseType: 'blob',
      });
      const blob = response as unknown as Blob;
      return URL.createObjectURL(blob);
    } catch {
      return null;
    }
  },
};
