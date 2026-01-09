import api from '@/config/axios';
import type { PaginatedResponse } from './user.service';

export const NotificationType = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
} as const;

export type NotificationType = (typeof NotificationType)[keyof typeof NotificationType];

export interface Notification {
  uuid: string;
  toRoleId: number;
  fromUserId: number | null;
  message: string;
  detailUrl: string | null;
  referenceId: string | null;
  type: NotificationType;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
}

export const notificationService = {
  getAll: async (page = 1, limit = 10, unreadOnly = false, search?: string): Promise<PaginatedResponse<Notification>> => {
    let url = `/notifications?page=${page}&limit=${limit}`;
    if (unreadOnly) url += `&unreadOnly=true`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    const response = await api.get(url) as any;
    return response;
  },

  getUnreadCount: async (): Promise<{ count: number }> => {
    const response = await api.get('/notifications/unread-count') as any;
    return response?.data;
  },

  markAsRead: async (uuids: string[]) => {
    const response = await api.post('/notifications/mark-read', { uuids }) as any;
    return response;
  },

  markAllAsRead: async () => {
    const response = await api.post('/notifications/mark-all-read') as any;
    return response;
  },

  delete: async (uuid: string) => {
    return api.delete(`/notifications/${uuid}`);
  },
};
