import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { authStore } from '@/stores/auth.store';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? '';

// Create axios instance
export const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = authStore.getState().accessToken;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - Handle 401 and token refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    // If 401 and not already tried refreshing
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Check if we have a valid refresh token before attempting refresh
      const refreshToken = authStore.getState().refreshToken;
      if (!refreshToken || refreshToken === 'null' || refreshToken === 'undefined') {
        // No valid refresh token - logout and redirect
        authStore.getState().logout();
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        // Try to refresh token
        await authStore.getState().refreshAccessToken();

        // Retry original request with new token
        const newToken = authStore.getState().accessToken;
        if (originalRequest.headers && newToken) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed - logout and redirect to login
        authStore.getState().logout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
