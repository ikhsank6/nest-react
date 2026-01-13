import axios, { type InternalAxiosRequestConfig, type AxiosResponse, type AxiosInstance, type AxiosError } from 'axios';
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

// Flag to prevent multiple refresh requests
let isRefreshing = false;
let failedQueue: { resolve: (value: any) => void; reject: (reason?: any) => void }[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

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
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Check if it's a 401 error and not a retry
    const isLoginRequest = originalRequest?.url?.includes('/auth/login');
    const isRefreshRequest = originalRequest?.url?.includes('/auth/refresh');

    // Try to refresh token on 401 (except for login/refresh requests)
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isLoginRequest &&
      !isRefreshRequest
    ) {
      const { refreshToken } = useAuthStore.getState();

      // If refresh token feature is enabled (via frontend env) and token is available
      if (env.REFRESH_TOKEN_ENABLED && refreshToken) {
        if (isRefreshing) {
          // Wait for the ongoing refresh to complete
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return axiosInstance(originalRequest);
            })
            .catch((err) => {
              return Promise.reject(err);
            });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const response = await axios.post(`${env.API_URL}/auth/refresh`, { refreshToken });
          const data = response.data?.data;

          if (data?.accessToken) {
            // Update tokens in store
            useAuthStore.getState().updateTokens(data.accessToken, data.refreshToken);

            // Update authorization header
            originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;

            // Process queued requests
            processQueue(null, data.accessToken);

            // Retry original request
            return axiosInstance(originalRequest);
          }
        } catch (refreshError) {
          processQueue(refreshError, null);
          // Refresh failed, logout user
          useAuthStore.getState().logout();
          window.location.href = '/login';
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      } else {
        // No refresh token, logout
        useAuthStore.getState().logout();
        window.location.href = '/login';
      }
    }

    // Use centralized error message extraction
    const message = getErrorMessage(error);

    // Show error toast (but not for 401 on login - that's expected for wrong credentials)
    if (!(error.response?.status === 401 && isLoginRequest)) {
      toast.error(message);
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
