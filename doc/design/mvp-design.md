# Universal Agent Frontend - MVP 设计稿（超简版）

## 📋 项目概述

一个最简单的聊天界面，支持API切换。

---

## 🎯 功能需求（MVP）

1. **聊天界面** - 发送消息，显示回复
2. **API切换** - 3个按钮切换不同的API endpoint
3. **基础样式** - 简洁的UI

---

## 🎨 界面设计

```
┌──────────────────────────────────────────────┐
│  Universal Agent Chat                        │
├──────────────────────────────────────────────┤
│  [智能聊天] [基础聊天] [流式聊天]             │
├──────────────────────────────────────────────┤
│                                              │
│  你: 你好                                    │
│                                              │
│  AI: 你好！我是 Universal Agent...          │
│                                              │
│  你: 帮我查询天气                            │
│                                              │
│  AI: 今天是晴天...                          │
│                                              │
│  (消息区域 - 自动滚动)                       │
│                                              │
├──────────────────────────────────────────────┤
│  ┌────────────────────────────────────────┐ │
│  │  输入消息...                            │ │
│  └────────────────────────────────────────┘ │
│                               [发送]         │
└──────────────────────────────────────────────┘
```

---

## 🔧 API 端点

| 按钮名称 | API 端点 | 说明 |
|---------|---------|------|
| 智能聊天 | `/api/v1/chat` | 带MCP工具的聊天 |
| 基础聊天 | `/api/v1/chat/basic` | 无工具的聊天 |
| 流式聊天 | `/api/v1/chat/stream` | 流式响应 |
| 流式聊天 | `/api/v1/chat/basic/stream` | 无工具的流式响应 |

---

## 💻 技术栈（最小依赖）

```json
{
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "axios": "^1.6.7"
  }
}
```

---

## 📁 文件结构

```
mvp-chat/
├── index.html
├── package.json
└── src/
    ├── App.jsx
    └── main.jsx
```

---

## 🧩 组件代码

### App.jsx

```jsx
import { useState } from 'react';
import axios from 'axios';
import './App.css';

const API_ENDPOINTS = {
  smart: '/api/v1/chat',
  basic: '/api/v1/chat/basic',
  stream: '/api/v1/chat/stream'
};

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [currentApi, setCurrentApi] = useState('smart');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      if (currentApi === 'stream') {
        // 流式处理
        const response = await fetch(API_ENDPOINTS[currentApi], {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: userMessage })
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
          { content: userMessage },
          { headers: { 'Content-Type': 'application/json' } }
        );
        setMessages(prev => [...prev, { role: 'assistant', content: data.content || data }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Error: ' + error.message }]);
    }

    setLoading(false);
  };

  return (
    <div className="chat-container">
      <h1>Universal Agent Chat</h1>

      {/* API 切换按钮 */}
      <div className="api-selector">
        {Object.entries(API_ENDPOINTS).map(([key, endpoint]) => (
          <button
            key={key}
            className={currentApi === key ? 'active' : ''}
            onClick={() => setCurrentApi(key)}
          >
            {key === 'smart' ? '智能聊天' : key === 'basic' ? '基础聊天' : '流式聊天'}
          </button>
        ))}
      </div>

      {/* 消息列表 */}
      <div className="messages">
        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.role}`}>
            <strong>{msg.role === 'user' ? '你' : 'AI'}:</strong>
            <p>{msg.content}</p>
          </div>
        ))}
        {loading && <div className="message assistant">AI 正在输入...</div>}
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
```

### App.css

```css
.chat-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: sans-serif;
}

.api-selector {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.api-selector button {
  padding: 8px 16px;
  border: 2px solid #ddd;
  background: white;
  cursor: pointer;
  border-radius: 4px;
}

.api-selector button.active {
  background: #2563eb;
  color: white;
  border-color: #2563eb;
}

.messages {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  height: 400px;
  overflow-y: auto;
  margin-bottom: 20px;
  background: #f9fafb;
}

.message {
  margin-bottom: 15px;
  padding: 10px;
  border-radius: 8px;
}

.message.user {
  background: #dbeafe;
  text-align: right;
}

.message.assistant {
  background: #e5e7eb;
}

.message strong {
  display: block;
  margin-bottom: 5px;
}

.input-area {
  display: flex;
  gap: 10px;
}

.input-area input {
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

.input-area button {
  padding: 10px 20px;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.input-area button:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}
```

### main.jsx

```jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

### index.html

```html
<!DOCTYPE html>
<html lang="zh">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Universal Agent Chat - MVP</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

### package.json

```json
{
  "name": "universal-agent-mvp",
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "axios": "^1.6.7"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.1",
    "vite": "^5.1.6"
  }
}
```

### vite.config.js

```js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true
      }
    }
  }
});
```

---

## 🚀 快速开始

```bash
# 1. 创建项目
npm create vite@latest mvp-chat -- --template react
cd mvp-chat

# 2. 安装依赖
npm install

# 3. 添加 axios
npm install axios

# 4. 复制上面代码到对应文件

# 5. 启动
npm run dev
```

---

## ✨ 后续可扩展功能（等MVP完成后再考虑）

- [ ] 消息历史保存
- [ ] 深色模式
- [ ] 代码高亮
- [ ] MCP工具调用可视化
- [ ] 设置页面
- [ ] 会话管理
