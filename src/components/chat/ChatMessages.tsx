import { useEffect, useRef, useCallback, useState } from 'react';
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
          <div className="w-20 h-20 mx-auto mb-4">
            <img
              src="/img/Nuomi.png"
              alt="Nuomi"
              className="w-full h-full object-contain"
            />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Start with Nuomi</h3>
          <p className="text-muted-foreground mb-4">
            我是 Nuomi，可以帮助您完成各种任务。您可以问我任何问题！
          </p>
          <div className="grid grid-cols-1 gap-2 text-sm text-muted-foreground">
            <div className="bg-secondary/50 rounded-lg p-3 text-left">
              💡 告诉我你的想法，我们可以一起探索
            </div>
            <div className="bg-secondary/50 rounded-lg p-3 text-left">
              🚀 我可以使用各种工具来帮助你完成任务
            </div>
            <div className="bg-secondary/50 rounded-lg p-3 text-left">
              📝 随时开始新的对话或继续之前的讨论
            </div>
          </div>
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
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = useCallback(async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, []);

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
            <img
              src="/img/Nuomi.png"
              alt="Nuomi"
              className="w-5 h-5 rounded-full"
            />
          )}
        </div>

        {/* Message content - 为流式消息添加平滑过渡 */}
        <div
          className={cn(
            'rounded-2xl px-4 py-3 relative group',
            isUser ? 'bg-primary text-primary-foreground rounded-br-sm' : 'bg-secondary text-secondary-foreground rounded-bl-sm',
            isStreaming && !isUser && 'transition-all duration-75 ease-out'
          )}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap break-words">{message.content}</p>
          ) : (
            <>
              {/* 复制整个回答按钮 */}
              <button
                onClick={() => copyToClipboard(message.content, `message-${message.id}`)}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-md bg-background/50 hover:bg-background/80 text-foreground/70 hover:text-foreground"
                title="复制回答"
              >
                {copiedId === `message-${message.id}` ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-green-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.016V21a4.5 4.5 0 01-4.5 4.5H6.75a4.5 4.5 0 01-4.5-4.5V6.637c0-1.082.807-1.28 1.907-2.016a48.172 48.172 0 011.927-.184" />
                  </svg>
                )}
              </button>

              {/* Tool calls */}
              {message.tool_calls && message.tool_calls.length > 0 && (
                <div className="space-y-1.5 mb-3">
                  {message.tool_calls.map((toolCall, index) => (
                    <details
                      key={index}
                      className="group/tool"
                    >
                      <summary className="cursor-pointer flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                        {/* Toggle icon */}
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3 group-open/tool:rotate-90 transition-transform">
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
                      const codeString = String(children).replace(/\n$/, '');

                      return !inline && match ? (
                        <div className="group/code relative">
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
                            {codeString}
                          </SyntaxHighlighter>
                          <button
                            onClick={() => copyToClipboard(codeString, `code-${message.id}-${match[1]}`)}
                            className="absolute top-2 right-2 opacity-0 group-hover/code:opacity-100 transition-opacity p-1.5 rounded-md bg-background/50 hover:bg-background/80 text-foreground/70 hover:text-foreground"
                            title={`复制 ${match[1]} 代码`}
                          >
                            {copiedId === `code-${message.id}-${match[1]}` ? (
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-green-600">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            ) : (
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.016V21a4.5 4.5 0 01-4.5 4.5H6.75a4.5 4.5 0 01-4.5-4.5V6.637c0-1.082.807-1.28 1.907-2.016a48.172 48.172 0 011.927-.184" />
                              </svg>
                            )}
                          </button>
                        </div>
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
