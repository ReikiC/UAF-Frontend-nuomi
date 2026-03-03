import { create } from 'zustand';
import type { MCPServerInfo } from '@/types/api.types';

interface MCPState {
  // Available servers from backend
  availableServers: MCPServerInfo[];
  serversLoading: boolean;
  serversError: string | null;

  // User's currently selected servers (by name)
  selectedServers: string[];

  // Actions
  loadServers: () => Promise<void>;
  setSelectedServers: (servers: string[]) => void;
  toggleServer: (serverName: string) => void;
  clearSelection: () => void;

  // Getters
  getSelectedServersInfo: () => MCPServerInfo[];
  getServerByName: (name: string) => MCPServerInfo | undefined;
}

export const mcpStore = create<MCPState>((set, get) => ({
  // Initial state
  availableServers: [],
  serversLoading: false,
  serversError: null,
  selectedServers: [], // Default: no servers selected (minimal token mode)

  // Load servers from backend
  loadServers: async () => {
    set({ serversLoading: true, serversError: null });
    try {
      const { mcpService } = await import('@/services/mcp.service');
      const response = await mcpService.getServers();

      // Debug logging
      console.log('[MCP Store] Loaded servers:', response.servers.map(s => ({
        name: s.name,
        display_name: s.display_name,
        has_display_name: !!s.display_name,
      })));

      set({
        availableServers: response.servers,
        serversLoading: false,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load MCP servers';
      set({
        serversError: errorMessage,
        serversLoading: false,
      });
      console.error('Failed to load MCP servers:', error);
    }
  },

  // Set selected servers
  setSelectedServers: (servers) => set({ selectedServers: servers }),

  // Toggle a single server
  toggleServer: (serverName) =>
    set((state) => {
      const isSelected = state.selectedServers.includes(serverName);
      const newSelection = isSelected
        ? state.selectedServers.filter((s) => s !== serverName)
        : [...state.selectedServers, serverName];
      return { selectedServers: newSelection };
    }),

  // Clear all selections
  clearSelection: () => set({ selectedServers: [] }),

  // Get selected server info objects
  getSelectedServersInfo: () => {
    const state = get();
    return state.availableServers.filter((server) =>
      state.selectedServers.includes(server.name)
    );
  },

  // Find server by name
  getServerByName: (name) => {
    const state = get();
    return state.availableServers.find((s) => s.name === name);
  },
}));
