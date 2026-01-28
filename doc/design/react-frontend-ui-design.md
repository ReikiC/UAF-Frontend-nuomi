# Universal Agent Frontend - React UI 设计稿

## 一、项目概述

### 1.1 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| React | 18+ | UI 框架 |
| TypeScript | 5+ | 类型安全 |
| Vite | 5+ | 构建工具 |
| Tailwind CSS | 3+ | 样式方案 |
| React Router | 6+ | 路由管理 |
| TanStack Query | 5+ | 数据获取与缓存 |
| Zustand | 4+ | 状态管理 |
| EventSource | - | 流式响应处理 |

### 1.2 核心功能模块

1. **聊天界面** - 支持4种聊天模式
   - 智能聊天（带MCP工具）
   - 智能聊天（流式）
   - 基础聊天（无工具）
   - 基础聊天（流式）

2. **MCP服务器管理** - 查看和管理MCP服务器列表

3. **设置中心** - 配置API密钥、偏好设置等

---

## 二、页面结构

### 2.1 路由设计

```
/
├── /                          # 首页（聊天界面）
├── /chat/:mode               # 聊天模式选择（smart/basic）
├── /mcp                      # MCP服务器管理
└── /settings                 # 设置页面
```

### 2.2 布局结构

```
┌─────────────────────────────────────────────────┐
│  Header (Logo + Nav + User Profile)            │
├───────────┬─────────────────────────────────────┤
│           │                                     │
│  Sidebar  │      Main Content Area             │
│           │                                     │
│  - 新对话  │                                     │
│  - 历史记录│                                     │
│  - MCP管理 │                                     │
│  - 设置    │                                     │
│           │                                     │
├───────────┴─────────────────────────────────────┤
│  Status Bar (Connection Status, Mode Indicator) │
└─────────────────────────────────────────────────┘
```

---

## 三、组件设计

### 3.1 页面组件树

```
App
├── Layout
│   ├── Header
│   ├── Sidebar
│   │   ├── ConversationList
│   │   ├── NavItem
│   │   └── MCPStatusWidget
│   ├── MainContent
│   │   ├── ChatPage
│   │   │   ├── ChatModeSelector
│   │   │   ├── ChatContainer
│   │   │   │   ├── MessageList
│   │   │   │   │   └── MessageBubble
│   │   │   │   │       ├── UserMessage
│   │   │   │   │       ├── AssistantMessage
│   │   │   │   │       └── ToolCallMessage
│   │   │   │   └── InputArea
│   │   │   │       ├── ChatInput
│   │   │   │       ├── SendButton
│   │   │   │       └── ToolUsageIndicator
│   │   │   └── StreamIndicator
│   │   ├── MCPServersPage
│   │   │   ├── ServerList
│   │   │   │   └── ServerCard
│   │   │   └── ServerDetails
│   │   └── SettingsPage
│   │       ├── APIKeyConfig
│   │       ├── ThemeSettings
│   │       └── ModelSelection
│   └── StatusBar
└── ToastContainer
```

### 3.2 核心组件详细设计

#### ChatPage (聊天页面)

**Props:**
```typescript
interface ChatPageProps {
  initialMode?: 'smart' | 'basic';
  enableStreaming?: boolean;
}
```

**State:**
```typescript
interface ChatState {
  messages: Message[];
  isStreaming: boolean;
  currentMode: 'smart' | 'basic';
  streamingEnabled: boolean;
}
```

**UI结构:**
```
┌──────────────────────────────────────────────┐
│  [智能聊天▼] [流式: 开]        MCP: 3个服务器在线 │
├──────────────────────────────────────────────┤
│                                              │
│  [用户] 你好，请介绍一下你自己                │
│  ────────────────────────────────────────────│
│  [助手] 你好！我是Universal Agent...         │
│                                              │
│  [用户] 帮我查询一下天气                      │
│  ────────────────────────────────────────────│
│  [🔧工具调用] weather_tool                    │
│  [助手] 今天是晴天，温度25°C...               │
│                                              │
│  (滚动到这里...)                            │
├──────────────────────────────────────────────┤
│  ┌────────────────────────────────────────┐ │
│  │  输入你的消息...                        │ │
│  └────────────────────────────────────────┘ │
│                               [发送] [🔧]    │
└──────────────────────────────────────────────┘
```

#### MessageBubble (消息气泡)

**Props:**
```typescript
interface MessageBubbleProps {
  role: 'user' | 'assistant' | 'tool';
  content: string;
  toolCalls?: ToolCall[];
  timestamp: Date;
}
```

**样式:**
- 用户消息: 右对齐，蓝色背景
- 助手消息: 左对齐，灰色背景
- 工具调用: 左侧带工具图标，可展开查看详情

#### ToolCallMessage (工具调用消息)

