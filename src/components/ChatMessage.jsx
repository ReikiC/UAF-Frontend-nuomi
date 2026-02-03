import React from 'react';
import { Avatar } from './Avatar';
import { ToolCallSteps } from './ToolCallStep';

export const ChatMessage = ({ message }) => {
  return (
    <div className={`message ${message.role}`}>
      {message.role === 'assistant' && <Avatar type="assistant" />}
      <div className="message-content">
        <strong>{message.role === 'user' ? '你' : 'AI 助手'}</strong>
        <p>{message.content}</p>
        {message.role === 'assistant' && message.steps && message.steps.length > 0 && (
          <ToolCallSteps steps={message.steps} />
        )}
      </div>
      {message.role === 'user' && <Avatar type="user" />}
    </div>
  );
};
