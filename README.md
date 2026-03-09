# Universal Agent Frontend

Universal Agent Framework 的前端界面 - 基于 React + TypeScript + Vite 构建的现代化聊天应用。

## 功能特性

- 🔐 **用户认证** - JWT 登录/注册，自动 token 刷新
- 💬 **智能对话** - 集成 MCP 工具的 AI 聊天
- 📡 **流式响应** - 实时 SSE 流式输出
- 📝 **会话管理** - 创建、删除、恢复对话会话
- ⏸️ **任务控制** - 停止生成和继续任务
- 🎨 **现代 UI** - 基于 Tailwind CSS 的简洁设计
- 📱 **响应式** - 支持移动端和桌面端

## 技术栈

- **React 18** - UI 框架
- **TypeScript** - 类型安全
- **Vite** - 构建工具
- **React Router** - 路由管理
- **Zustand** - 状态管理
- **Axios** - HTTP 客户端
- **Tailwind CSS** - 样式框架
- **React Markdown** - Markdown 渲染

## 相关项目

### 核心组件

| 项目 | 说明 | 地址 |
|------|------|------|
| **UAF-Orchestrator** | Agent 编排框架（LangChain + LangGraph） | [https://github.com/ReikiC/UAF-Orchestrator](https://github.com/ReikiC/UAF-Orchestrator) |
| **UAF-Frontend-nuomi** | 前端界面（React + TypeScript + Vite） | [https://github.com/ReikiC/UAF-Frontend-nuomi](https://github.com/ReikiC/UAF-Frontend-nuomi) |
| **UAF-Data-Base** | PostgreSQL 数据库配置 | [https://github.com/ReikiC/UAF-Data-Base](https://github.com/ReikiC/UAF-Data-Base) |

### RAG 业务模块

| 项目 | 说明 | 地址 |
|------|------|------|
| **UAF-MCP-RAG-Frontend** | 知识库前端界面 | [https://github.com/ReikiC/UAF-MCP-RAG-Frontend](https://github.com/ReikiC/UAF-MCP-RAG-Frontend) |
| **UAF-MCP-RAG-Server** | RAG 后端服务（MCP 协议） | [https://github.com/ReikiC/UAF-MCP-RAG-Server](https://github.com/ReikiC/UAF-MCP-RAG-Server) |
| **UAF-MCP-RAG-DB** | RAG 向量数据库支持 | [https://github.com/ReikiC/UAF-MCP-RAG-DB](https://github.com/ReikiC/UAF-MCP-RAG-DB) |


## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

```bash
cp .env.example .env
```

编辑 `.env` 文件（如果需要）：

```bash
VITE_API_URL=http://localhost:8000
```

### 3. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

### 4. 构建生产版本

```bash
npm run build
```

## 项目结构

```
src/
├── pages/              # 页面组件
│   ├── LoginPage.tsx   # 登录页
│   ├── RegisterPage.tsx# 注册页
│   └── ChatPage.tsx    # 聊天主页
├── components/         # UI 组件
│   ├── auth/          # 认证相关
│   ├── chat/          # 聊天相关
│   ├── sessions/      # 会话相关
│   └── ui/            # 基础 UI 组件
├── hooks/             # 自定义 Hooks
│   ├── useChat.ts     # 聊天逻辑
│   └── useSSE.ts      # SSE 连接
├── services/          # API 服务
├── stores/            # Zustand 状态管理
├── types/             # TypeScript 类型
├── utils/             # 工具函数
└── styles/            # 全局样式
```

## API 集成

前端与 [Universal-Agent-Backend](https://github.com/ReikiC/Universal-Agent-Backend) 配合使用：

### 认证
- `POST /api/v1/auth/login` - 用户登录
- `POST /api/v1/auth/register` - 用户注册
- `POST /api/v1/auth/refresh` - 刷新 token
- `GET /api/v1/auth/me` - 获取当前用户信息

### 聊天
- `POST /api/v1/chat/single/toolcalls/stream/v2` - 流式聊天（带工具）

### 会话
- `GET /api/v1/sessions` - 列出会话
- `POST /api/v1/sessions` - 创建会话
- `GET /api/v1/sessions/{id}` - 获取会话详情
- `DELETE /api/v1/sessions/{id}` - 删除会话

### 任务
- `DELETE /api/v1/task/{id}` - 取消任务
- `POST /api/v1/task/continue/{id}` - 继续任务

## 使用说明

### 登录

1. 访问 http://localhost:3000
2. 点击"立即注册"创建账户
3. 使用邮箱和密码登录

### 聊天

1. 登录后进入聊天界面
2. 在左侧边栏选择或创建会话
3. 输入消息开始对话
4. 查看实时的流式响应

### 任务控制

- **停止生成** - 点击"停止生成"按钮中断 AI 回复
- **继续** - 中断后点击"继续"恢复任务

## 开发说明

### 添加新页面

1. 在 `src/pages/` 创建页面组件
2. 在 `src/App.tsx` 添加路由

### 添加 API 服务

1. 在 `src/types/api.types.ts` 添加类型定义
2. 在 `src/services/` 创建服务文件

### 自定义样式

- 全局样式：`src/styles/globals.css`
- Tailwind 配置：`tailwind.config.js`

## 许可证

Apache License 2.0