**Props:**
```typescript
interface ToolCallMessageProps {
  toolName: string;
  args: Record<string, any>;
  result?: any;
  status: 'pending' | 'success' | 'error';
}
```

**UI:**
```
┌─────────────────────────────────────────┐
│ 🔧 正在调用 weather_tool...             │
│    参数: { "city": "北京" }             │
│                                        │
│ ▼ 展开详情                              │
│   结果: { "temp": 25, "condition": "晴" }│
└─────────────────────────────────────────┘
```

#### MCPServersPage (MCP服务器管理页面)

**UI结构:**
```
┌──────────────────────────────────────────────┐
│  MCP 服务器管理                     [+ 添加]  │
├──────────────────────────────────────────────┤
│                                              │
│  ┌────────────────────────────────────────┐ │
│  │ ✅ filesystem          [详情] [配置]   │ │
│  │    提供文件系统操作能力                  │ │
│  │    状态: 运行中 | 工具数: 5            │ │
│  └────────────────────────────────────────┘ │
│                                              │
│  ┌────────────────────────────────────────┐ │
│  │ ✅ search                [详情] [配置]   │ │
│  │    提供网络搜索能力                      │ │
│  │    状态: 运行中 | 工具数: 3            │ │
│  └────────────────────────────────────────┘ │
│                                              │
│  ┌────────────────────────────────────────┐ │
│  │ ⚠️ database             [详情] [重启]    │ │
│  │    提供数据库操作能力                    │ │
│  │    状态: 离线   | 工具数: 8            │ │
│  └────────────────────────────────────────┘ │
└──────────────────────────────────────────────┘
```

---

## 四、API集成设计

### 4.1 API Client

```typescript
// src/lib/api/client.ts
import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  timeout: 60000,
});

// 请求拦截器
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
```

### 4.2 Chat API Hooks (使用 TanStack Query)

```typescript
// src/lib/api/chat.ts
import { apiClient } from './client';
import { useMutation, useQuery } from '@tanstack/react-query';

// 非流式聊天
export function useChat() {
  return useMutation({
    mutationFn: async (message: string) => {
      const { data } = await apiClient.post('/api/v1/chat', message, {
        headers: { 'Content-Type': 'application/json' }
      });
      return data;
    }
  });
}

// 流式聊天
export function useStreamChat() {
  return {
    sendMessage: async (message: string, onChunk: (chunk: string) => void) => {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/v1/chat/stream`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(message)
        }
      );

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) throw new Error('No reader available');

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        onChunk(chunk);
      }
    }
  };
}

// 基础聊天（无工具）
export function useBasicChat() {
  return useMutation({
    mutationFn: async (message: string) => {
      const { data } = await apiClient.post('/api/v1/chat/basic', message, {
        headers: { 'Content-Type': 'application/json' }
      });
      return data;
    }
  });
}

