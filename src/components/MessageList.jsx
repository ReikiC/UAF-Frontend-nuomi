import React, { useRef, useEffect } from 'react';
import { ChatMessage } from './ChatMessage';
import { Avatar } from './Avatar';

export const MessageList = ({ messages, loading }) => {
  const messagesEndRef = useRef(null);

  // Move scroll logic directly to where it's needed
  // Use useEffect for scrolling after messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  return (
    <div className="messages">
      {messages.length === 0 ? (
        <div className="welcome-message">
          <p>👋 你好！我是 Universal Agent</p>
          <p>选择上方的聊天模式，开始我们的对话吧</p>
        </div>
      ) : (
        messages.map((msg, idx) => (
          <ChatMessage key={idx} message={msg} />
        ))
      )}
      {loading && (
        <div className="message assistant">
          <Avatar type="assistant" />
          <div className="message-content">
            <p className="typing">正在输入...</p>
          </div>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};
