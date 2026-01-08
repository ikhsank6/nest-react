import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { cookieUtils } from '@/lib/cookies';

// User type
export interface AuthUser {
  uuid: string;
  email: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  role: {
    uuid: string;
    name: string;
  } | null;
}

interface AuthState {
  // State
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  setAuth: (user: AuthUser, token: string) => void;
  setUser: (user: AuthUser) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
  hydrate: () => void;
}

// Custom storage that syncs with cookies
const cookieStorage = {
  getItem: (_name: string) => {
    const token = cookieUtils.getToken();
    const user = cookieUtils.getUser<AuthUser>();
    if (token && user) {
      return JSON.stringify({ state: { user, token, isAuthenticated: true } });
    }
    return null;
  },
  setItem: (_name: string, value: string) => {
    try {
      const parsed = JSON.parse(value);
      if (parsed.state?.token) {
        cookieUtils.setToken(parsed.state.token);
      }
      if (parsed.state?.user) {
        cookieUtils.setUser(parsed.state.user);
      }
    } catch {
      // Ignore parse errors
    }
  },
  removeItem: (_name: string) => {
    cookieUtils.clearAuth();
  },
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // Initial state
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: true,

      // Set auth (user + token)
      setAuth: (user, token) => {
        cookieUtils.setToken(token);
        cookieUtils.setUser(user);
        set({ user, token, isAuthenticated: true, isLoading: false });
      },

      // Update user only
      setUser: (user) => {
        cookieUtils.setUser(user);
        set({ user });
      },

      // Set loading state
      setLoading: (loading) => set({ isLoading: loading }),

      // Logout
      logout: () => {
        cookieUtils.clearAuth();
        set({ user: null, token: null, isAuthenticated: false, isLoading: false });
      },

      // Hydrate from cookies
      hydrate: () => {
        const token = cookieUtils.getToken();
        const user = cookieUtils.getUser<AuthUser>();
        if (token && user) {
          set({ user, token, isAuthenticated: true, isLoading: false });
        } else {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => cookieStorage),
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
);
