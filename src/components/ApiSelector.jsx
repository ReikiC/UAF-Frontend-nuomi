import React from 'react';

const API_ENDPOINTS = {
  smart: '/api/v1/chat',
  basic: '/api/v1/chat/basic'
};

const API_LABELS = {
  smart: '智能聊天',
  basic: '基础聊天'
};

// Using composition pattern - explicit component for API selection
// Avoids boolean prop proliferation
// See: architecture-avoid-boolean-props
export const ApiSelector = ({ currentApi, onApiChange }) => {
  return (
    <div className="api-selector">
      {Object.entries(API_ENDPOINTS).map(([key]) => (
        <button
          key={key}
          className={currentApi === key ? 'active' : ''}
          onClick={() => onApiChange(key)}
        >
          {API_LABELS[key]}
        </button>
      ))}
    </div>
  );
};

export { API_ENDPOINTS };
