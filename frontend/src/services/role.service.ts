import api from '@/config/axios';

export interface Role {
  uuid: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy?: string | null;
  updatedBy?: string | null;
  deletedBy?: string | null;
}

export interface CreateRoleData {
  name: string;
  description?: string;
}

export interface UpdateRoleData {
  name?: string;
  description?: string;
}

export const roleService = {
  getAll: async (page = 1, limit = 10, search?: string): Promise<any> => {
    let url = `/roles?page=${page}&limit=${limit}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    const response = await api.get(url) as any;
    return response;
  },

  getOne: async (uuid: string): Promise<Role> => {
    const response = await api.get(`/roles/${uuid}`) as any;
    return response?.data;
  },

  create: async (data: CreateRoleData) => {
    const response = await api.post('/roles', data) as any;
    return response?.data;
  },

  update: async (uuid: string, data: UpdateRoleData) => {
    const response = await api.put(`/roles/${uuid}`, data) as any;
    return response?.data;
  },

  delete: async (uuid: string) => {
    return api.delete(`/roles/${uuid}`);
  },
};
