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

// Menu type
export interface AuthMenu {
  id: number;
  uuid: string;
  name: string;
  path: string | null;
  icon: string | null;
  order: number;
  isActive: boolean;
  children?: AuthMenu[];
}

interface AuthState {
  // State
  user: AuthUser | null;
  token: string | null;
  menus: AuthMenu[];
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  setAuth: (user: AuthUser, token: string, menus?: AuthMenu[]) => void;
  setUser: (user: AuthUser) => void;
  setMenus: (menus: AuthMenu[]) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
  hydrate: () => void;
}

// Custom storage that syncs with cookies
const cookieStorage = {
  getItem: (_name: string) => {
    const token = cookieUtils.getToken();
    const user = cookieUtils.getUser<AuthUser>();
    const menusStr = localStorage.getItem('auth-menus');
    const menus = menusStr ? JSON.parse(menusStr) : [];
    if (token && user) {
      return JSON.stringify({ state: { user, token, menus, isAuthenticated: true } });
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
      if (parsed.state?.menus) {
        localStorage.setItem('auth-menus', JSON.stringify(parsed.state.menus));
      }
    } catch {
      // Ignore parse errors
    }
  },
  removeItem: (_name: string) => {
    cookieUtils.clearAuth();
    localStorage.removeItem('auth-menus');
  },
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // Initial state
      user: null,
      token: null,
      menus: [],
      isAuthenticated: false,
      isLoading: true,

      // Set auth (user + token + menus)
      setAuth: (user, token, menus = []) => {
        cookieUtils.setToken(token);
        cookieUtils.setUser(user);
        localStorage.setItem('auth-menus', JSON.stringify(menus));
        set({ user, token, menus, isAuthenticated: true, isLoading: false });
      },

      // Update user only
      setUser: (user) => {
        cookieUtils.setUser(user);
        set({ user });
      },

      // Update menus only
      setMenus: (menus) => {
        localStorage.setItem('auth-menus', JSON.stringify(menus));
        set({ menus });
      },

      // Set loading state
      setLoading: (loading) => set({ isLoading: loading }),

      // Logout
      logout: () => {
        cookieUtils.clearAuth();
        localStorage.removeItem('auth-menus');
        set({ user: null, token: null, menus: [], isAuthenticated: false, isLoading: false });
      },

      // Hydrate from cookies
      hydrate: () => {
        const token = cookieUtils.getToken();
        const user = cookieUtils.getUser<AuthUser>();
        const menusStr = localStorage.getItem('auth-menus');
        const menus = menusStr ? JSON.parse(menusStr) : [];
        if (token && user) {
          set({ user, token, menus, isAuthenticated: true, isLoading: false });
        } else {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => cookieStorage),
      partialize: (state) => ({ user: state.user, token: state.token, menus: state.menus }),
    }
  )
);
