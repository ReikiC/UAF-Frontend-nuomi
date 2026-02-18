# Universal Agent Frontend - 实现计划

## Context

为 Universal Agent Framework (UAF) 后端设计前端界面。后端提供了完整的 REST API，包括 JWT 认证、聊天（支持 MCP 工具和流式响应）、会话管理、任务控制等功能。

## 技术栈

- **React 18 + TypeScript** - 核心框架
- **Vite** - 构建工具
- **Zustand** - 轻量级状态管理
- **shadcn/ui + Tailwind CSS** - UI 组件库
- **React Router v6** - 路由
- **Axios** - HTTP 客户端
- **react-markdown** - Markdown 渲染

## 后端 API 总结

### 认证相关

| 端点 | 方法 | 说明 | 认证 |
|------|------|------|:----:|
| `/api/v1/auth/register` | POST | 用户注册 | ❌ |
| `/api/v1/auth/login` | POST | 用户登录 | ❌ |
| `/api/v1/auth/refresh` | POST | 刷新 token | ❌ |
| `/api/v1/auth/me` | GET | 获取当前用户信息 | ✅ |

**登录响应**：
```json
{
  "access_token": "string",
  "refresh_token": "string",
  "token_type": "bearer",
  "expires_in": 1800
}
```

### 聊天相关

| 端点 | 方法 | 流式 | 工具 | 会话 | 认证 |
|------|------|:----:|:----:|:----:|:----:|
| `/api/v1/chat/basic` | POST | ❌ | ❌ | ❌ | ❌ |
| `/api/v1/chat/basic/stream` | POST | ✅ | ❌ | ❌ | ❌ |
| `/api/v1/chat/single/basic` | POST | ❌ | ❌ | ❌ | ✅ |
| `/api/v1/chat/single/toolcalls` | POST | ❌ | ✅ | ❌ | ✅ |
| `/api/v1/chat/single/toolcalls/stream` | POST | ✅ | ✅ | ❌ | ✅ |
| `/api/v1/chat/single/toolcalls/stream/v2` | POST | ✅ | ✅ | ✅ | ✅ |

**主要使用**：`/api/v1/chat/single/toolcalls/stream/v2`（完整功能）

**请求格式**：
```json
{
  "message": "string",
  "session_id": "string (optional)"
}
```

**SSE 事件类型**：
- `task_created` - 任务创建，返回 task_id 和 session_id
- `content_delta` - 内容更新
- `tool_call_start` - 工具调用开始
- `tool_call_end` - 工具调用结束
- `done` - 完成
- `cancelled` - 取消

### 会话管理

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/v1/sessions` | GET | 列出会话（支持 `?limit=20&offset=0`）|
| `/api/v1/sessions` | POST | 创建会话 |
| `/api/v1/sessions/{id}` | GET | 获取会话详情（含消息）|
| `/api/v1/sessions/{id}` | PUT | 更新会话（标题、模型）|
| `/api/v1/sessions/{id}` | DELETE | 删除会话（软删除）|
| `/api/v1/sessions/{id}/restore` | POST | 恢复已删除会话 |

### 任务管理

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/v1/task/{task_id}` | DELETE | 取消任务 |
| `/api/v1/task/continue/{task_id}` | POST | 继续任务 |
| `/api/v1/task/{task_id}` | GET | 查询任务状态 |

### MCP 管理

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/v1/mcp/servers` | GET | 列出所有 MCP 服务器 |

## 项目结构

```
src/
├── main.tsx                 # 入口
├── App.tsx                  # 路由配置
├── pages/
│   ├── LoginPage.tsx        # 登录页
│   ├── RegisterPage.tsx     # 注册页
│   ├── ChatPage.tsx         # 聊天主页面
│   └── SettingsPage.tsx     # 设置页
├── components/
│   ├── auth/
│   │   └── AuthGuard.tsx    # 路由守卫
│   ├── chat/
│   │   ├── ChatContainer.tsx    # 聊天容器
│   │   ├── ChatInput.tsx        # 输入框
│   │   ├── ChatMessages.tsx     # 消息列表
│   │   ├── MessageBubble.tsx    # 消息气泡
│   │   ├── ToolCallDisplay.tsx  # 工具调用显示
│   │   └── TaskControls.tsx     # 任务控制按钮
│   ├── sessions/
│   │   ├── SessionSidebar.tsx   # 会话侧边栏
│   │   └── SessionItem.tsx      # 会话项
│   └── ui/                    # shadcn/ui 组件
├── hooks/
│   ├── useAuth.ts           # 认证 hook
│   ├── useChat.ts           # 聊天 hook（SSE）
│   └── useSSE.ts            # SSE 连接 hook
├── services/
│   ├── api.ts               # axios 配置
│   ├── auth.service.ts      # 认证 API
│   ├── chat.service.ts      # 聊天 API
│   ├── sessions.service.ts  # 会话 API
│   └── tasks.service.ts     # 任务 API
├── stores/
│   ├── auth.store.ts        # 认证状态
│   └── chat.store.ts        # 聊天状态
├── types/
│   └── api.types.ts         # API 类型定义
├── utils/
│   └── constants.ts         # 常量
└── styles/
    └── globals.css          # 全局样式
