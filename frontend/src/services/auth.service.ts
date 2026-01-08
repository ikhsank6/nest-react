import api from '@/config/axios';
import { cookieUtils } from '@/lib/cookies';
import { useAuthStore, type AuthUser, type AuthMenu } from '@/stores/auth.store';

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  roleId?: number;
}

export interface AuthResponse {
  accessToken: string;
  user: AuthUser;
  menus: AuthMenu[];
}

export const authService = {
  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', data) as any;
    const authData = response?.data as AuthResponse;
    
    if (authData?.accessToken) {
      // Update Zustand store (which syncs with cookies) - include menus
      useAuthStore.getState().setAuth(authData.user, authData.accessToken, authData.menus || []);
    }
    
    return authData;
  },

  register: async (data: RegisterData) => {
    return api.post('/auth/register', data);
  },

  forgotPassword: async (email: string) => {
    return api.post('/auth/forgot-password', { email });
  },

  getProfile: async () => {
    const response = await api.get('/auth/profile') as any;
    const user = response?.data;
    if (user) {
      useAuthStore.getState().setUser(user);
    }
    return user;
  },

  logout: () => {
    useAuthStore.getState().logout();
    window.location.href = '/login';
  },

  isAuthenticated: () => {
    return !!cookieUtils.getToken();
  },

  getUser: () => {
    return useAuthStore.getState().user;
  },

  getToken: () => {
    return cookieUtils.getToken();
  },
};
