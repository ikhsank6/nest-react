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

  getAll: async (params?: { search?: string }): Promise<any> => {
    const response = await api.get('/menus', { params: { search: params?.search } }) as any;
    return response;
  },

  getTree: async (): Promise<any> => {
    const response = await api.get('/menus/akses') as any;
    return response;
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

  reorder: async (items: { uuid: string; order: number; parentUuid?: string | null }[]) => {
    const response = await api.post('/menus/reorder', { items }) as any;
    return response?.data;
  },
};
