import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { chatStore } from '@/stores/chat.store';
import { Button } from '@/components/ui/button';
import { cn } from '@/utils/cn';
import type { SessionListItem } from '@/types/api.types';

export function SessionSidebar() {
  const [sessions, setSessions] = useState<SessionListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(true);
  const navigate = useNavigate();

  const loadSessions = async () => {
    setLoading(true);
    try {
      const { sessionsService } = await import('@/services/sessions.service');
      const response = await sessionsService.listSessions(50, 0);
      setSessions(response.sessions);
    } catch (error) {
      console.error('Failed to load sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  const handleCreateSession = async () => {
    try {
      const { sessionsService } = await import('@/services/sessions.service');
      const session = await sessionsService.createSession({ title: '新对话' });
      setSessions((prev) => [session, ...prev]);
      navigate(`/chat/${session.id}`);
    } catch (error) {
      console.error('Failed to create session:', error);
    }
  };

  const handleDeleteSession = async (sessionId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const { sessionsService } = await import('@/services/sessions.service');
      await sessionsService.deleteSession(sessionId);
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    } catch (error) {
      console.error('Failed to delete session:', error);
    }
  };

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed lg:static inset-y-0 left-0 z-50 w-72 bg-card border-r transform transition-transform duration-300 ease-in-out',
          'flex flex-col',
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Header */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">对话列表</h2>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setOpen(false)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Button>
          </div>
          <Button onClick={handleCreateSession} className="w-full" size="sm">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 mr-2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            新建对话
          </Button>
        </div>

        {/* Session list */}
        <div className="flex-1 overflow-y-auto p-2">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              暂无对话
            </div>
          ) : (
            <ul className="space-y-1">
              {sessions.map((session) => (
                <SessionItem
                  key={session.id}
                  session={session}
                  onDelete={handleDeleteSession}
                />
              ))}
            </ul>
          )}
        </div>
      </aside>
    </>
  );
}

function SessionItem({
  session,
  onDelete,
}: {
  session: SessionListItem;
  onDelete: (id: string, e: React.MouseEvent) => void;
}) {
  return (
    <li>
      <Link
        to={`/chat/${session.id}`}
        className="block group"
        onClick={() => {
          chatStore.setState({ currentSessionId: session.id });
        }}
      >
        <div className="relative p-3 rounded-lg hover:bg-accent transition-colors">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-sm truncate">
                {session.title || '新对话'}
              </h3>
              {session.last_message && (
                <p className="text-xs text-muted-foreground truncate mt-1">
                  {session.last_message.content}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                {new Date(session.updated_at).toLocaleDateString('zh-CN', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>

            <button
              onClick={(e) => onDelete(session.id, e)}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-destructive hover:text-destructive-foreground rounded"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
            </button>
          </div>
        </div>
      </Link>
    </li>
  );
}
