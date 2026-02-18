import { useCallback, useState } from 'react';
import { chatStore } from '@/stores/chat.store';
import { tasksService } from '@/services/tasks.service';
import { useSSE } from './useSSE';
import type { Message } from '@/types/chat.types';
import type {
  TaskCreatedData,
  ContentDeltaData,
  ToolCallStartData,
  ToolCallEndData,
} from '@/types/api.types';

export function useChat() {
  const [error, setError] = useState<string | null>(null);
  const { connect, disconnect } = useSSE();

  const sendMessage = useCallback(
    async (message: string, sessionId: string | null = null) => {
      if (!message.trim()) return;

      setError(null);
      const state = chatStore.getState();

      // Add user message
      const userMessage: Message = {
        role: 'user',
        content: message,
        created_at: new Date().toISOString(),
      };
      chatStore.setState((prev) => ({
        messages: [...prev.messages, userMessage],
      }));

      // Create temp assistant message for streaming
      const tempMessage: Message = {
        id: `temp-${Date.now()}`,
        role: 'assistant',
        content: '',
        created_at: new Date().toISOString(),
        isStreaming: true,
      };
      chatStore.setState((prev) => ({
        messages: [...prev.messages, tempMessage],
        isStreaming: true,
        taskStatus: 'running',
      }));

      try {
        // Prepare request
        const requestBody = {
          message,
          session_id: sessionId || state.currentSessionId || undefined,
        };

        // Get token
        const token = localStorage.getItem('access_token');
        if (!token) {
          throw new Error('No access token found');
        }

        // Build URL
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
        const url = `${baseUrl}/api/v1/chat/single/toolcalls/stream/v2`;

        // Send the message
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Handle SSE stream
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        if (!reader) {
          throw new Error('Response body is null');
        }

        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            chatStore.setState({
              isStreaming: false,
              taskStatus: 'idle',
              activeTaskId: null,
            });
            // Reload sessions to update last message
            chatStore.getState().loadSessions();
            break;
          }

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          let currentEvent = '';

          for (const line of lines) {
            if (line.startsWith('event: ')) {
              // Extract event type
              currentEvent = line.slice(7).trim();
            } else if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                // Add event type to data object
                const eventData = { event: currentEvent, ...data };
                handleSSEEvent(eventData);
              } catch (e) {
                console.error('Failed to parse SSE data:', e, line);
              }
            }
            // Reset event after processing data
            if (line.trim() === '') {
              currentEvent = '';
            }
          }
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
        setError(errorMessage);
        chatStore.setState({
          isStreaming: false,
          taskStatus: 'idle',
        });
      }
    },
    [connect]
  );

  const handleSSEEvent = (event: any) => {
    console.log('Received SSE event:', event);

    switch (event.event) {
      case 'task_created': {
        const data = event as TaskCreatedData;
        console.log('Task created:', data);
        chatStore.setState({
          activeTaskId: data.task_id,
          currentSessionId: data.session_id,
        });
        break;
      }

      case 'content_delta': {
        const data = event as ContentDeltaData;
        console.log('Content delta:', data.content);
        chatStore.setState((prev) => {
          const messages = [...prev.messages];
          const lastMessage = messages[messages.length - 1];
          if (lastMessage && lastMessage.role === 'assistant') {
            // Create a new object to trigger reactivity, preserving the id
            messages[messages.length - 1] = {
              ...lastMessage,
              content: lastMessage.content + data.content,
            };
            console.log('Updated message content:', messages[messages.length - 1].content);
          }
          return { messages };
        });
        break;
      }

      case 'tool_call_start': {
        const data = event as ToolCallStartData;
        console.log('Tool call started:', data.tool_name, data.arguments);
        break;
      }

      case 'tool_call_end': {
        const data = event as ToolCallEndData;
        console.log('Tool call ended:', data.tool_name, data.status);
        break;
      }

      case 'done': {
        console.log('Stream done');
        chatStore.setState({
          isStreaming: false,
          taskStatus: 'idle',
          activeTaskId: null,
        });
        break;
      }

      case 'cancelled': {
        console.log('Stream cancelled');
        chatStore.setState({
          isStreaming: false,
          taskStatus: 'cancelled',
        });
        break;
      }

      default: {
        console.log('Unknown event:', event);
      }
    }
  };

  const cancelTask = useCallback(async () => {
    const state = chatStore.getState();
    if (!state.activeTaskId) return;

    try {
      await tasksService.cancelTask(state.activeTaskId);
      chatStore.setState({
        taskStatus: 'cancelled',
        isStreaming: false,
      });
      disconnect();
    } catch (err) {
      console.error('Failed to cancel task:', err);
      setError('Failed to cancel task');
    }
  }, [disconnect]);

  const continueTask = useCallback(
    async (instruction: string = '请继续') => {
      const state = chatStore.getState();
      if (!state.activeTaskId) return;

      try {
        chatStore.setState({
          isStreaming: true,
          taskStatus: 'running',
        });

        await tasksService.continueTask(state.activeTaskId, {
          instruction,
          save_history: true,
        });
      } catch (err) {
        console.error('Failed to continue task:', err);
        setError('Failed to continue task');
        chatStore.setState({ isStreaming: false });
      }
    },
    []
  );

  return {
    sendMessage,
    cancelTask,
    continueTask,
    error,
    isStreaming: chatStore((state) => state.isStreaming),
    activeTaskId: chatStore((state) => state.activeTaskId),
    taskStatus: chatStore((state) => state.taskStatus),
  };
}
