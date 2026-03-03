import { api } from './api';
import type { MCPServerList } from '@/types/api.types';

/**
 * MCP Service
 * Handles all MCP server related API calls
 */
export const mcpService = {
  /**
   * Get all available MCP servers with their tools
   */
  async getServers(): Promise<MCPServerList> {
    const response = await api.get<MCPServerList>('/api/v1/mcp/servers');
    return response.data;
  },

  /**
   * Refresh server list (useful for reconnection attempts)
   */
  async refreshServers(): Promise<MCPServerList> {
    return this.getServers();
  },
};
