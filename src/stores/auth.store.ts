import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService } from '@/services/auth.service';
import type { RegisterRequest, UserResponse } from '@/types/api.types';

interface AuthState {
  // State
  user: UserResponse | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  refreshAccessToken: () => Promise<void>;
  setUser: (user: UserResponse) => void;
  setLoading: (loading: boolean) => void;
  clearTokens: () => void;
}

export const authStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,

      // Login action
      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const response = await authService.login({ email, password });
          set({
            accessToken: response.access_token,
            refreshToken: response.refresh_token,
            isAuthenticated: true,
            isLoading: false,
          });

          // Store tokens in localStorage for API interceptor
          localStorage.setItem('access_token', response.access_token);
          localStorage.setItem('refresh_token', response.refresh_token);

          // Get user info
          try {
            const user = await authService.getCurrentUser();
            set({ user });
          } catch (error) {
            console.error('Failed to fetch user info:', error);
          }
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      // Register action
      register: async (data: RegisterRequest) => {
        set({ isLoading: true });
        try {
          const user = await authService.register(data);
          set({ user, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      // Logout action
      logout: () => {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        });
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
      },

      // Refresh access token
      refreshAccessToken: async () => {
        const { refreshToken } = get();
        if (!refreshToken || refreshToken === 'null' || refreshToken === 'undefined') {
          // Clear any invalid tokens and logout
          get().logout();
          throw new Error('No valid refresh token available');
        }

        try {
          const response = await authService.refreshToken(refreshToken);
          set({
            accessToken: response.access_token,
            refreshToken: response.refresh_token,
          });

          // Update localStorage
          localStorage.setItem('access_token', response.access_token);
          localStorage.setItem('refresh_token', response.refresh_token);
        } catch (error) {
          // Refresh failed - logout
          get().logout();
          throw error;
        }
      },

      // Set user manually
      setUser: (user: UserResponse) => set({ user }),

      // Set loading state
      setLoading: (isLoading: boolean) => set({ isLoading }),

      // Clear tokens (for testing)
      clearTokens: () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Initialize tokens from localStorage on app start
const accessToken = localStorage.getItem('access_token');
const refreshToken = localStorage.getItem('refresh_token');
if (accessToken && refreshToken) {
  authStore.setState({
    accessToken,
    refreshToken,
    isAuthenticated: true,
  });
}
