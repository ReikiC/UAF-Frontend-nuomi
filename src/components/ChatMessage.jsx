import React from 'react';
import { Avatar } from './Avatar';

export const ChatMessage = ({ message }) => {
  return (
    <div className={`message ${message.role}`}>
      {message.role === 'assistant' && <Avatar type="assistant" />}
      <div className="message-content">
        <strong>{message.role === 'user' ? '你' : 'AI 助手'}</strong>
        <p>{message.content}</p>
      </div>
      {message.role === 'user' && <Avatar type="user" />}
    </div>
  );
};
