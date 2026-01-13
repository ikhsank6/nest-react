export const env = {
  API_URL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  BASE_URL: (import.meta.env.VITE_API_URL || 'http://localhost:3000/api').replace(/\/api$/, ''),
  REFRESH_TOKEN_ENABLED: import.meta.env.VITE_REFRESH_TOKEN_ENABLED === 'true',
};

