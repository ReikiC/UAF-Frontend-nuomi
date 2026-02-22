import { useEffect, useRef, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Message } from '@/types/chat.types';
import { cn } from '@/utils';

interface ChatMessagesProps {
  messages: Message[];
  isStreaming?: boolean;
}

export function ChatMessages({ messages, isStreaming = false }: ChatMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isUserScrolledRef = useRef(false);
  const prevIsStreamingRef = useRef(false);
  const lastMessageLengthRef = useRef(0);
  const prevMessageCountRef = useRef(0);

  // 检测用户是否手动滚动
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;

      // 只在用户手动向上滚动时标记（从不触底变为不触底）
      if (!isAtBottom && isUserScrolledRef.current === false) {
        isUserScrolledRef.current = true;
      }
      // 如果用户手动滚回底部，恢复自动跟随
      if (isAtBottom && isUserScrolledRef.current === true) {
        isUserScrolledRef.current = false;
      }
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  // 滚动到底部函数
  const scrollToBottom = useCallback((smooth: boolean = false) => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: smooth ? 'smooth' : 'auto'
      });
    }
  }, []);

  // 初始化时滚动到底部
  useEffect(() => {
    scrollToBottom(false);
  }, []);

  // 智能滚动逻辑
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    const currentLength = lastMessage?.content?.length || 0;
    const messageCount = messages.length;

    // 检测流式状态变化：从 true 变为 false（对话结束）
    const streamingJustEnded = prevIsStreamingRef.current && !isStreaming;
    prevIsStreamingRef.current = isStreaming;

    // 检测是否有新消息（消息数量增加，说明用户发送了新消息）
    const hasNewMessage = messageCount > prevMessageCountRef.current;
    prevMessageCountRef.current = messageCount;

    if (hasNewMessage || streamingJustEnded) {
      // 用户发送消息或对话结束时，无论用户在哪里，都平滑滚动到底部
      scrollToBottom(true);
      isUserScrolledRef.current = false;
      lastMessageLengthRef.current = 0;
    } else if (isStreaming) {
      // 流式传输中：只在用户未滚动时跟随
      if (currentLength > lastMessageLengthRef.current && !isUserScrolledRef.current) {
        scrollToBottom(false);
      }
      lastMessageLengthRef.current = currentLength;
    } else if (currentLength > lastMessageLengthRef.current) {
      // 非流式但有内容增长（如加载历史消息时）
      scrollToBottom(true);
      lastMessageLengthRef.current = currentLength;
    }
  }, [messages, isStreaming, scrollToBottom]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-primary">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">开始新对话</h3>
          <p className="text-muted-foreground">
            我是 Universal Agent，可以帮助您完成各种任务。您可以问我任何问题！
          </p>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="flex-1 overflow-y-auto p-4 space-y-6">
      {messages.map((message, index) => (
        <MessageBubble
          key={message.id || index}
          message={message}
          isStreaming={isStreaming && index === messages.length - 1}
        />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}

function MessageBubble({ message, isStreaming }: { message: Message; isStreaming: boolean }) {
  const isUser = message.role === 'user';

  return (
    <div className={cn('flex w-full', isUser ? 'justify-end' : 'justify-start')}>
      <div className={cn('flex gap-3 max-w-[85%]', isUser && 'flex-row-reverse')}>
        {/* Avatar */}
        <div className={cn('w-8 h-8 rounded-full flex items-center justify-center shrink-0', isUser ? 'bg-primary' : 'bg-secondary')}>
          {isUser ? (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-primary-foreground">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-secondary-foreground">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
            </svg>
          )}
        </div>

        {/* Message content - 为流式消息添加平滑过渡 */}
        <div
          className={cn(
            'rounded-2xl px-4 py-3',
            isUser ? 'bg-primary text-primary-foreground rounded-br-sm' : 'bg-secondary text-secondary-foreground rounded-bl-sm',
            isStreaming && !isUser && 'transition-all duration-75 ease-out'
          )}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap break-words">{message.content}</p>
          ) : (
            <>
              {/* Tool calls */}
              {message.tool_calls && message.tool_calls.length > 0 && (
                <div className="space-y-1.5 mb-3">
                  {message.tool_calls.map((toolCall, index) => (
                    <details
                      key={index}
                      className="group"
                    >
                      <summary className="cursor-pointer flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                        {/* Toggle icon */}
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3 group-open:rotate-90 transition-transform">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                        </svg>

                        {/* Status icon */}
                        {toolCall.status === 'running' && (
                          <div className="w-3 h-3 border-2 border-primary/60 border-t-transparent rounded-full animate-spin" />
                        )}
                        {toolCall.status === 'success' && (
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3 h-3 text-green-600 dark:text-green-400">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        )}
                        {toolCall.status === 'error' && (
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3 h-3 text-red-600 dark:text-red-400">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                          </svg>
                        )}

                        {/* Tool name and status */}
                        <span className="font-medium">{toolCall.tool_name}</span>
                        <span className={cn(
                          "text-xs",
                          toolCall.status === 'running' && "text-primary",
                          toolCall.status === 'success' && "text-green-600 dark:text-green-400",
                          toolCall.status === 'error' && "text-red-600 dark:text-red-400"
                        )}>
                          · {toolCall.status === 'running' && '调用中'}
                          {toolCall.status === 'success' && '已完成'}
                          {toolCall.status === 'error' && '失败'}
                        </span>
                      </summary>

                      {/* Collapsible content */}
                      <div className="ml-5 mt-1.5 space-y-1.5 text-xs">
                        {/* Arguments */}
                        {toolCall.arguments && Object.keys(toolCall.arguments).length > 0 && (
                          <div>
                            <div className="text-muted-foreground mb-1">参数</div>
                            <pre className="bg-background/50 rounded p-2 overflow-x-auto border border-border/50">
                              {JSON.stringify(toolCall.arguments, null, 2)}
                            </pre>
                          </div>
                        )}

                        {/* Result */}
                        {toolCall.result && toolCall.status !== 'running' && (
                          <div>
                            <div className="text-muted-foreground mb-1">结果</div>
                            <pre className="bg-background/50 rounded p-2 overflow-x-auto border border-border/50 whitespace-pre-wrap">
                              {toolCall.result}
                            </pre>
                          </div>
                        )}
                      </div>
                    </details>
                  ))}
                </div>
              )}
              {/* Message content */}
              <div className="markdown-content prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  skipHtml={false}
                  components={{
                    code({ node, inline, className, children, ...props }: any) {
                      const match = /language-(\w+)/.exec(className || '');
                      const isDark = document.documentElement.classList.contains('dark');
                      return !inline && match ? (
                        <SyntaxHighlighter
                          style={isDark ? oneDark : oneLight}
                          language={match[1]}
                          PreTag="div"
                          className="rounded-lg text-sm"
                          customStyle={{
                            margin: '1rem 0',
                            background: isDark ? '#2d2d2d' : '#f8f9fa',
                          }}
                        >
                          {String(children).replace(/\n$/, '')}
                        </SyntaxHighlighter>
                      ) : (
                        <code className={className} {...props}>
                          {children}
                        </code>
                      );
                    },
                    table({ children, node }: any) {
                      return (
                        <div className="my-4 overflow-x-auto">
                          <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                            {children}
                          </table>
                        </div>
                      );
                    },
                    thead({ children, node }: any) {
                      return (
                        <thead style={{ background: '#f1f3f4' }}>
                          {children}
                        </thead>
                      );
                    },
                    th({ children, node }: any) {
                      return (
                        <th style={{
                          border: '1px solid #dadce0',
                          padding: '8px 12px',
                          textAlign: 'left',
                          fontWeight: 500
                        }}>
                          {children}
                        </th>
                      );
                    },
                    td({ children, node }: any) {
                      return (
                        <td style={{
                          border: '1px solid #dadce0',
                          padding: '8px 12px',
                          textAlign: 'left'
                        }}>
                          {children}
                        </td>
                      );
                    },
                  }}
                >
                  {message.content}
                </ReactMarkdown>
                {isStreaming && (
                  <span className="inline-block w-2 h-4 ml-1 bg-current animate-pulse align-middle" />
                )}
              </div>
            </>
          )}
          <p className={cn('text-xs mt-1 opacity-70', isUser ? 'text-primary-foreground' : 'text-secondary-foreground')}>
            {formatTime(message.created_at)}
          </p>
        </div>
      </div>
    </div>
  );
}

// Helper function to format time
function formatTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  if (diff < 60000) return '刚刚';
  if (diff < 3600000) return `${Math.floor(diff / 60000)} 分钟前`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} 小时前`;

  return date.toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
