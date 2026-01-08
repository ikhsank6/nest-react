import api from '@/config/axios';

export interface Menu {
  uuid: string;
  name: string;
  path: string | null;
  icon: string | null;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  children?: Menu[];
  parent?: Menu | null;
}

export const menuService = {
  getMyMenus: async (): Promise<Menu[]> => {
    const response = await api.get('/menu-access/my-menus') as any;
    return response?.data || [];
  },

  getAll: async (): Promise<Menu[]> => {
    const response = await api.get('/menus') as any;
    return response?.data || [];
  },

  getOne: async (uuid: string) => {
    const response = await api.get(`/menus/${uuid}`) as any;
    return response?.data;
  },

  create: async (data: Partial<Menu>) => {
    const response = await api.post('/menus', data) as any;
    return response?.data;
  },

  update: async (uuid: string, data: Partial<Menu>) => {
    const response = await api.put(`/menus/${uuid}`, data) as any;
    return response?.data;
  },

  delete: async (uuid: string) => {
    return api.delete(`/menus/${uuid}`);
  },
};
