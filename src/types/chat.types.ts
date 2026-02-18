// Chat related types

export interface Message {
  id?: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
  tool_calls?: ToolCallInfo[];
  isStreaming?: boolean;
}

export interface ToolCallInfo {
  tool_name: string;
  arguments: Record<string, unknown>;
  result?: string;
  status: 'running' | 'success' | 'error';
  timestamp: string;
}

export type ChatEndpoint =
  | 'basic'
  | 'basic/stream'
  | 'basic/stream/v2'
  | 'single/basic'
  | 'single/toolcalls'
  | 'single/toolcalls/stream'
  | 'single/toolcalls/stream/v2';
