import { create } from 'zustand';
import type { Message } from '@/types/chat.types';
import type { SessionListItem } from '@/types/api.types';

interface ChatState {
  // Current session
  currentSessionId: string | null;
  messages: Message[];
  isStreaming: boolean;

  // Active task
  activeTaskId: string | null;
  taskStatus: 'idle' | 'running' | 'cancelled';

  // Sessions list
  sessions: SessionListItem[];
  sessionsLoading: boolean;

  // Sidebar state
  sidebarOpen: boolean;

  // Actions
  setCurrentSession: (sessionId: string | null) => void;
  addMessage: (message: Message) => void;
  updateLastMessage: (content: string) => void;
  setStreaming: (streaming: boolean) => void;
  setActiveTask: (taskId: string | null) => void;
  setTaskStatus: (status: 'idle' | 'running' | 'cancelled') => void;
  clearMessages: () => void;
  setMessages: (messages: Message[]) => void;

  // Session actions
  loadSessions: () => Promise<void>;
  createSession: (title?: string) => Promise<string>;
  deleteSession: (sessionId: string) => Promise<void>;
  setSessions: (sessions: SessionListItem[]) => void;
  addSessionToList: (session: SessionListItem) => void;

  // UI actions
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
}

export const chatStore = create<ChatState>((set) => ({
  // Initial state
  currentSessionId: null,
  messages: [],
  isStreaming: false,
  activeTaskId: null,
  taskStatus: 'idle',
  sessions: [],
  sessionsLoading: false,
  sidebarOpen: true,

  // Set current session
  setCurrentSession: (sessionId) => set({ currentSessionId: sessionId }),

  // Add message
  addMessage: (message) => set((state) => ({
    messages: [...state.messages, message],
  })),

  // Update last message content (for streaming)
  updateLastMessage: (content) => set((state) => {
    const messages = [...state.messages];
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.role === 'assistant') {
      lastMessage.content += content;
    }
    return { messages };
  }),

  // Set streaming state
  setStreaming: (streaming) => set({ isStreaming: streaming }),

  // Set active task
  setActiveTask: (taskId) => set({ activeTaskId: taskId }),

  // Set task status
  setTaskStatus: (status) => set({ taskStatus: status }),

  // Clear messages
  clearMessages: () => set({ messages: [] }),

  // Set messages (load from session)
  setMessages: (messages) => set({ messages }),

  // Load sessions
  loadSessions: async () => {
    set({ sessionsLoading: true });
    try {
      const { sessionsService } = await import('@/services/sessions.service');
      const response = await sessionsService.listSessions(50, 0);
      set({ sessions: response.sessions, sessionsLoading: false });
    } catch (error) {
      console.error('Failed to load sessions:', error);
      set({ sessionsLoading: false });
    }
  },

  // Create session
  createSession: async (title) => {
    try {
      const { sessionsService } = await import('@/services/sessions.service');
      const session = await sessionsService.createSession({ title });
      set((state) => ({
        sessions: [session, ...state.sessions],
        currentSessionId: session.id,
      }));
      return session.id;
    } catch (error) {
      console.error('Failed to create session:', error);
      throw error;
    }
  },

  // Delete session
  deleteSession: async (sessionId) => {
    try {
      const { sessionsService } = await import('@/services/sessions.service');
      await sessionsService.deleteSession(sessionId);
      set((state) => ({
        sessions: state.sessions.filter((s) => s.id !== sessionId),
        currentSessionId: state.currentSessionId === sessionId ? null : state.currentSessionId,
      }));
    } catch (error) {
      console.error('Failed to delete session:', error);
      throw error;
    }
  },

  // Set sessions
  setSessions: (sessions) => set({ sessions }),

  // Add session to list
  addSessionToList: (session) => set((state) => ({
    sessions: [session, ...state.sessions],
  })),

  // Set sidebar open
  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  // Toggle sidebar
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
}));
