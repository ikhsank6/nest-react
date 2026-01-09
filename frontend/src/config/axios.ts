import axios from 'axios';
import { env } from './env';
import { toast } from 'sonner';
import { cookieUtils } from '@/lib/cookies';
import { useAuthStore } from '@/stores/auth.store';

const api = axios.create({
  baseURL: env.API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token from cookies
api.interceptors.request.use(
  (config) => {
    const token = cookieUtils.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => {
    // Return if data is Blob
      if (response.data instanceof Blob) return response

      // Return if data is base64
      if (
        typeof response.data === 'string' &&
        response.headers['content-type'] === 'application/pdf'
      )
        return response.data
    // Return the full response data, let services handle extraction
    return response.data;
  },
  (error) => {
    const meta = error.response?.data?.meta;
    
    if (meta) {
      toast.error(`${meta.message} (${meta.error})`);
    } else if (error.message === 'Network Error') {
      toast.error('Tidak dapat terhubung ke server');
    } else {
      toast.error('Terjadi kesalahan');
    }

    // Handle 401 - logout and redirect to login
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default api;
