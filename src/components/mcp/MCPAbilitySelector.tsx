import { useEffect, type FC } from 'react';
import { mcpStore } from '@/stores/mcp.store';
import { MCPToolTag } from './MCPToolTag';

interface MCPAbilitySelectorProps {
  disabled?: boolean;
}

export const MCPAbilitySelector: FC<MCPAbilitySelectorProps> = ({
  disabled = false,
}) => {
  const availableServers = mcpStore((state) => state.availableServers);
  const selectedServers = mcpStore((state) => state.selectedServers);
  const serversLoading = mcpStore((state) => state.serversLoading);
  const serversError = mcpStore((state) => state.serversError);
  const toggleServer = mcpStore((state) => state.toggleServer);
  const clearSelection = mcpStore((state) => state.clearSelection);
  const loadServers = mcpStore((state) => state.loadServers);

  // Load servers on mount
  useEffect(() => {
    if (availableServers.length === 0 && !serversLoading && !serversError) {
      loadServers();
    }
  }, []);

  // Handle server toggle
  const handleToggle = (serverName: string) => {
    toggleServer(serverName);
  };

  // Handle clear all
  const handleClearAll = () => {
    clearSelection();
  };

  // Loading state
  if (serversLoading) {
    return (
      <div className="border-b bg-background px-4 py-3">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 overflow-x-auto">
            <div className="text-sm text-muted-foreground">加载工具能力...</div>
            <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (serversError) {
    return (
      <div className="border-b bg-background px-4 py-3">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="text-sm text-red-600">{serversError}</div>
            <button
              type="button"
              onClick={() => loadServers()}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              重试
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (availableServers.length === 0) {
    return (
      <div className="border-b bg-background px-4 py-3">
        <div className="max-w-4xl mx-auto">
          <div className="text-sm text-muted-foreground">
            没有可用的工具能力
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border-b bg-background px-4 py-3">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3">
          {/* Label */}
          <div className="text-sm font-medium text-gray-700 whitespace-nowrap">
            工具能力：
          </div>

          {/* Server tags */}
          <div className="flex items-center gap-2 overflow-x-auto flex-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
            {availableServers.map((server) => (
              <MCPToolTag
                key={server.name}
                server={server}
                selected={selectedServers.includes(server.name)}
                onClick={() => handleToggle(server.name)}
                disabled={disabled}
              />
            ))}
          </div>

          {/* Clear button - only show if there are selected servers */}
          {selectedServers.length > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              disabled={disabled}
              className="text-sm text-gray-600 hover:text-gray-800 whitespace-nowrap px-2 py-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              清空
            </button>
          )}

          {/* Selection indicator */}
          <div className="text-sm text-muted-foreground whitespace-nowrap">
            {selectedServers.length > 0
              ? `已选 ${selectedServers.length} 个`
              : '未选择'}
          </div>
        </div>
      </div>
    </div>
  );
};
