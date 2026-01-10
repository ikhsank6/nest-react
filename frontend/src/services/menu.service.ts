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
  createdBy?: string | null;
  updatedBy?: string | null;
  deletedBy?: string | null;
}

export const menuService = {
  getMyMenus: async (): Promise<Menu[]> => {
    const response = await api.get('/master-data/menu-access/my-menus') as any;
    return response?.data || [];
  },

  getAll: async (params?: { search?: string }): Promise<any> => {
    const response = await api.get('/master-data/menus', { params: { search: params?.search } }) as any;
    return response;
  },

  getTree: async (): Promise<any> => {
    const response = await api.get('/master-data/menus/akses') as any;
    return response;
  },

  getOne: async (uuid: string) => {
    const response = await api.get(`/master-data/menus/${uuid}`) as any;
    return response?.data;
  },

  create: async (data: Partial<Menu>) => {
    const response = await api.post('/master-data/menus', data) as any;
    return response?.data;
  },

  update: async (uuid: string, data: Partial<Menu>) => {
    const response = await api.put(`/master-data/menus/${uuid}`, data) as any;
    return response?.data;
  },

  delete: async (uuid: string) => {
    return api.delete(`/master-data/menus/${uuid}`);
  },

  reorder: async (items: { uuid: string; order: number; parentUuid?: string | null }[]) => {
    const response = await api.post('/master-data/menus/reorder', { items }) as any;
    return response?.data;
  },
};
