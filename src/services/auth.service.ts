import { api } from './api';
import type {
  LoginRequest,
  RegisterRequest,
  TokenResponse,
  UserResponse,
} from '@/types/api.types';

export const authService = {
  /**
   * User login
   */
  async login(credentials: LoginRequest): Promise<TokenResponse> {
    const response = await api.post<TokenResponse>('/api/v1/auth/login', credentials);
    return response.data;
  },

  /**
   * User registration
   */
  async register(data: RegisterRequest): Promise<UserResponse> {
    const response = await api.post<UserResponse>('/api/v1/auth/register', data);
    return response.data;
  },

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<TokenResponse> {
    const response = await api.post<TokenResponse>('/api/v1/auth/refresh', {
      refresh_token: refreshToken,
    });
    return response.data;
  },

  /**
   * Get current user info
   */
  async getCurrentUser(): Promise<UserResponse> {
    const response = await api.get<UserResponse>('/api/v1/auth/me');
    return response.data;
  },
};
