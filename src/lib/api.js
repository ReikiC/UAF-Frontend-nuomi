import axios from 'axios';

// API client with proper error handling
// See: client-swr-dedup (consider using SWR for production)
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 120000, // 120 second timeout (2 minutes) for first-time MCP tool loading
});

/**
 * Send a chat message to the specified API endpoint
 * @param {string} endpoint - The API endpoint path
 * @param {string} message - The user message
 * @returns {Promise<{content: string, steps?: Array}>} The assistant's response with optional steps
 */
export const sendChatMessage = async (endpoint, message) => {
  try {
    const { data } = await apiClient.post(endpoint, message);

    // Handle new structured response format (from /api/v1/chat)
    if (data.final_message !== undefined) {
      return {
        content: data.final_message,
        steps: data.steps || []
      };
    }

    // Handle legacy response format (from /api/v1/chat/basic)
    const content = data.message || data.content || data;
    return { content, steps: [] };
  } catch (error) {
    // Provide more detailed error information
    if (error.response) {
      // Server responded with error status
      const message = error.response.data?.detail ||
                     error.response.data?.message ||
                     `Server error: ${error.response.status}`;
      throw new Error(message);
    } else if (error.request) {
      // Request made but no response received
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        throw new Error('Request timeout - The server took too long to respond. This may happen on first request while loading MCP tools. Please try again.');
      }
      throw new Error('Network error: Unable to reach the server');
    } else {
      // Error setting up request
      throw new Error(error.message);
    }
  }
};

/**
 * Send a chat message with streaming response
 * @param {string} endpoint - The API endpoint path
 * @param {string} message - The user message
 * @param {Object} callbacks - Event callbacks
 * @param {Function} callbacks.onToolCallStart - Called when a tool call starts
 * @param {Function} callbacks.onToolCallEnd - Called when a tool call ends
 * @param {Function} callbacks.onContentDelta - Called when content chunks arrive
 * @param {Function} callbacks.onDone - Called when streaming completes
 * @returns {Promise<void>}
 */
export const sendChatMessageStream = async (endpoint, message, callbacks) => {
  const url = `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let currentEventType = null;

    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || ''; // Keep incomplete line in buffer

      for (const line of lines) {
        const trimmedLine = line.trim();

        // Skip empty lines and SSE comment lines (starting with ':')
        if (!trimmedLine || trimmedLine.startsWith(':')) continue;

        // Parse SSE format: "event: xxx\ndata: xxx\n"
        const eventMatch = trimmedLine.match(/^event:\s*(.+)$/);
        const dataMatch = trimmedLine.match(/^data:\s*(.+)$/);

        if (eventMatch) {
          // Store event type for next data line
          currentEventType = eventMatch[1].trim();
          continue;
        }

        if (dataMatch) {
          try {
            const data = JSON.parse(dataMatch[1]);

            // Use stored event type or infer from data structure
            let eventType = currentEventType;

            if (!eventType) {
              // Try to determine event type from data structure
              if (data.tool_name && data.arguments && !data.result) {
                eventType = 'tool_call_start';
              } else if (data.tool_name && data.result) {
                eventType = 'tool_call_end';
              } else if (data.content) {
                eventType = 'content_delta';
              } else if (data.status === 'complete') {
                eventType = 'done';
              }
            }

            switch (eventType) {
              case 'tool_call_start':
                console.log('[SSE] tool_call_start:', data);
                callbacks.onToolCallStart?.(data.tool_name, data.arguments);
                break;
              case 'tool_call_end':
                console.log('[SSE] tool_call_end:', data);
                callbacks.onToolCallEnd?.(data.tool_name, data.result, data.status);
                break;
              case 'content_delta':
                console.log('[SSE] content_delta:', data);
                callbacks.onContentDelta?.(data.content);
                break;
              case 'done':
                console.log('[SSE] done:', data);
                callbacks.onDone?.();
                break;
              default:
                console.log('[SSE] Unknown event type:', eventType, data);
            }

            // Reset event type after processing
            currentEventType = null;
          } catch (e) {
            console.error('Failed to parse SSE data:', dataMatch[1], e);
          }
        }
      }
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Request timeout - The server took too long to respond');
    }
    throw new Error(error.message || 'Network error: Unable to reach the server');
  }
};

export default apiClient;

/**
 * Fetch available API endpoints from backend
 * @returns {Promise<{endpoints: Object, default: string}>}
 */
export const fetchApiEndpoints = async () => {
  try {
    const { data } = await apiClient.get('/api/v1/chat/endpoints');
    return data;
  } catch (error) {
    console.error('Failed to fetch endpoints:', error);
    // Return fallback endpoints if API call fails
    return {
      endpoints: {
        fallback: {
          path: '/api/v1/chat',
          label: '默认聊天',
          description: '默认端点',
          streaming: false
        }
      },
      default: 'fallback'
    };
  }
};
