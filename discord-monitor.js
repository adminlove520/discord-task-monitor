/**
 * 💬 Discord Task Monitor
 * 通过 Webhook 在 Discord 中实时显示 subagent 任务状态
 */

const fetch = require('node-fetch');

class DiscordTaskMonitor {
  constructor(options = {}) {
    this.webhookUrl = options.webhookUrl;
    this.tasks = new Map();
  }

  /**
   * 发送 Discord 消息
   */
  async send(embed) {
    const response = await fetch(this.webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(embed)
    });
    
    return response.ok;
  }

  /**
   * 启动任务
   */
  async startTask(taskInfo) {
    const taskId = `task_${Date.now()}`;
    const task = {
      id: taskId,
      name: taskInfo.name,
      description: taskInfo.description || '',
      agents: taskInfo.agents || [],
      status: 'running',
      startTime: Date.now(),
      reports: []
    };
    
    this.tasks.set(taskId, task);
    
    // 发送 Embed
    const embed = this.formatTaskStart(task);
    await this.send(embed);
    
    return taskId;
  }

  /**
   * Subagent 报告状态
   */
  async report(reportInfo) {
    const { taskId, agentName, status, result } = reportInfo;
    const task = this.tasks.get(taskId);
    
    if (!task) {
      console.error('Task not found:', taskId);
      return;
    }
    
    const agent = task.agents.find(a => a.name === agentName);
    const emoji = agent ? agent.emoji : '🤖';
    const color = agent ? agent.color : 0x00ff00;
    
    task.reports.push({
      agentName,
      status,
      result,
      time: Date.now()
    });
    
    // 发送状态更新（使用用户名区分不同 agent）
    const message = {
      username: `${emoji} ${agentName}`,
      avatar_url: agent ? agent.avatar : null,
      content: `${result} ${status === 'complete' ? '✓' : '🔄'}`
    };
    
    await this.send(message);
    
    // 检查是否全部完成
    if (this.isTaskComplete(task)) {
      await this.completeTask(taskId);
    }
  }

  /**
   * 完成任务
   */
  async completeTask(taskId) {
    const task = this.tasks.get(taskId);
    if (!task) return;
    
    task.status = 'completed';
    task.endTime = Date.now();
    task.duration = task.endTime - task.startTime;
    
    const embed = this.formatTaskComplete(task);
    await this.send(embed);
  }

  /**
   * 检查任务是否完成
   */
  isTaskComplete(task) {
    return task.agents.every(agent => {
      const report = task.reports.find(r => r.agentName === agent.name);
      return report && report.status === 'complete';
    });
  }

  /**
   * 格式化任务开始 Embed
   */
  formatTaskStart(task) {
    const fields = task.agents.map(agent => ({
      name: `${agent.emoji} ${agent.name}`,
      value: '⏳ 等待中',
      inline: true
    }));
    
    return {
      username: '🤖 Task Monitor',
      avatar_url: 'https://i.imgur.com/xxx.png',
      embeds: [{
        title: `📋 任务: ${task.name}`,
        description: task.description || '无描述',
        color: 0xffff00, // 黄色进行中
        fields: fields,
        footer: {
          text: '状态: 进行中'
        },
        timestamp: new Date().toISOString()
      }]
    };
  }

  /**
   * 格式化任务完成 Embed
   */
  formatTaskComplete(task) {
    const duration = Math.round(task.duration / 1000);
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    const durationStr = minutes > 0 ? `${minutes}分${seconds}秒` : `${seconds}秒`;
    
    const fields = task.reports.map(r => {
      const agent = task.agents.find(a => a.name === r.agentName);
      const emoji = agent ? agent.emoji : '🤖';
      const time = Math.round((r.time - task.startTime) / 1000);
      return {
        name: `${emoji} ${r.agentName}`,
        value: `${r.result} ✓ (${time}秒)`,
        inline: true
      };
    });
    
    return {
      username: '✅ Task Complete',
      embeds: [{
        title: `✅ 任务完成: ${task.name}`,
        description: task.description || '',
        color: 0x00ff00, // 绿色完成
        fields: fields,
        footer: {
          text: `总耗时: ${durationStr}`
        },
        timestamp: new Date().toISOString()
      }]
    };
  }

  /**
   * 获取任务看板
   */
  getBoard() {
    const running = [];
    const completed = [];
    
    for (const [id, task] of this.tasks) {
      const taskSummary = {
        id: task.id,
        name: task.name,
        status: task.status,
        duration: task.duration ? Math.round(task.duration / 1000) : null
      };
      
      if (task.status === 'running') {
        running.push(taskSummary);
      } else {
        completed.push(taskSummary);
      }
    }
    
    return { running, completed };
  }
}

module.exports = DiscordTaskMonitor;
