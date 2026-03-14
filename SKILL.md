---
name: discord-task-monitor
version: 1.0.0
description: Discord 任务监控 - 通过 Webhook 在 Discord 频道中实时显示 subagent 任务执行状态
author: 小溪
license: MIT
keywords:
  - discord
  - task
  - monitor
  - subagent
  - webhook
---

# 💬 Discord Task Monitor

> 通过 Webhook 在 Discord 频道中实时显示 subagent 任务执行状态
> 支持 Embed 格式，消息美观整齐

---

## 🏗️ 架构图

```
┌─────────────────────────────────────────────────────────────────┐
│                        小隐 (主 Agent)                           │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │              DiscordTaskMonitor                          │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │  │
│  │  │ subagent-1  │  │ subagent-2  │  │ subagent-3  │     │  │
│  │  │  (🔍调研)    │  │  (✍️写作)    │  │  (🎨设计)    │     │  │
│  │  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘     │  │
│  │         │                  │                  │            │  │
│  │         └──────────────────┼──────────────────┘            │  │
│  │                            │                               │  │
│  │                     ┌──────┴──────┐                      │  │
│  │                     │ TaskTracker │                      │  │
│  │                     └──────┬──────┘                      │  │
│  └─────────────────────────────┼───────────────────────────────┘  │
│                                │                               │
└────────────────────────────────┼───────────────────────────────┘
                                 │
                    ┌────────────┴────────────┐
                    │   Discord Webhook      │
                    │   POST /api/webhooks   │
                    └────────────┬────────────┘
                                 │
                    ┌────────────┴────────────┐
                    │   Discord 服务器        │
                    │   ┌─────────────────┐    │
                    │   │ 📋 任务频道     │    │
                    │   │                │    │
                    │   │ 🤖 agent-1    │    │
                    │   │ 🤖 agent-2    │    │
                    │   │ 🤖 agent-3    │    │
                    │   └─────────────────┘    │
                    └─────────────────────────┘
```

---

## 🔄 流程图

```
                    ┌──────────────────┐
                    │  主人发起任务     │
                    │  "帮我写一篇博客"  │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │  startTask()     │
                    │  创建任务对象      │
                    │  生成 taskId      │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │  发送 Discord    │
                    │  Embed 消息      │
                    └────────┬─────────┘
                             │
              ┌─────────────┴─────────────┐
              │        并行执行             │
              │  ┌────────┐ ┌────────┐    │
              │  │agent-1 │ │agent-2 │    │
              │  │  🔍   │ │  ✍️   │    │
              │  └────┬──┘ └────┬──┘    │
              │       │         │       │
              │       └────┬────┘       │
              │            ▼            │
              │  ┌──────────────────┐  │
              │  │   report()       │  │
              │  │  使用不同用户名    │  │
              │  └────────┬─────────┘  │
              └───────────┼────────────┘
                          │
                          ▼
              ┌───────────────────────┐
              │  Discord Webhook    │
              │  每个 agent 不同身份  │
              │  🔍 researcher     │
              │  ✍️ writer        │
              │  🎨 designer      │
              └───────────┬───────────────┘
                          │
                          ▼
              ┌───────────────────────┐
              │  所有 agent 完成？     │
              └───────────┬───────────────┘
                    │     │
                    │Yes  │No
                    ▼     │
              ┌────┴─┐   │
              │完成  │   │
              │任务  │   │
              └──┬───┘   │
               │       │
               ▼       │
          ┌────┴────┐
          │ 📊 任务  │
          │ 统计面板 │
          └─────────┘
```

---

## ✨ 核心功能

- 📋 **任务追踪** - 实时显示每个 subagent 状态
- 🎨 **Embed 格式** - Discord 原生美观展示
- 👤 **多身份区分** - 每个 agent 有独立用户名和头像
- 📊 **任务看板** - 实时汇总所有任务状态

---

## 🚀 快速开始

### 安装

```bash
git clone https://github.com/adminlove520/discord-task-monitor.git
cd discord-task-monitor
npm install
```

### 配置

```javascript
const DiscordTaskMonitor = require('./discord-monitor');

const monitor = new DiscordTaskMonitor({
  webhookUrl: 'YOUR_WEBHOOK_URL'
});
```

---

## 📋 使用示例

### 1. 初始化

```javascript
const DiscordTaskMonitor = require('./discord-monitor');

const monitor = new DiscordTaskMonitor({
  webhookUrl: process.env.DISCORD_WEBHOOK_URL
});
```

### 2. 启动任务

```javascript
// 主人发起任务
const taskId = await monitor.startTask({
  name: '写一篇AI博客',
  description: '关于AI Agent的最新发展',
  agents: [
    { name: 'researcher', emoji: '🔍', role: '调研', color: 0x00ff00 },
    { name: 'writer', emoji: '✍️', role: '写作', color: 0x0000ff },
    { name: 'designer', emoji: '🎨', role: '设计', color: 0xff00ff }
  ]
});

console.log('任务ID:', taskId);
```

### 3. Subagent 报告