// 基础流式聊天
export function useBasicStreamChat() {
  return {
    sendMessage: async (message: string, onChunk: (chunk: string) => void) => {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/v1/chat/basic/stream`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(message)
        }
      );

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) throw new Error('No reader available');

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        onChunk(chunk);
      }
    }
  };
}
```

### 4.3 MCP API Hooks

```typescript
// src/lib/api/mcp.ts
import { apiClient } from './client';
import { useQuery } from '@tanstack/react-query';

interface MCPServer {
  name: string;
  status: 'online' | 'offline';
  tools: string[];
}

export function useMCPServers() {
  return useQuery({
    queryKey: ['mcp-servers'],
    queryFn: async () => {
      const { data } = await apiClient.get<MCPServer[]>('/api/v1/mcp/servers');
      return data;
    },
    refetchInterval: 30000, // 每30秒刷新
  });
}
```

---

## 五、状态管理

### 5.1 Store设计 (Zustand)

```typescript
// src/stores/chat-store.ts
import { create } from 'zustand';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  toolCalls?: ToolCall[];
}

interface ChatStore {
  messages: Message[];
  currentMode: 'smart' | 'basic';
  streamingEnabled: boolean;
  isStreaming: boolean;

  // Actions
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  setStreaming: (isStreaming: boolean) => void;
  setMode: (mode: 'smart' | 'basic') => void;
  toggleStreaming: () => void;
  clearMessages: () => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  messages: [],
  currentMode: 'smart',
  streamingEnabled: true,
  isStreaming: false,

  addMessage: (message) => set((state) => ({
    messages: [...state.messages, {
      ...message,
      id: crypto.randomUUID(),
      timestamp: new Date()
    }]
  })),

  setStreaming: (isStreaming) => set({ isStreaming }),

  setMode: (currentMode) => set({ currentMode }),

  toggleStreaming: () => set((state) => ({
    streamingEnabled: !state.streamingEnabled
  })),

  clearMessages: () => set({ messages: [] }),
}));
```

---

## 六、UI/UX设计要点

### 6.1 配色方案

| 用途 | 色值 (Tailwind) | 说明 |
|------|-----------------|------|
| Primary | `blue-600` | 主色调 |
| Secondary | `gray-100` | 背景色 |
| User Message | `blue-500` | 用户消息 |
| Assistant Message | `gray-200` | 助手消息 |
| Tool Call | `amber-100` | 工具调用背景 |
| Success | `green-500` | 成功状态 |
| Error | `red-500` | 错误状态 |
| Warning | `amber-500` | 警告状态 |

### 6.2 响应式断点

```typescript
const breakpoints = {
  sm: '640px',   // 移动设备
  md: '768px',   // 平板
  lg: '1024px',  // 小屏幕
  xl: '1280px',  // 桌面
  '2xl': '1536px' // 大屏幕
};
```

### 6.3 动画效果

```typescript
// 消息进入动画
const messageAnimation = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3 }
};

// 工具调用加载动画
const loadingSpinner = {
  animate: { rotate: 360 },
  transition: {
    repeat: Infinity,
    duration: 1,
    ease: 'linear'
  }
};
```

---

## 七、项目结构

```
universal-agent-frontend/
├── public/
│   └── favicon.ico
├── src/
│   ├── components/
│   │   ├── chat/
│   │   │   ├── ChatPage.tsx
│   │   │   ├── ChatContainer.tsx
│   │   │   ├── MessageList.tsx
│   │   │   ├── MessageBubble.tsx
│   │   │   ├── ToolCallMessage.tsx
│   │   │   ├── InputArea.tsx
│   │   │   ├── ChatInput.tsx
│   │   │   ├── ChatModeSelector.tsx
│   │   │   └── StreamIndicator.tsx
│   │   ├── mcp/
│   │   │   ├── MCPServersPage.tsx
│   │   │   ├── ServerList.tsx
│   │   │   └── ServerCard.tsx
│   │   ├── settings/
│   │   │   └── SettingsPage.tsx
│   │   ├── layout/
│   │   │   ├── Layout.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── ConversationList.tsx
│   │   │   └── StatusBar.tsx
│   │   └── ui/
│   │       ├── Button.tsx
│   │       ├── Card.tsx
│   │       ├── Dialog.tsx
│   │       ├── Select.tsx
│   │       ├── Toggle.tsx
│   │       └── Toast.tsx
│   ├── lib/
│   │   ├── api/
│   │   │   ├── client.ts
│   │   │   ├── chat.ts
│   │   │   └── mcp.ts
│   │   └── utils.ts
│   ├── stores/
│   │   └── chat-store.ts
│   ├── types/
│   │   ├── chat.ts
│   │   ├── mcp.ts
│   │   └── index.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── vite-env.d.ts
├── index.html
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── vite.config.ts
└── .env.example
```

---

## 八、配置文件示例

### 8.1 package.json

```json
{
  "name": "universal-agent-frontend",
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx",
    "format": "prettier --write \"src/**/*.{ts,tsx}\""
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.22.0",
    "@tanstack/react-query": "^5.28.0",
    "zustand": "^4.5.2",
    "axios": "^1.6.7",
    "clsx": "^2.1.0",
    "lucide-react": "^0.344.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.64",
    "@types/react-dom": "^18.2.21",
    "@typescript-eslint/eslint-plugin": "^7.1.1",
    "@typescript-eslint/parser": "^7.1.1",
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.18",
    "eslint": "^8.57.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.4.5",
    "postcss": "^8.4.35",
    "tailwindcss": "^3.4.1",
    "typescript": "^5.4.2",
    "vite": "^5.1.6"
  }
}
```

### 8.2 .env.example

```env
VITE_API_URL=http://localhost:8000
```

---

## 九、开发优先级

### Phase 1 - MVP (最小可行产品)
1. ✅ 基础聊天界面
2. ✅ 用户消息发送
3. ✅ 助手消息显示
4. ✅ 基础API集成

### Phase 2 - 核心功能
1. ✅ 流式响应支持
2. ✅ 聊天模式切换
3. ✅ 消息历史管理
4. ✅ MCP工具调用显示

### Phase 3 - 增强功能
1. ✅ MCP服务器管理页面
2. ✅ 设置页面
3. ✅ 会话持久化
4. ✅ 深色模式

### Phase 4 - 优化
1. ✅ 性能优化
2. ✅ 错误处理增强
3. ✅ 单元测试覆盖
4. ✅ E2E测试

---

## 十、后续扩展方向

1. **多模态支持** - 图片、文件上传
2. **语音交互** - 语音输入/输出
3. **代码编辑器** - 代码块高亮与复制
4. **导出功能** - 导出对话记录
5. **协作功能** - 多人实时协作
6. **插件系统** - 自定义MCP服务器
7. **移动端适配** - 响应式优化
8. **国际化** - i18n多语言支持
