import React from 'react';
import { ASSISTANT_AVATAR_SVG, USER_AVATAR_SVG } from './avatars';

export const Avatar = ({ type, size = 'default' }) => {
  const sizeClass = size === 'large' ? 'avatar-large' : 'avatar';

  return (
    <div className={`message-avatar ${type} ${sizeClass}`}>
      {type === 'assistant' ? ASSISTANT_AVATAR_SVG : USER_AVATAR_SVG}
    </div>
  );
};