```

## 核心文件清单

### 1. API 配置 (`src/services/api.ts`)
- axios 实例配置
- 请求拦截器（添加 Bearer token）
- 响应拦截器（处理 401，自动刷新 token）

### 2. 认证 Store (`src/stores/auth.store.ts`)
- 状态：user, accessToken, refreshToken
- 操作：login, register, logout, refreshAccessToken
- localStorage 持久化

### 3. 聊天 Hook (`src/hooks/useChat.ts`)
- 发送消息
- SSE 流式接收
- 处理工具调用事件
- 取消/继续任务

### 4. SSE Hook (`src/hooks/useSSE.ts`)
- EventSource 封装
- 事件类型处理
- 自动断线重连

### 5. 类型定义 (`src/types/api.types.ts`)
- 所有 API 请求/响应的 TypeScript 类型
- 与后端 schema 保持一致

## 认证流程

```
1. 登录 POST /api/v1/auth/login
   → 返回 access_token + refresh_token
   → 存储到 localStorage + Zustand store

2. 访问受保护端点
   → 请求拦截器添加 Authorization: Bearer <token>

3. 收到 401 错误
   → 调用 POST /api/v1/auth/refresh
   → 成功：重试原请求
   → 失败：登出，跳转登录页
```

## 聊天流程（流式）

```
1. 用户发送消息
   → POST /api/v1/chat/single/toolcalls/stream/v2
   → body: { message, session_id? }
   → headers: { Authorization: Bearer <token> }

2. SSE 事件流
   event: task_created
     → 保存 task_id 和 session_id

   event: content_delta
     → 追加内容到当前消息

   event: tool_call_start
     → 显示工具调用动画

   event: tool_call_end
     → 显示工具调用结果

   event: done / cancelled
     → 结束流
```

## 界面设计

### 布局
```
┌─────────────────────────────────────────────────┐
│  Universal Agent                    [设置] [登出]│
├──────────────┬──────────────────────────────────┤
│              │                                  │
│  会话列表     │  聊天区域                        │
│              │                                  │
│  + 新会话     │  AI: 你好！我是 Universal Agent  │
│              │                                  │
│  📁 会话 1    │  你: 帮我查一下天气              │
│  📁 会话 2    │                                  │
│  ...          │  AI: [工具调用] weather_search   │
│              │  今天是晴天...                    │
│              │                                  │
│              │  ┌────────────────────────────┐  │
│              │  │ 输入消息...               │  │
│              │  └────────────────────────────┘  │
│              │              [发送] [停止]       │
└──────────────┴──────────────────────────────────┘
```

### 配色方案
- 主色：紫色 (#8b5cf6) - 现代、科技感
- 背景：浅色/深色主题支持
- 豆包风格：简洁、圆润、友好

## 实现步骤

### Phase 1: 项目初始化
```bash
cd /Users/dankao/Documents/GitHub/nuomi-frontend
npm create vite@latest . -- --template react-ts
npm install
npm install zustand axios react-router-dom react-markdown
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### Phase 2: 基础设施
1. 配置 Tailwind CSS
2. 创建 axios 实例
3. 创建 Zustand stores
4. 定义 TypeScript 类型
5. 配置 React Router

### Phase 3: 认证功能
1. 登录/注册页面
2. AuthGuard 路由守卫
3. Token 刷新逻辑
4. 登出功能

### Phase 4: 聊天功能
1. ChatPage 布局
2. SessionSidebar 组件
3. ChatMessages 组件
4. ChatInput 组件
5. SSE 流式接收
6. 工具调用显示

### Phase 5: 会话管理
1. 加载会话列表
2. 创建/删除/恢复会话
3. 切换会话
4. 会话详情（加载历史消息）

### Phase 6: 任务控制
1. 停止生成按钮
2. 继续任务功能
3. 任务状态显示

### Phase 7: 优化完善
1. 加载状态
2. 错误处理
3. 响应式设计
4. Markdown 渲染
5. 代码高亮

## 环境变量

```bash
# .env
VITE_API_URL=http://localhost:8000
```

## 验证测试

1. **认证流程**
   - 注册新用户
   - 登录获取 token
   - 访问受保护页面
   - Token 过期后自动刷新

2. **聊天功能**
   - 发送消息接收流式响应
   - 查看工具调用过程
   - 停止生成
   - 继续任务

3. **会话管理**
   - 创建新会话
   - 查看会话列表
   - 切换会话查看历史
   - 删除/恢复会话

## 关键 API 端点速查

```typescript
// 基础 URL
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// 认证
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/refresh
GET    /api/v1/auth/me

// 聊天（主要用这个）
POST   /api/v1/chat/single/toolcalls/stream/v2

// 会话
GET    /api/v1/sessions
POST   /api/v1/sessions
GET    /api/v1/sessions/{id}
PUT    /api/v1/sessions/{id}
DELETE /api/v1/sessions/{id}
POST   /api/v1/sessions/{id}/restore

// 任务
DELETE /api/v1/task/{task_id}
POST   /api/v1/task/continue/{task_id}
GET    /api/v1/task/{task_id}

// MCP
GET    /api/v1/mcp/servers
```

## 参考资料

- 后端仓库：[Universal-Agent-Backend](https://github.com/ReikiC/Universal-Agent-Backend)
- API 文档：启动后端后访问 `http://localhost:8000/docs`