```javascript
// Subagent-1 完成调研（使用自己的身份）
await monitor.report({
  taskId: taskId,
  agentName: 'researcher',
  status: 'complete',
  result: '找到了10篇高质量参考文章'
});

// Subagent-2 完成写作
await monitor.report({
  taskId: taskId,
  agentName: 'writer',
  status: 'complete',
  result: '博客大纲+正文已完成'
});

// Subagent-3 完成设计
await monitor.report({
  taskId: taskId,
  agentName: 'designer',
  status: 'complete',
  result: '封面图+内文配图已完成'
});
```

### 4. 完成任务

```javascript
// 所有 subagent 完成后自动调用
await monitor.completeTask(taskId);
```

---

## 💬 消息格式

### Embed 展示

**任务开始：**
```
┌─────────────────────────────────────┐
│ 📋 任务: 写一篇AI博客               │
│                                     │
│ 🔍 researcher: ⏳ 等待中            │
│ ✍️ writer:    ⏳ 等待中            │
│ 🎨 designer:  ⏳ 等待中            │
│                                     │
│ 状态: 进行中  │  耗时: 0秒          │
└─────────────────────────────────────┘
```

**状态更新：**
```
🔍 researcher: 找到了10篇参考文章 ✓
✍️ writer: 博客大纲已完成 ✓
🎨 designer: 封面图设计完成 ✓
```

**任务完成：**
```
┌─────────────────────────────────────┐
│ ✅ 任务完成: 写一篇AI博客            │
│                                     │
│ 🔍 researcher: 30秒                 │
│ ✍️ writer:    2分钟                │
│ 🎨 designer:  1分钟                │
│                                     │
│ 总耗时: 3分30秒                      │
└─────────────────────────────────────┘
```

---

## 🎨 自定义外观

### 每个 Agent 的外观

```javascript
const agents = [
  { 
    name: 'researcher', 
    emoji: '🔍', 
    color: 0x00ff00,       // 绿色
    avatar: 'https://i.imgur.com/researcher.png',
    role: '调研员'
  },
  { 
    name: 'writer', 
    emoji: '✍️', 
    color: 0x0000ff,       // 蓝色
    avatar: 'https://i.imgur.com/writer.png',
    role: '作家'
  },
  { 
    name: 'designer', 
    emoji: '🎨', 
    color: 0xff00ff,       // 紫色
    avatar: 'https://i.imgur.com/designer.png',
    role: '设计师'
  }
];
```

### 状态颜色

| 状态 | 颜色 | 用途 |
|------|------|------|
| 🟡 进行中 | 0xffff00 | 黄色 |
| 🟢 完成 | 0x00ff00 | 绿色 |
| 🔴 失败 | 0xff0000 | 红色 |
| ⚪ 等待 | 0xcccccc | 灰色 |

---

## 📊 Embed 字段说明

```javascript
{
  // 消息头部
  username: '🔍 researcher',  // Agent 名称 + Emoji
  avatar_url: '...',          // Agent 头像
  
  // Embed 内容
  embeds: [{
    title: '📋 任务: xxx',     // 任务标题
    description: '...',       // 任务描述
    color: 0x00ff00,          // 颜色代码
    fields: [                  // 字段列表
      { name: 'Agent', value: '状态', inline: true },
      { name: '耗时', value: '30秒', inline: true }
    ],
    footer: { text: '状态: 进行中' },
    timestamp: '2026-01-01T00:00:00Z'
  }]
}
```

---

## 🔧 进阶配置

### 完整配置

```javascript
const monitor = new DiscordTaskMonitor({
  webhookUrl: 'xxx',
  username: '🤖 Task Monitor',  // 默认用户名
  avatarUrl: 'https://...',     // 默认头像
  embedColor: 0x00ff00         // 默认颜色
});
```

### 获取 Webhook URL

1. 进入 Discord 服务器
2. 进入频道设置 → 整合 → Webhook
3. 创建 Webhook
4. 复制 URL

---

## 📊 任务看板

```
┌─────────────────────────────────────────────┐
│         🤖 小隐任务大厅 - 实时看板          │
├─────────────────────────────────────────────┤
│ 📋 进行中任务: 2                           │
│   ├── 任务1: 写博客       🟡 2/3 agent    │
│   │   ├── 🔍 researcher  🟢              │
│   │   ├── ✍️ writer     🟡              │
│   │   └── 🎨 designer    ⚪              │
│   │                                       │
│   └── 任务2: 做海报       🟡 1/2 agent    │
│       └── 🎨 designer    🟢              │
├─────────────────────────────────────────────┤
│ ✅ 已完成任务: 15      平均耗时: 3分         │
│   ├── 任务: 写代码       3分钟             │
│   └── 任务: 调试bug      5分钟            │
└─────────────────────────────────────────────┘
```

---

## 📁 文件结构

```
discord-task-monitor/
├── SKILL.md              # 本文档
├── README.md             # 简介
├── discord-monitor.js    # 核心模块
├── example.js           # 使用示例
└── package.json
```

---

## 📝 更新日志

See [CHANGELOG.md](./CHANGELOG.md)

---

## 📄 许可证

MIT

---

**🦞 让任务清晰可见！**
