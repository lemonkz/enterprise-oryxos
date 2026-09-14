# 系统架构

![OryxOS 核心架构](/flow.svg)

## 分层说明

### 触发层（人推 / 钟推）

- **CLI Channel**：`oryxos chat` 命令行交互
- **Web Service**：REST API，任何语言 HTTP 接入
- **AgentScheduler**：`AGENT.md` 声明式 cron 定时任务

三个触发源汇入统一入口 `AgentService.process()`，ReAct 循环不感知消息来源。

### 引擎层（自实现 ReAct）

- **ReActLoop**：思考 → 行动 → 观察 循环，MAX_ITERATIONS 默认 10
- **PromptBuilder**：四段式上下文（system prompt + Memory + 对话历史 + Tool 列表）
- **ToolExecutor**：工具调度 + 白名单沙箱，Spring AI 自动 tool 执行被禁用

### 能力层

- **Provider（能力一）**：provider name → ChatModel 显式映射，运行时切换无锁定
- **Memory（能力三）**：MemoryService 三层门面，会话 + MEMORY.md 长期记忆
- **Tool（能力四）**：9 个内置工具 + MCP 扩展，三档接入

### 外部依赖

- 各家 LLM API（OpenAI 兼容）
- SQLite + 文件（会话、审计、MEMORY.md）
- MCP Server（stdio 优先）
- 企业用户系统（飞书 / 企微 / 钉钉 / Webhook）

## Maven 模块结构（14 个）

| 模块 | 职责 |
|------|------|
| oryxos-core | 核心抽象：OryxTool、Session、Profile、ReActLoop、AgentService 等 |
| oryxos-persona | 人格库（copy-in 模板） |
| oryxos-provider | Provider 抽象与显式映射 |
| oryxos-memory | MemoryService 门面、LongTermMemory、MemoryTools |
| oryxos-knowledge | 知识库：本地后端、检索流水线 |
| oryxos-tool | 内置 Tool、MCP Client、ToolRegistry、Sandbox、Notify |
| oryxos-channel-cli | CLI Channel |
| oryxos-channel-feishu | 飞书入站渠道 |
| oryxos-channel-wecom | 企微入站渠道 |
| oryxos-channel-dingtalk | 钉钉入站渠道 |
| oryxos-web | Web Service：REST API、OpenAPI |
| oryxos-storage | SQLite 持久化、审计 Repository |
| oryxos-cli | Picocli 命令行入口 |
| oryxos-boot | Spring Boot 启动模块 |

模块间接口解耦：新增 Channel / Tool 只加模块不改 core。
