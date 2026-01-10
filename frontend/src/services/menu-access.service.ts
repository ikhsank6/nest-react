import api from '@/config/axios';
import type { Menu } from './menu.service';
import type { Role } from './role.service';

export interface MenuAccess {
  id: number;
  uuid: string;
  roleId: number;
  menuId: number;
  role?: Role;
  menu?: Menu;
  createdAt: string;
  updatedAt: string;
}

export interface BulkMenuAccessDto {
  roleUuid: string;
  menuUuids: string[];
}

export const menuAccessService = {
  findByRole: async (roleUuid: string): Promise<MenuAccess[]> => {
    const response = await api.get(`/master-data/menu-access/role/${roleUuid}`) as any;
    return response?.data || [];
  },

  update: async (uuid: string, data: Partial<MenuAccess>) => {
    const response = await api.put(`/master-data/menu-access/${uuid}`, data) as any;
    return response?.data;
  },

  bulkUpdate: async (data: BulkMenuAccessDto) => {
    const response = await api.put('/master-data/menu-access/bulk', data) as any;
    return response?.data;
  },
};
