import axios from 'axios';
import { useAuthStore } from '@/store/useAuthStore';

// Base URL for API
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

export const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Important for sending/receiving HttpOnly cookies (refresh token)
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach Access Token
axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = useAuthStore.getState().accessToken;
    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401s and Auto-Refresh Token
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 Unauthorized, and we haven't already retried this request
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Attempt to refresh token using the HttpOnly cookie
        const refreshResponse = await axios.post(`${API_URL}/auth/refresh`, {}, {
          withCredentials: true // Must send cookies to the refresh endpoint
        });

        const newAccessToken = refreshResponse.data.data.accessToken;

        // Update the Zustand store with the new token
        useAuthStore.getState().setAccessToken(newAccessToken);

        // Retry the original request with the new token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // If refresh fails (e.g., token expired or family revoked), force logout
        useAuthStore.getState().logout();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
