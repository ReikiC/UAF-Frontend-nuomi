import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './App.css';

const API_ENDPOINTS = {
  smart: '/api/v1/chat',
  basic: '/api/v1/chat/basic',
  stream: '/api/v1/chat/stream',
  basicStream: '/api/v1/chat/basic/stream'
};

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [currentApi, setCurrentApi] = useState('smart');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // 自动滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      if (currentApi === 'stream' || currentApi === 'basicStream') {
        // 流式处理
        const response = await fetch(API_ENDPOINTS[currentApi], {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userMessage)
        });

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let assistantMessage = '';

        setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          assistantMessage += decoder.decode(value);
          setMessages(prev => {
            const newMessages = [...prev];
            newMessages[newMessages.length - 1].content = assistantMessage;
            return newMessages;
          });
        }
      } else {
        // 普通请求
        const { data } = await axios.post(
          API_ENDPOINTS[currentApi],
          userMessage,
          { headers: { 'Content-Type': 'application/json' } }
        );
        setMessages(prev => [...prev, { role: 'assistant', content: data.message || data }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Error: ' + error.message }]);
    }

    setLoading(false);
  };

  const getApiLabel = (key) => {
    switch (key) {
      case 'smart': return '智能聊天';
      case 'basic': return '基础聊天';
      case 'stream': return '流式聊天';
      case 'basicStream': return '基础流式';
      default: return key;
    }
  };

  return (
    <div className="chat-container">
      {/* 头部 - 包含 AI 助手头像 */}
      <div className="chat-header">
        <div className="avatar-section">
          <div className="assistant-avatar">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="12" fill="#4A90E2"/>
              <path d="M7 10C7 7.79086 8.79086 6 11 6H13C15.2091 6 17 7.79086 17 10V12C17 14.2091 15.2091 16 13 16H11C8.79086 16 7 14.2091 7 12V10Z" fill="white"/>
              <ellipse cx="10.5" cy="11" rx="1.5" ry="1.5" fill="#4A90E2"/>
              <ellipse cx="13.5" cy="11" rx="1.5" ry="1.5" fill="#4A90E2"/>
              <path d="M10 14C10 14 11 15 12 15C13 15 14 14 14 14" stroke="#4A90E2" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M8 8L6 6M16 8L18 6M8 17L6 19M16 17L18 19" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="title-section">
            <h1>Universal Agent</h1>
            <p className="subtitle">你的 AI 助手</p>
          </div>
        </div>
      </div>

      {/* API 切换按钮 */}
      <div className="api-selector">
        {Object.entries(API_ENDPOINTS).map(([key, endpoint]) => (
          <button
            key={key}
            className={currentApi === key ? 'active' : ''}
            onClick={() => setCurrentApi(key)}
          >
            {getApiLabel(key)}
          </button>
        ))}
      </div>

      {/* 消息列表 */}
      <div className="messages">
        {messages.length === 0 && (
          <div className="welcome-message">
            <p>👋 你好！我是 Universal Agent</p>
            <p>选择上方的聊天模式，开始我们的对话吧</p>
          </div>
        )}
        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.role}`}>
            {msg.role === 'assistant' && (
              <div className="message-avatar assistant">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="12" fill="#4A90E2"/>
                  <path d="M7 10C7 7.79086 8.79086 6 11 6H13C15.2091 6 17 7.79086 17 10V12C17 14.2091 15.2091 16 13 16H11C8.79086 16 7 14.2091 7 12V10Z" fill="white"/>
                  <ellipse cx="10.5" cy="11" rx="1.5" ry="1.5" fill="#4A90E2"/>
                  <ellipse cx="13.5" cy="11" rx="1.5" ry="1.5" fill="#4A90E2"/>
                  <path d="M10 14C10 14 11 15 12 15C13 15 14 14 14 14" stroke="#4A90E2" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
            )}
            <div className="message-content">
              <strong>{msg.role === 'user' ? '你' : 'AI 助手'}</strong>
              <p>{msg.content}</p>
            </div>
            {msg.role === 'user' && (
              <div className="message-avatar user">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="12" fill="#6B7280"/>
                  <path d="M12 4C9.23858 4 7 6.23858 7 9V11H17V9C17 6.23858 14.7614 4 12 4Z" fill="white"/>
                  <path d="M7 11C7 14.3137 9.23858 17 12 17C14.7614 17 17 14.3137 17 11H7Z" fill="white"/>
                  <path d="M8 19C8 19 9.5 20 12 20C14.5 20 16 19 16 19" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="message assistant">
            <div className="message-avatar assistant">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="12" fill="#4A90E2"/>
                <path d="M7 10C7 7.79086 8.79086 6 11 6H13C15.2091 6 17 7.79086 17 10V12C17 14.2091 15.2091 16 13 16H11C8.79086 16 7 14.2091 7 12V10Z" fill="white"/>
                <ellipse cx="10.5" cy="11" rx="1.5" ry="1.5" fill="#4A90E2"/>
                <ellipse cx="13.5" cy="11" rx="1.5" ry="1.5" fill="#4A90E2"/>
                <path d="M10 14C10 14 11 15 12 15C13 15 14 14 14 14" stroke="#4A90E2" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <div className="message-content">
              <p className="typing">正在输入...</p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 输入区域 */}
      <div className="input-area">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="输入消息..."
          disabled={loading}
        />
        <button onClick={sendMessage} disabled={loading || !input.trim()}>
          {loading ? '发送中...' : '发送'}
        </button>
      </div>
    </div>
  );
}

export default App;
