import api from '@/config/axios';

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
  getAll: async (page = 1, limit = 10, search?: string): Promise<PaginatedResponse<User>> => {
    let url = `/users?page=${page}&limit=${limit}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    const response = await api.get(url) as any;
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

  resendVerification: async (uuid: string) => {
    const response = await api.post(`/users/${uuid}/resend-verification`) as any;
    return response;
  },
};

