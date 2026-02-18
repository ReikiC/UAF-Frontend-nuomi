import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { chatStore } from '@/stores/chat.store';
import { authStore } from '@/stores/auth.store';
import { useChat } from '@/hooks/useChat';
import { ChatMessages } from '@/components/chat/ChatMessages';
import { ChatInput } from '@/components/chat/ChatInput';
import { TaskControls } from '@/components/chat/TaskControls';
import { SessionSidebar } from '@/components/sessions/SessionSidebar';
import { Button } from '@/components/ui/button';
import { sessionsService } from '@/services/sessions.service';

export function ChatPage() {
  const { sessionId } = useParams<{ sessionId?: string }>();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentSessionTitle, setCurrentSessionTitle] = useState<string>('');

  const { sendMessage, cancelTask, continueTask, isStreaming, taskStatus } = useChat();

  // Load session data when sessionId changes
  useEffect(() => {
    if (sessionId) {
      chatStore.setState({ currentSessionId: sessionId });
      loadSessionMessages(sessionId);
    }
  }, [sessionId]);

  const loadSessionMessages = async (id: string) => {
    try {
      const session = await sessionsService.getSession(id);
      chatStore.setState({
        messages: session.messages.map((msg) => ({
          id: msg.id,
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
          created_at: msg.created_at,
        })),
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

  const handleNewChat = async () => {
    chatStore.setState({ currentSessionId: null, messages: [] });
    setCurrentSessionTitle('');
    navigate('/');
  };

  const handleLogout = () => {
    authStore.getState().logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <SessionSidebar />

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

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleNewChat}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 mr-2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              新对话
            </Button>
            <Button variant="ghost" size="icon" onClick={handleLogout} title="登出">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3-3m-3 3h12.75" />
              </svg>
            </Button>
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
