import api from '@/config/axios';
import type { Menu } from './menu.service';
import type { Role } from './role.service';

export interface MenuAccess {
  id: number;
  roleId: number;
  menuId: number;
  role?: Role;
  menu?: Menu;
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MenuAccessItemDto {
  menuUuid: string;
  canView?: boolean;
  canCreate?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
}

export interface BulkMenuAccessDto {
  roleUuid: string;
  menuAccess: MenuAccessItemDto[];
}

export const menuAccessService = {
  findByRole: async (roleUuid: string): Promise<MenuAccess[]> => {
    const response = await api.get(`/menu-access/role/${roleUuid}`) as any;
    return response?.data || [];
  },

  update: async (uuid: string, data: Partial<MenuAccess>) => {
    const response = await api.put(`/menu-access/${uuid}`, data) as any;
    return response?.data;
  },

  bulkUpdate: async (data: BulkMenuAccessDto) => {
    const response = await api.put('/menu-access/bulk', data) as any;
    return response?.data;
  },
};
