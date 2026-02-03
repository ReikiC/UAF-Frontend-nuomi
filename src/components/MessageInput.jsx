import React from 'react';

export const MessageInput = ({ input, onInputChange, onSend, loading }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSend();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  // Use explicit conditional rendering instead of &&
  // See: rendering-conditional-render
  const isDisabled = loading || !input.trim();

  return (
    <form className="input-area" onSubmit={handleSubmit}>
      <input
        value={input}
        onChange={(e) => onInputChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="输入消息..."
        disabled={loading}
      />
      <button type="submit" disabled={isDisabled}>
        {loading ? '发送中...' : '发送'}
      </button>
    </form>
  );
};
