import Cookies from 'js-cookie';

const TOKEN_KEY = 'accessToken';
const USER_KEY = 'user';

// Cookie options with security settings
const cookieOptions: Cookies.CookieAttributes = {
  expires: 7, // 7 days
  secure: import.meta.env.PROD, // Only secure in production
  sameSite: 'lax',
  path: '/',
};

export const cookieUtils = {
  // Token management
  setToken: (token: string) => {
    Cookies.set(TOKEN_KEY, token, cookieOptions);
  },

  getToken: (): string | undefined => {
    return Cookies.get(TOKEN_KEY);
  },

  removeToken: () => {
    Cookies.remove(TOKEN_KEY, { path: '/' });
  },

  // User data management
  setUser: (user: any) => {
    Cookies.set(USER_KEY, JSON.stringify(user), cookieOptions);
  },

  getUser: <T = any>(): T | null => {
    const user = Cookies.get(USER_KEY);
    if (!user) return null;
    try {
      return JSON.parse(user) as T;
    } catch {
      return null;
    }
  },

  removeUser: () => {
    Cookies.remove(USER_KEY, { path: '/' });
  },

  // Clear all auth cookies
  clearAuth: () => {
    Cookies.remove(TOKEN_KEY, { path: '/' });
    Cookies.remove(USER_KEY, { path: '/' });
  },
};
