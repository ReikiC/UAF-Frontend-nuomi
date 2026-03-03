import { type FC } from 'react';
import type { MCPServerInfo } from '@/types/api.types';

interface MCPToolTagProps {
  server: MCPServerInfo;
  selected: boolean;
  onClick: () => void;
  disabled?: boolean;
}

export const MCPToolTag: FC<MCPToolTagProps> = ({
  server,
  selected,
  onClick,
  disabled = false,
}) => {
  // Use display_name from backend config, fallback to server name
  const displayName = server.display_name || server.name;

  // Debug logging (can be removed in production)
  if (import.meta.env.DEV) {
    console.log(`[MCPToolTag] Server: ${server.name}, Display: ${displayName}, Has displayName: ${!!server.display_name}`);
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`
        inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium
        transition-all duration-200 ease-in-out
        border
        ${disabled
          ? 'opacity-50 cursor-not-allowed bg-gray-100 text-gray-400 border-gray-200'
          : selected
            ? 'bg-blue-50 text-blue-700 border-blue-300 hover:bg-blue-100 cursor-pointer'
            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400 cursor-pointer'
        }
      `}
      title={`工具数量: ${server.tools.length}`}
    >
      {/* Connection status indicator */}
      <div
        className={`w-2 h-2 rounded-full ${
          server.connected ? 'bg-green-500' : 'bg-red-500'
        }`}
        aria-label={`Connection status: ${server.connected ? 'connected' : 'disconnected'}`}
      />

      {/* Server name */}
      <span>{displayName}</span>

      {/* Tool count badge - only show if there are tools */}
      {server.tools.length > 0 && (
        <span
          className={`
            px-1.5 py-0.5 rounded text-xs font-semibold
            ${selected
              ? 'bg-blue-200 text-blue-800'
              : 'bg-gray-200 text-gray-600'
            }
          `}
        >
          {server.tools.length}
        </span>
      )}
    </button>
  );
};
