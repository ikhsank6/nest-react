import api from '@/config/axios';

export interface Role {
  uuid: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const roleService = {
  getAll: async (): Promise<Role[]> => {
    const response = await api.get('/roles') as any;
    return response?.data || [];
  },

  getOne: async (uuid: string): Promise<Role> => {
    const response = await api.get(`/roles/${uuid}`) as any;
    return response?.data;
  },
};
