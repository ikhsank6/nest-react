import api from '@/config/axios';
import { createQueryParams } from '@/lib/utils';
import type { TableFilters } from '@/stores/table.store';

export interface User {
  uuid: string;
  name: string;
  email: string;
  avatar: string | null;
  isActive: boolean;
  verifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
  role: {
    uuid: string;
    name: string;
    description?: string;
  } | null;
  createdBy?: string | null;
  updatedBy?: string | null;
  deletedBy?: string | null;
}

export interface CreateUserData {
  name: string;
  email: string;
  password?: string;
  roleUuid: string;
  isActive?: boolean;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  password?: string;
  roleUuid?: string;
  isActive?: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    error: number;
    message: string | null;
    status: boolean;
    page?: {
      total: number;
      current_page: number;
      from: number;
      per_page: number;
    };
  };
}

export const userService = {
  getAll: async (page = 1, limit = 10, filters: TableFilters = {}): Promise<PaginatedResponse<User>> => {
    // Build query params with filters spread, mapping isActive to is_active for backend
    const { isActive, ...restFilters } = filters;
    const query = createQueryParams({
      page,
      limit,
      ...restFilters,
      ...(isActive !== undefined && { is_active: isActive }),
    });
    const response = await api.get(`/master-data/users?${query}`) as any;
    return response;
  },

  getOne: async (uuid: string): Promise<User> => {
    const response = await api.get(`/master-data/users/${uuid}`) as any;
    return response?.data;
  },

  create: async (data: CreateUserData) => {
    const response = await api.post('/master-data/users', data) as any;
    return response?.data;
  },

  update: async (uuid: string, data: UpdateUserData) => {
    const response = await api.put(`/master-data/users/${uuid}`, data) as any;
    return response?.data;
  },

  delete: async (uuid: string) => {
    return api.delete(`/master-data/users/${uuid}`);
  },

  resendVerification: async (uuid: string) => {
    const response = await api.post(`/master-data/users/${uuid}/resend-verification`) as any;
    return response;
  },
};
