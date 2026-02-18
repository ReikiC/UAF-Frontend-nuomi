import { api } from './api';
import type {
  SessionCreate,
  SessionDetail,
  SessionListResponse,
  SessionUpdate,
} from '@/types/api.types';

export const sessionsService = {
  /**
   * List all sessions
   */
  async listSessions(limit = 20, offset = 0): Promise<SessionListResponse> {
    const response = await api.get<SessionListResponse>('/api/v1/sessions', {
      params: { limit, offset },
    });
    return response.data;
  },

  /**
   * Get session details with messages
   */
  async getSession(sessionId: string): Promise<SessionDetail> {
    const response = await api.get<SessionDetail>(`/api/v1/sessions/${sessionId}`);
    return response.data;
  },

  /**
   * Create a new session
   */
  async createSession(data: SessionCreate = {}): Promise<SessionDetail> {
    const response = await api.post<SessionDetail>('/api/v1/sessions', data);
    return response.data;
  },

  /**
   * Update session (title, model)
   */
  async updateSession(sessionId: string, data: SessionUpdate): Promise<SessionDetail> {
    const response = await api.put<SessionDetail>(`/api/v1/sessions/${sessionId}`, data);
    return response.data;
  },

  /**
   * Delete session (soft delete)
   */
  async deleteSession(sessionId: string): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`/api/v1/sessions/${sessionId}`);
    return response.data;
  },

  /**
   * Restore deleted session
   */
  async restoreSession(sessionId: string): Promise<{ success: boolean; message: string }> {
    const response = await api.post(`/api/v1/sessions/${sessionId}/restore`);
    return response.data;
  },

  /**
   * Get session messages
   */
  async getMessages(sessionId: string, limit = 100, offset = 0) {
    const response = await api.get(`/api/v1/sessions/${sessionId}/messages`, {
      params: { limit, offset },
    });
    return response.data;
  },
};
