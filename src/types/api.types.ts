// API Types matching backend schemas

// Authentication
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name?: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface UserResponse {
  user_id: string;
  email: string;
  name?: string;
  is_verified: boolean;
  created_at: string;
}

// Session
export interface MessageSummary {
  id: string;
  role: string;
  content: string;
  created_at: string;
}

export interface SessionListItem {
  id: string;
  title?: string;
  model?: string;
  message_count: number;
  created_at: string;
  updated_at: string;
  last_message?: MessageSummary;
}

export interface MessageInDB {
  id: string;
  session_id: string;
  role: string;
  content: string;
  tool_calls?: Record<string, unknown>;
  created_at: string;
  token_count?: number;
  metadata?: Record<string, unknown>;
}

export interface SessionDetail {
  id: string;
  title?: string;
  thread_id: string;
  model?: string;
  message_count: number;
  created_at: string;
  updated_at: string;
  messages: MessageInDB[];
}

export interface SessionListResponse {
  sessions: SessionListItem[];
  total: number;
}

export interface SessionCreate {
  title?: string;
  model?: string;
}

export interface SessionUpdate {
  title?: string;
  model?: string;
}

// Task
export interface TaskInfo {
  task_id: string;
  session_id: string;
  status: 'running' | 'completed' | 'cancelled' | 'error';
  created_at: string;
  cancelled_at?: string;
  error?: string;
}

export interface TaskContinueRequest {
  instruction: string;
  save_history: boolean;
}

// Chat
export interface ChatRequest {
  message: string;
  session_id?: string;
  stream?: boolean;
  enabled_mcps?: string[] | null;
}

// SSE Events
export type SSEEventType =
  | 'task_created'
  | 'content_delta'
  | 'tool_call_start'
  | 'tool_call_end'
  | 'done'
  | 'cancelled';

export interface SSEEvent<T = unknown> {
  event: SSEEventType;
  data: T;
}

export interface TaskCreatedData {
  task_id: string;
  session_id: string;
  continuing_from?: string;
}

export interface ContentDeltaData {
  content: string;
}

export interface ToolCallStartData {
  tool_name: string;
  arguments: Record<string, unknown>;
}

export interface ToolCallEndData {
  tool_name: string;
  result: string;
  status: string;
}

// MCP
export interface ToolInfo {
  name: string;
  description: string;
  input_schema?: Record<string, unknown>;
}

export interface MCPServerInfo {
  name: string;
  display_name?: string;
  transport?: string;
  command?: string;
  url?: string;
  connected: boolean;
  tools: ToolInfo[];
}

export interface MCPServerList {
  servers: MCPServerInfo[];
  total: number;
}
