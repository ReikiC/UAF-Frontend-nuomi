import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { chatStore } from '@/stores/chat.store';
import { mcpStore } from '@/stores/mcp.store';
import { useChat } from '@/hooks/useChat';
import { ChatMessages } from '@/components/chat/ChatMessages';
import { ChatInput } from '@/components/chat/ChatInput';
import { TaskControls } from '@/components/chat/TaskControls';
import { SessionSidebar } from '@/components/sessions/SessionSidebar';
import { MCPAbilitySelector } from '@/components/mcp/MCPAbilitySelector';
import { Button } from '@/components/ui/button';
import { sessionsService } from '@/services/sessions.service';

export function ChatPage() {
  const { sessionId } = useParams<{ sessionId?: string }>();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false); // 移动端默认隐藏侧边栏
  const [currentSessionTitle, setCurrentSessionTitle] = useState<string>('');
  const [sessionsLoaded, setSessionsLoaded] = useState(false);

  const { sendMessage, cancelTask, continueTask, isStreaming, taskStatus } = useChat();

  // Load sessions on mount
  useEffect(() => {
    chatStore.getState().loadSessions().then(() => {
      setSessionsLoaded(true);
    });
  }, []);

  // Load MCP servers on mount
  useEffect(() => {
    mcpStore.getState().loadServers();
  }, []);

  // Initialize or load session
  useEffect(() => {
    const initializeSession = async () => {
      // If we have a sessionId in URL, load it
      if (sessionId) {
        chatStore.setState({ currentSessionId: sessionId });
        loadSessionMessages(sessionId);
        return;
      }

      // Wait for sessions to be loaded
      if (!sessionsLoaded) {
        return;
      }

      // If no sessionId, check if there are any existing sessions
      const state = chatStore.getState();

      if (state.sessions.length > 0) {
        // User has existing sessions, navigate to the most recent one
        const mostRecentSession = state.sessions[0];
        navigate(`/chat/${mostRecentSession.id}`, { replace: true });
      } else {
        // No sessions exist, create a default one for new users
        try {
          const defaultSession = await sessionsService.createSession({
            title: 'Start with Nuomi',
          });
          chatStore.setState({
            currentSessionId: defaultSession.id,
            sessions: [defaultSession],
          });
          navigate(`/chat/${defaultSession.id}`, { replace: true });
        } catch (error) {
          console.error('Failed to create default session:', error);
        }
      }
    };

    initializeSession();
  }, [sessionId, navigate, sessionsLoaded]);

  const loadSessionMessages = async (id: string) => {
    try {
      const session = await sessionsService.getSession(id);
      console.log('Loading session messages:', session.messages);
      chatStore.setState({
        messages: session.messages.map((msg) => {
          console.log('Processing message:', msg.id, 'tool_calls:', msg.tool_calls);
          const message: any = {
            id: msg.id,
            role: msg.role as 'user' | 'assistant',
            content: msg.content,
            created_at: msg.created_at,
          };

          // Convert tool_calls from dict to array if needed
          if (msg.tool_calls) {
            if (Array.isArray(msg.tool_calls)) {
              message.tool_calls = msg.tool_calls;
            } else {
              // Convert dict to array format
              message.tool_calls = Object.values(msg.tool_calls).map((tc: any) => ({
                tool_name: tc.tool_name,
                arguments: tc.arguments,
                result: tc.result,
                status: tc.status || 'success',
                timestamp: tc.timestamp || new Date().toISOString(),
              }));
            }
            console.log('Converted tool_calls:', message.tool_calls);
          }

          return message;
        }),
      });
      setCurrentSessionTitle(session.title || '');
    } catch (error) {
      console.error('Failed to load session:', error);
    }
  };

  const handleSendMessage = async (message: string) => {
    const currentSessionId = chatStore.getState().currentSessionId;

    // If no session exists, create one first
    if (!currentSessionId) {
      try {
        const newSession = await sessionsService.createSession({
          title: message.slice(0, 50) + (message.length > 50 ? '...' : ''),
        });
        chatStore.setState({ currentSessionId: newSession.id });
        navigate(`/chat/${newSession.id}`, { replace: true });
        await sendMessage(message, newSession.id);
      } catch (error) {
        console.error('Failed to create session:', error);
      }
    } else {
      await sendMessage(message, currentSessionId);
    }
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <SessionSidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-14 border-b flex items-center justify-between px-4 bg-card">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </Button>
            <h1 className="font-semibold text-lg">
              {currentSessionTitle || 'Universal Agent'}
            </h1>
          </div>
        </header>

        {/* Messages area */}
        <ChatMessages
          messages={chatStore((state) => state.messages)}
          isStreaming={isStreaming}
        />

        {/* Task controls */}
        <div className="px-4 pt-2">
          <TaskControls
            isStreaming={isStreaming}
            taskStatus={taskStatus}
            onCancel={cancelTask}
            onContinue={continueTask}
          />
        </div>

        {/* MCP Ability Selector */}
        <MCPAbilitySelector disabled={isStreaming} />

        {/* Input area */}
        <ChatInput
          onSend={handleSendMessage}
          disabled={isStreaming}
          placeholder="输入消息... (Enter 发送, Shift+Enter 换行)"
        />
      </div>
    </div>
  );
}
