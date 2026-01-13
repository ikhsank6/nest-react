import api from '@/config/axios';
import { env } from '@/config/env';
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
  refreshToken?: string;
  user: AuthUser;
  menus: AuthMenu[];
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

export const authService = {
  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', data) as any;
    const authData = response?.data as AuthResponse;

    if (authData?.accessToken) {
      // Update Zustand store (which syncs with cookies) - include menus and refresh token
      // Use frontend env to determine if refresh token is enabled
      useAuthStore.getState().setAuth(
        authData.user,
        authData.accessToken,
        authData.menus || [],
        env.REFRESH_TOKEN_ENABLED ? authData.refreshToken : undefined,
      );
    }

    return authData;
  },

  register: async (data: RegisterData) => {
    return api.post('/auth/register', data);
  },

  verifyEmail: async (token: string) => {
    const response = await api.get(`/auth/verify-email?token=${token}`) as any;
    return response;
  },

  resendVerification: async (email: string) => {
    const response = await api.post('/auth/resend-verification', { email }) as any;
    return response;
  },

  forgotPassword: async (email: string) => {
    return api.post('/auth/forgot-password', { email });
  },

  resetPassword: async (token: string, password: string) => {
    return api.post('/auth/reset-password', { token, password });
  },

  getProfile: async () => {
    const response = await api.get('/auth/profile') as any;
    const user = response?.data;
    if (user) {
      useAuthStore.getState().setUser(user);
    }
    return user;
  },

  // Refresh access token using refresh token
  refresh: async (): Promise<RefreshResponse | null> => {
    const refreshToken = useAuthStore.getState().refreshToken;
    if (!refreshToken) {
      return null;
    }

    try {
      const response = await api.post('/auth/refresh', { refreshToken }) as any;
      const data = response?.data as RefreshResponse;

      if (data?.accessToken) {
        // Update tokens in store
        useAuthStore.getState().updateTokens(data.accessToken, data.refreshToken);
      }

      return data;
    } catch {
      // If refresh fails, logout
      authService.logout();
      return null;
    }
  },

  logout: async () => {
    const refreshToken = useAuthStore.getState().refreshToken;

    // Call logout API to revoke refresh token
    try {
      if (refreshToken) {
        await api.post('/auth/logout', { refreshToken });
      }
    } catch {
      // Ignore errors during logout
    }

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

  // Revoke all tokens (logout from all devices)
  revokeAllTokens: async () => {
    const response = await api.post('/auth/revoke-all-tokens') as any;
    return response;
  },
};


