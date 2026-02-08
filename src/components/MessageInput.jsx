import React from 'react';

export const MessageInput = ({ input, onInputChange, onSend, onCancel, onContinue, loading, isStreaming, canContinue }) => {
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
  const isSendDisabled = loading || !input.trim();
  const showCancel = isStreaming && loading;
  const showContinue = canContinue && !loading;

  return (
    <form className="input-area" onSubmit={handleSubmit}>
      <input
        value={input}
        onChange={(e) => onInputChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="输入消息..."
        disabled={loading}
      />
      <div className="button-group">
        {/* Cancel button */}
        {showCancel && (
          <button type="button" onClick={onCancel} className="cancel-button">
            停止
          </button>
        )}

        {/* Continue button */}
        {showContinue && (
          <button type="button" onClick={onContinue} className="continue-button">
            继续
          </button>
        )}

        {/* Send button */}
        <button type="submit" disabled={isSendDisabled} className="send-button">
          {loading ? '发送中...' : '发送'}
        </button>
      </div>
    </form>
  );
};
