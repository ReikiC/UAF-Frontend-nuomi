import { api } from './api';
import type { TaskContinueRequest, TaskInfo } from '@/types/api.types';

export const tasksService = {
  /**
   * Cancel a running task
   */
  async cancelTask(taskId: string): Promise<{ status: string; task_id: string }> {
    const response = await api.delete(`/api/v1/task/${taskId}`);
    return response.data;
  },

  /**
   * Continue a cancelled task
   */
  async continueTask(taskId: string, request: TaskContinueRequest): Promise<Response> {
    const token = localStorage.getItem('access_token');
    const response = await fetch(`${api.defaults.baseURL}/api/v1/task/continue/${taskId}`, {
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

  /**
   * Get task status
   */
  async getTaskStatus(taskId: string): Promise<TaskInfo> {
    const response = await api.get<TaskInfo>(`/api/v1/task/${taskId}`);
    return response.data;
  },
};
