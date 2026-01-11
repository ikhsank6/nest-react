import axios, { type InternalAxiosRequestConfig, type AxiosResponse, type AxiosInstance } from 'axios';
import { env } from './env';
import { toast } from 'sonner';
import { cookieUtils } from '@/lib/cookies';
import { useAuthStore } from '@/stores/auth.store';
import { getErrorMessage } from '@/lib/utils';

// Default config for the axios instance
const axiosParams = {
  baseURL: env.API_URL,
  timeout: 180000, // 3 minutes timeout
};

// Create axios instance with default params
const axiosInstance = axios.create(axiosParams);

// Store for tracking ongoing requests
const ongoingRequests = new Map();

axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const accessToken = cookieUtils.getToken();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    // Don't set Content-Type if it's already set to null (for FormData) 
    // or if the data is an instance of FormData
    if (config.headers['Content-Type'] !== null && !(config.data instanceof FormData)) {
      config.headers['Content-Type'] = config.headers['Content-Type'] || 'application/json';
    } else if (config.headers['Content-Type'] === null) {
      delete config.headers['Content-Type'];
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    if (response.status) {
      // Return if data is Blob
      if (response.data instanceof Blob) return response;

      // Return if data is base64
      if (
        typeof response.data === 'string' &&
        response.headers['content-type'] === 'application/pdf'
      )
        return response.data;

      if (typeof response.data === 'string') {
        return Promise.reject(`Error: ${response.data}`);
      }

      if (response.data && 'meta' in response.data && response.data.meta.error) {
        console.error({ response });
        return Promise.reject(response.data.meta);
      }

      // else, sent data to view
      return response.data;
    }
    return Promise.reject('Periksa jaringan Anda');
  },
  async (error) => {
    // Use centralized error message extraction
    const message = getErrorMessage(error);

    // Only show toast if not on login page with 401 (invalid credentials is expected)
    const isLoginRequest = error.config?.url?.includes('/auth/login');

    // Show error toast
    toast.error(message);

    // Handle 401 or 403 - logout and redirect to login
    // But NOT for login/register requests (401 means wrong credentials, not session expired)
    if ((error.response?.status === 401 || error.response?.status === 403) && !isLoginRequest) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

const didAbort = (error: any) => axios.isCancel(error);

const getCancelSource = () => axios.CancelToken.source();

const withAbort =
  (fn: any, method: string) =>
    async (...args: any[]) => {
      const originalConfig = args[args.length - 1] || {};

      // Extract abort property from the config
      const { abort, baseURL, requestKey, useAbort = true, ...config } = originalConfig;

      // Generate a unique key for the request if not provided
      const key = requestKey || `${method}_${args[0]}`; // URL is the first argument

      // Cancel previous request with the same key (for GET requests)
      if (useAbort && method === 'GET' && ongoingRequests.has(key)) {
        const previousCancel = ongoingRequests.get(key);
        previousCancel('Request cancelled due to new request');
        ongoingRequests.delete(key);
      }

      // Override baseURL if provided in the request config
      if (baseURL) {
        config.baseURL = baseURL;
      }

      // Create cancel token
      const { cancel, token } = getCancelSource();
      config.cancelToken = token;

      // Store the cancel function for GET requests
      if (method === 'GET') {
        ongoingRequests.set(key, cancel);
      }

      // If abort function was passed, call it with cancel
      if (typeof abort === 'function') {
        abort(cancel);
      }

      try {
        // Pass all arguments from args besides the config
        const result = await fn(...args.slice(0, args.length - 1), config);

        // Remove from ongoing requests on success
        if (method === 'GET') {
          ongoingRequests.delete(key);
        }

        return result;
      } catch (error: any) {
        // Remove from ongoing requests on error
        if (method === 'GET') {
          ongoingRequests.delete(key);
        }

        // Add "aborted" property to the error if the request was cancelled
        if (didAbort(error)) {
          (error as any).aborted = true;
        }

        if (error.response?.data instanceof Blob) {
          const jsonData = await new Response(error.response.data as Blob).text();
          throw new Error(jsonData);
        }
        throw error;
      }
    };

// Main api function
const api = (axiosClient: AxiosInstance) => {
  return {
    get: (url: string, config = {}) => withAbort(axiosClient.get, 'GET')(url, config),
    post: (url: string, body?: any, config = {}) => withAbort(axiosClient.post, 'POST')(url, body, config),
    patch: (url: string, body?: any, config = {}) => withAbort(axiosClient.patch, 'PATCH')(url, body, config),
    put: (url: string, body?: any, config = {}) => withAbort(axiosClient.put, 'PUT')(url, body, config),
    delete: (url: string, config = {}) => withAbort(axiosClient.delete, 'DELETE')(url, config),
    // Expose original instances if needed
    axiosInstance: axiosClient,
  };
};

export default api(axiosInstance);
