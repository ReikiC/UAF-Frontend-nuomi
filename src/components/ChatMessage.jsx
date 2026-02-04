import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Avatar } from './Avatar';
import { ToolCallSteps } from './ToolCallStep';

export const ChatMessage = ({ message }) => {
  return (
    <div className={`message ${message.role}`}>
      {message.role === 'assistant' && <Avatar type="assistant" />}
      <div className="message-content">
        <strong>{message.role === 'user' ? '你' : 'AI 助手'}</strong>
        <div className="markdown-body">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
        </div>
        {message.role === 'assistant' && message.steps && message.steps.length > 0 && (
          <ToolCallSteps steps={message.steps} />
        )}
      </div>
      {message.role === 'user' && <Avatar type="user" />}
    </div>
  );
};
