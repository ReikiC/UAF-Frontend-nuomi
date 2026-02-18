export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const CHAT_ENDPOINTS = {
  BASIC: '/api/v1/chat/basic',
  BASIC_STREAM: '/api/v1/chat/basic/stream',
  AGENT: '/api/v1/chat/single/basic',
  AGENT_TOOLS: '/api/v1/chat/single/toolcalls',
  AGENT_STREAM: '/api/v1/chat/single/toolcalls/stream',
  AGENT_STREAM_V2: '/api/v1/chat/single/toolcalls/stream/v2',
} as const;

export const DEFAULT_CHAT_ENDPOINT = CHAT_ENDPOINTS.AGENT_STREAM_V2;

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
} as const;
