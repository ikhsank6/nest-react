import api from '@/config/axios';
import { createQueryParams } from '@/lib/utils';
import type { TableFilters } from '@/stores/table.store';

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
  getAll: async (page = 1, limit = 10, filters: TableFilters = {}): Promise<any> => {
    const query = createQueryParams({ page, limit, ...filters });
    const response = await api.get(`/master-data/roles?${query}`) as any;
    return response;
  },

  getOne: async (uuid: string): Promise<Role> => {
    const response = await api.get(`/master-data/roles/${uuid}`) as any;
    return response?.data;
  },

  create: async (data: CreateRoleData) => {
    const response = await api.post('/master-data/roles', data) as any;
    return response?.data;
  },

  update: async (uuid: string, data: UpdateRoleData) => {
    const response = await api.put(`/master-data/roles/${uuid}`, data) as any;
    return response?.data;
  },

  delete: async (uuid: string) => {
    return api.delete(`/master-data/roles/${uuid}`);
  },
};
