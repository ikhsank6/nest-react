import api from '@/config/axios';

export interface User {
  uuid: string;
  name: string;
  email: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  role: {
    uuid: string;
    name: string;
    description?: string;
  } | null;
}

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
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
  getAll: async (page = 1, limit = 10): Promise<User[]> => {
    const response = await api.get(`/users?page=${page}&limit=${limit}`) as any;
    // Extract data array from response
    return response?.data || [];
  },

  getAllWithMeta: async (page = 1, limit = 10): Promise<PaginatedResponse<User>> => {
    const response = await api.get(`/users?page=${page}&limit=${limit}`) as any;
    return response;
  },

  getOne: async (uuid: string): Promise<User> => {
    const response = await api.get(`/users/${uuid}`) as any;
    return response?.data;
  },

  create: async (data: CreateUserData) => {
    const response = await api.post('/users', data) as any;
    return response?.data;
  },

  update: async (uuid: string, data: UpdateUserData) => {
    const response = await api.put(`/users/${uuid}`, data) as any;
    return response?.data;
  },

  delete: async (uuid: string) => {
    return api.delete(`/users/${uuid}`);
  },
};
