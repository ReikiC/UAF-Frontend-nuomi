import { useState, useCallback, useEffect } from 'react';
import './App.css';

// Components - using composition pattern
// See: architecture-compound-components
import { ChatHeader } from './components/ChatHeader';
import { ApiSelector } from './components/ApiSelector';
import { MessageList } from './components/MessageList';
import { MessageInput } from './components/MessageInput';

// API client with proper error handling
import { sendChatMessage, sendChatMessageStream, fetchApiEndpoints } from './lib/api';

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [currentApi, setCurrentApi] = useState(null);
  const [endpoints, setEndpoints] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isStreamingMode, setIsStreamingMode] = useState(false);

  // Load endpoints on mount
  useEffect(() => {
    fetchApiEndpoints().then(data => {
      setEndpoints(data.endpoints);
      if (!currentApi && data.default) {
        setCurrentApi(data.default);
      }
    });
  }, []);

  // Use functional setState for stable callbacks
  // See: rerender-functional-setstate
  const sendMessage = useCallback(async () => {
    if (!input.trim()) return;

    const userMessage = input;
    setInput(''); // Clear input first for better UX
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    // Get endpoint metadata
    const endpointMeta = endpoints?.[currentApi];
    const isStreaming = endpointMeta?.streaming || false;
    const endpointPath = endpointMeta?.path || '';

    // For streaming, add an empty assistant message first
    if (isStreaming) {
      setIsStreamingMode(true);
      setMessages(prev => [...prev, { role: 'assistant', content: '', steps: [] }]);
    }

    try {
      if (isStreaming) {
        // Streaming API
        await sendChatMessageStream(endpointPath, userMessage, {
          onToolCallStart: (toolName, args) => {
            setMessages(prev => {
              const lastMsg = prev[prev.length - 1];
              const newStep = { tool_name: toolName, arguments: args, result: null, status: 'running' };
              return [
                ...prev.slice(0, -1),
                {
                  ...lastMsg,
                  steps: [...(lastMsg.steps || []), newStep]
                }
              ];
            });
          },
          onToolCallEnd: (toolName, result, status) => {
            setMessages(prev => {
              const lastMsg = prev[prev.length - 1];
              const steps = lastMsg.steps || [];
              const stepIndex = steps.findIndex(s => s.tool_name === toolName && s.status === 'running');

              if (stepIndex === -1) return prev;

              return [
                ...prev.slice(0, -1),
                {
                  ...lastMsg,
                  steps: [
                    ...steps.slice(0, stepIndex),
                    { ...steps[stepIndex], result, status },
                    ...steps.slice(stepIndex + 1)
                  ]
                }
              ];
            });
          },
          onContentDelta: (content) => {
            setMessages(prev => {
              const lastMsg = prev[prev.length - 1];
              return [
                ...prev.slice(0, -1),
                {
                  ...lastMsg,
                  content: lastMsg.content + content
                }
              ];
            });
          },
          onDone: () => {
            setLoading(false);
            setIsStreamingMode(false);
          }
        });
      } else {
        // Non-streaming API
        const response = await sendChatMessage(endpointPath, userMessage);
        setMessages(prev => [
          ...prev,
          { role: 'assistant', content: response.content, steps: response.steps }
        ]);
      }
    } catch (error) {
      if (isStreaming) {
        setIsStreamingMode(false);
        setMessages(prev => {
          const lastMsg = prev[prev.length - 1];
          return [
            ...prev.slice(0, -1),
            {
              ...lastMsg,
              content: 'Error: ' + error.message
            }
          ];
        });
      } else {
        setMessages(prev => [
          ...prev,
          { role: 'assistant', content: 'Error: ' + error.message }
        ]);
      }
    } finally {
      if (!isStreaming) {
        setLoading(false);
      }
      if (isStreaming) {
        setLoading(false);
        setIsStreamingMode(false);
      }
    }
  }, [input, currentApi]);

  const handleApiChange = useCallback((api) => {
    setCurrentApi(api);
  }, []);

  const handleInputChange = useCallback((value) => {
    setInput(value);
  }, []);

  return (
    <div className="chat-container">
      <ChatHeader />
      <ApiSelector currentApi={currentApi} onApiChange={handleApiChange} />
      <MessageList messages={messages} loading={loading} isStreaming={isStreamingMode} />
      <MessageInput
        input={input}
        onInputChange={handleInputChange}
        onSend={sendMessage}
        loading={loading}
      />
    </div>
  );
}

export default App;
