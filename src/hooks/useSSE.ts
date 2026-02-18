import { useCallback, useRef } from 'react';
import type { SSEEvent } from '@/types/api.types';

export interface UseSSEOptions {
  onMessage: (event: SSEEvent) => void;
  onError?: (error: Error) => void;
  onComplete?: () => void;
}

export function useSSE() {
  const activeController = useRef<AbortController | null>(null);

  const connect = useCallback(
    async (url: string, options: UseSSEOptions): Promise<AbortController> => {
      // Abort any existing connection
      if (activeController.current) {
        activeController.current.abort();
      }

      const controller = new AbortController();
      activeController.current = controller;

      try {
        const response = await fetch(url, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        if (!reader) {
          throw new Error('Response body is null');
        }

        const readStream = async () => {
          try {
            while (true) {
              const { done, value } = await reader.read();

              if (done) {
                options.onComplete?.();
                break;
              }

              buffer += decoder.decode(value, { stream: true });
              const lines = buffer.split('\n');
              buffer = lines.pop() || '';

              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  try {
                    const data = JSON.parse(line.slice(6));
                    options.onMessage({
                      event: data.event || 'message',
                      data: data.data || data,
                    });
                  } catch (e) {
                    console.error('Failed to parse SSE data:', e);
                  }
                }
              }
            }
          } catch (error) {
            if ((error as Error).name === 'AbortError') {
              options.onComplete?.();
            } else {
              options.onError?.(error as Error);
            }
          }
        };

        readStream();

        return controller;
      } catch (error) {
        options.onError?.(error as Error);
        throw error;
      }
    },
    []
  );

  const disconnect = useCallback(() => {
    if (activeController.current) {
      activeController.current.abort();
      activeController.current = null;
    }
  }, []);

  return { connect, disconnect, isActive: () => activeController.current !== null };
}
