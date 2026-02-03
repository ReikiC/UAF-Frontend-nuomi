import React from 'react';
import { ASSISTANT_AVATAR_SVG } from './avatars';

export const ChatHeader = () => {
  return (
    <div className="chat-header">
      <div className="avatar-section">
        <div className="assistant-avatar">
          {ASSISTANT_AVATAR_SVG}
        </div>
        <div className="title-section">
          <h1>Universal Agent</h1>
          <p className="subtitle">你的 AI 助手</p>
        </div>
      </div>
    </div>
  );
};
