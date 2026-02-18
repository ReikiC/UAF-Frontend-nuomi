import { api } from './api';
import type { ChatRequest } from '@/types/api.types';

export const chatService = {
  /**
   * Get available chat endpoints
   */
  async getEndpoints() {
    const response = await api.get('/api/v1/chat/endpoints');
    return response.data;
  },

  /**
   * Send chat message (returns the URL for SSE connection)
   */
  getChatUrl(endpoint: string = '/api/v1/chat/single/toolcalls/stream/v2'): string {
    return `${api.defaults.baseURL}${endpoint}`;
  },

  /**
   * Send chat request with streaming
   */
  async sendMessage(request: ChatRequest, endpoint: string = '/api/v1/chat/single/toolcalls/stream/v2'): Promise<Response> {
    const token = localStorage.getItem('access_token');
    const response = await fetch(`${api.defaults.baseURL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response;
  },
};
