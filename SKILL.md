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

## ✨ 核心功能

- 📋 任务追踪 - 实时显示每个 subagent 状态
- 🎨 Embed 格式 - Discord 原生美观展示
- 👤 多身份区分 - 每个 agent 有独立用户名和头像
- 📊 任务看板 - 实时汇总所有任务状态

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

### 1. 启动任务

```javascript
// 创建新任务
const taskId = await monitor.startTask({
  name: '写一篇博客',
  description: '关于AI的博客',
  agents: [
    { name: 'researcher', emoji: '🔍', color: 0x00ff00 },
    { name: 'writer', emoji: '✍️', color: 0x0000ff },
    { name: 'designer', emoji: '🎨', color: 0xff00ff }
  ]
});
```

### 2. Subagent 报告

```javascript
// Subagent 完成
await monitor.report({
  taskId,
  agentName: 'researcher',
  status: 'complete',
  result: '调研完成，找到了10篇参考文章'
});
```

### 3. 完成任务

```javascript
// 任务全部完成
await monitor.completeTask(taskId);
```

---

## 💬 消息格式

### Embed 展示

```json
{
  "title": "📋 任务: 写一篇博客",
  "description": "🔍 researcher: 进行中\n✍️ writer: 等待中\n🎨 designer: 等待中",
  "color": "0x00ff00",
  "fields": [
    { "name": "状态", "value": "进行中", "inline": true },
    { "name": "耗时", "value": "0秒", "inline": true }
  ]
}
```

### 状态更新

```json
{
  "username": "🔍 researcher",
  "content": "调研完成 ✓"
}
```

### 任务完成

```json
{
  "title": "✅ 任务完成: 写一篇博客",
  "description": "🔍 researcher: 30秒\n✍️ writer: 2分钟\n🎨 designer: 1分钟",
  "color": "0x00ff00"
}
```

---

## 🎨 自定义外观

### 每个 Agent 的外观

```javascript
const agents = [
  { 
    name: 'researcher', 
    emoji: '🔍', 
    color: 0x00ff00,
    avatar: 'https://.../researcher.png'
  },
  { 
    name: 'writer', 
    emoji: '✍️', 
    color: 0x0000ff,
    avatar: 'https://.../writer.png'
  }
];
```

### 状态颜色

| 状态 | 颜色 |
|------|------|
| 进行中 | 🟡 0xffff00 |
| 完成 | 🟢 0x00ff00 |
| 失败 | 🔴 0xff0000 |
| 等待中 | ⚪ 0xcccccc |

---

## 📁 文件结构

```
discord-task-monitor/
├── SKILL.md
├── README.md
├── discord-monitor.js
└── example.js
```

---

## 📝 更新日志

See [CHANGELOG.md](./CHANGELOG.md)

---

## 📄 许可证

MIT

---

**🦞 让任务清晰可见！**
