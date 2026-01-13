import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { cookieUtils } from '@/lib/cookies';

// User type
export interface AuthUser {
  uuid: string;
  email: string;
  name: string;
  avatar: string | null;
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
  refreshToken: string | null;
  menus: AuthMenu[];
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  setAuth: (user: AuthUser, token: string, menus?: AuthMenu[], refreshToken?: string) => void;
  setUser: (user: AuthUser) => void;
  setMenus: (menus: AuthMenu[]) => void;
  setLoading: (loading: boolean) => void;
  updateTokens: (accessToken: string, refreshToken: string) => void;
  logout: () => void;
  hydrate: () => void;
  hasMenuAccess: (path: string) => boolean;
}

// Custom storage that syncs with cookies
const cookieStorage = {
  getItem: (_name: string) => {
    const token = cookieUtils.getToken();
    const user = cookieUtils.getUser<AuthUser>();
    const menusStr = localStorage.getItem('auth-menus');
    const menus = menusStr ? JSON.parse(menusStr) : [];
    const refreshToken = localStorage.getItem('auth-refresh-token');
    if (token && user) {
      return JSON.stringify({ state: { user, token, menus, refreshToken, isAuthenticated: true } });
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
      if (parsed.state?.refreshToken) {
        localStorage.setItem('auth-refresh-token', parsed.state.refreshToken);
      }
    } catch {
      // Ignore parse errors
    }
  },
  removeItem: (_name: string) => {
    cookieUtils.clearAuth();
    localStorage.removeItem('auth-menus');
    localStorage.removeItem('auth-refresh-token');
  },
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      token: null,
      refreshToken: null,
      menus: [],
      isAuthenticated: false,
      isLoading: true,

      // Set auth (user + token + menus + refreshToken)
      setAuth: (user, token, menus = [], refreshToken) => {
        cookieUtils.setToken(token);
        cookieUtils.setUser(user);
        localStorage.setItem('auth-menus', JSON.stringify(menus));
        if (refreshToken) {
          localStorage.setItem('auth-refresh-token', refreshToken);
        }
        set({
          user,
          token,
          menus,
          refreshToken: refreshToken || null,
          isAuthenticated: true,
          isLoading: false
        });
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

      // Update tokens (for refresh)
      updateTokens: (accessToken, refreshToken) => {
        cookieUtils.setToken(accessToken);
        localStorage.setItem('auth-refresh-token', refreshToken);
        set({ token: accessToken, refreshToken });
      },

      // Set loading state
      setLoading: (loading) => set({ isLoading: loading }),

      // Logout
      logout: () => {
        cookieUtils.clearAuth();
        localStorage.removeItem('auth-menus');
        localStorage.removeItem('auth-refresh-token');
        set({
          user: null,
          token: null,
          refreshToken: null,
          menus: [],
          isAuthenticated: false,
          isLoading: false
        });
      },

      // Hydrate from cookies
      hydrate: () => {
        const token = cookieUtils.getToken();
        const user = cookieUtils.getUser<AuthUser>();
        const menusStr = localStorage.getItem('auth-menus');
        const menus = menusStr ? JSON.parse(menusStr) : [];
        const refreshToken = localStorage.getItem('auth-refresh-token');
        if (token && user) {
          set({
            user,
            token,
            menus,
            refreshToken,
            isAuthenticated: true,
            isLoading: false
          });
        } else {
          set({ isLoading: false });
        }
      },

      // Check if user has access to a specific path
      hasMenuAccess: (path: string): boolean => {
        const state = get();
        const { menus, user } = state;

        // Admin has access to everything
        if (user?.role?.name === 'Admin') {
          return true;
        }

        // Dashboard is always accessible for authenticated users
        if (path === '/dashboard' || path === '/' || path === '/admin/dashboard' || path === '/admin') {
          return true;
        }

        // Helper function to check path in menu tree
        const checkMenuPath = (menuList: AuthMenu[]): boolean => {
          for (const menu of menuList) {
            // Check if menu path matches
            if (menu.path && path.startsWith(menu.path)) {
              return true;
            }
            // Check children
            if (menu.children && menu.children.length > 0) {
              if (checkMenuPath(menu.children)) {
                return true;
              }
            }
          }
          return false;
        };

        return checkMenuPath(menus);
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => cookieStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        menus: state.menus,
        refreshToken: state.refreshToken,
      }),
    }
  )
);


