# CLAUDE.md

本文件为 Claude Code（及其他 AI coding agent）在本仓库工作时的项目指引。权威依据是 `docs/` 下的文档，冲突时以 `docs/TechnicalSolution.md` 为准。

## 项目是什么

**OryxOS** 是 Java 原生的企业级 Agent Harness OS：私有部署、可审计，装在企业自己的 K8s/服务器上统一运行各种业务 Agent。核心公式：

```
AGENT.md 目录 + Memory + Tool + MCP + Skill = 一个 Agent
```

- 一个目录（`.oryxos/agents/<name>/AGENT.md`）= 一个 Agent，配置出来而非写代码写出来
- 底座（Agent OS 内核）与业务 Agent 分层：第 1~10 章的能力是底座，第 11 章的目录形态是 Agent
- 核心阶段交付运行时内核；企业级治理（多租户、SSO、完整审计、Tool Policy）放扩展阶段

## 文档地图

| 文档 | 内容 |
|------|------|
| `docs/IndustryResearch.md` | 业界调研：Agent OS 定义、OpenClaw/Hermes 格局、Java 生态缺位、OryxOS 定位 |
| `docs/DemandAnalysis.md` | 需求文档（What）：五大核心能力、数据模型、验收标准、4 周节奏 |
| `docs/TechnicalSolution.md` | 技术方案（How）：技术选型、模块结构、关键设计。**最权威，随开发演进** |
| `docs/AiProgrammingGuide.md` | AI 编程指南：Spec-Kit 主体开发拆解（5 个 user story）+ 增量阶段工作流 |
| `docs/oryxos.md` | 对外简介：Agent Harness OS 定位、路线图 |
| `docs/oryx-labs.md` | 所属社区（oryx-labs）介绍 |
| `docs/prompt/prompt.md` | 历史提示词记录（多轮开发过程档案） |

## 技术栈

- **JDK 21 + Spring Boot 3.x** 单体应用，单 JAR 部署（`java -jar`），同步阻塞 + virtual thread
- **Spring AI + Spring AI Alibaba**：只用 Provider 抽象、协议转换、`@Tool` schema 生成
- **自实现 ReAct loop**（不依赖 Spring AI 的 Agent 抽象）
- **SQLite + Spring Data JPA**（Session、审计、定时任务表）+ **MEMORY.md** 文件（长期记忆）
- **Picocli**（CLI）、**SnakeYAML**（AGENT.md frontmatter 解析）、**MCP Java SDK**（stdio 优先）
- **Logback + SLF4J** 结构化日志

## Maven 模块结构（TechnicalSolution 第 10 章，14 个模块）

```
oryxos-core            核心抽象：OryxTool、Session、Profile、ContextLoader、AgentLoader、
                       ReActLoop、PromptBuilder、ToolExecutor、AgentService、AgentScheduler、
                       channel/knowledge 契约（依赖倒置，实现在各插件模块）
oryxos-persona         人格库（copy-in 模板）
oryxos-provider        能力一：ProviderService（provider name → ChatModel 显式映射）
oryxos-memory          能力三：MemoryService 门面、LongTermMemory、MemoryTools
oryxos-knowledge       知识库：本地后端、检索流水线、KnowledgeTools
oryxos-tool            能力四（三合一）：内置 Tool、McpClientService、McpToolAdapter、
                       ToolRegistry、Sandbox 接口 + WhitelistSandbox、NotifyChannelAdapter + WebhookNotifyAdapter
oryxos-channel-cli     CLI Channel
oryxos-channel-feishu  飞书入站渠道（oapi-sdk 长连接）
oryxos-channel-wecom   企微入站渠道（对称飞书）
oryxos-channel-dingtalk 钉钉入站渠道（Stream 长连接）
oryxos-web             能力五：WebServer、ApiController、GlobalExceptionHandler、OpenAPI
oryxos-storage         持久化：SQLite、SessionRepository、审计 Repository
oryxos-cli             命令行入口：Picocli 主入口、子命令、ConfigLoader
oryxos-boot            Spring Boot 启动模块
```

模块结构可按需演进（新增如 oryxos-sandbox 等），但接口契约放 `oryxos-core`（依赖倒置）。

## 宪法级原则（非协商，AI 不得自行修改）

1. **JDK 21 + Spring Boot 3.x 单体**，Maven 多模块，单二进制部署
2. **五大核心能力优先**，治理层放扩展阶段
3. **自实现 ReAct loop**，不用 Spring AI 的 Agent 抽象
4. **Spring AI 只用一半**：只用 Provider 抽象、协议转换、`@Tool` schema 生成；**禁用自动 tool 执行**，tool 调度完全由 `ReActLoop` + `ToolExecutor` 控制
5. **Plugin Tool 三档接入**，主推零代码（Agent 目录 + MCP）
6. **SQLite + MEMORY.md**：`tool_invocations` 和 `llm_calls` 审计表核心阶段就写入落库，不是只放日志
7. **每个 user story 完成后有可演示 Demo**

### AI 最容易写错的点（review 时重点检查）

| 错误 | 正确做法 |
|------|---------|
| 启用 Spring AI 自动 tool 执行（tool 被调两次） | 必须禁用，见原则 4 |
| Provider 靠类型扫描容器里的 ChatModel | 必须 provider name → ChatModel 显式映射 |
| 把 Tool 拆成多个模块 | 合并为一个 `oryxos-tool` |
| 把 `AgentLoader`/`AGENT.md` 当成 Tool | 归 core 的 `ContextLoader`，正文注入 system prompt |
| Memory 被简化成跟 Session 合并 | `MemoryService` 三层统一门面 |
| 审计只写日志不落库 | `tool_invocations`/`llm_calls` day one 写 SQLite |
| 用 Java SecurityManager | JDK 21 已移除；用 `Sandbox` 接口 + `WhitelistSandbox` |

## 关键架构约定

- **三个触发源汇同一入口**：CLI Channel / Web Service（人推）+ `AgentScheduler` cron（钟推），都调 `AgentService.process(Session, msg)`，`ReActLoop` 不感知来源
- **PromptBuilder 四段式**：system prompt（AGENT.md 正文 + Bootstrap + 日期时间）→ Memory 注入 → 对话历史（`maxHistoryTurns` 截断）→ Tool 列表
- **MAX_ITERATIONS 默认 10**，Profile 可覆盖；消息累积进 Session，可审计
- **Sandbox 接口先行**：`Sandbox.enforce(SandboxAction)`，核心阶段只挂 `WhitelistSandbox` 一档实现（文件路径/Shell 命令/HTTP 域名白名单），扩展只加实现类不改接口
- **Skill 是全局共享库**（`.oryxos/skills/<name>/SKILL.md`），Agent 通过自身 `skills/` 相对软连接绑定；每轮只注入 name/description/路径，正文经 `read_file` 按需读（渐进式披露）。Skill 不是 Tool，不进 ToolRegistry
- **Notify 出站**：`notify_channels` 全局注册表（SQLite），Agent 正文自然语言按名引用；`AGENT.md` frontmatter 无 `notify_channels` 字段
- **配置与密钥**：`${ENV_VAR}` 占位，加载时从环境变量解析，不明文写死
- **上下文无缓存**：`ContextLoader` 每次现读，改文件下一轮即生效

## 工作区结构（`oryxos init` 生成，幂等不覆盖）

```
.oryxos/
├── agents/<name>/AGENT.md   # frontmatter=运行配置，正文=任务指令
├── skills/<name>/SKILL.md   # 公共 Skill 实体库
├── memory/MEMORY.md         # 长期记忆（核心记忆/归档记忆两分区）
├── mcp_servers.yaml         # MCP server 配置
├── sessions/  logs/  output/
├── AGENTS.md  SOUL.md  USER.md   # Bootstrap，启动注入 system prompt
└── oryxos.db                # SQLite
```

## 常用命令

```bash
mvn clean package                        # 编译打包 fat JAR
java -jar oryxos-boot/target/*.jar       # 运行（serve 模式默认 8080）
oryxos init                              # 初始化 .oryxos/ 工作区
oryxos chat [--profile <name>]           # CLI 交互对话
oryxos serve                             # 启动 REST API
oryxos gateway                           # 多渠道守护进程
```

Maven 工程建立后：构建须通过 `mvn clean package`；测试用 JUnit 5，每个功能模块至少一个端到端用例。

## 开发方式

- **主体开发**：Spec-Kit（`.specify/`），把需求文档/技术方案喂给 `/speckit.specify` → `/speckit.plan` → `/speckit.tasks` → implement；每个 user story 完成后跑 `/speckit.analyze` 检查一致性
- **User story 依赖**：US-1(Provider) → US-2(ReAct) → US-3(Memory) ∥ US-4(Tool) → US-5(Web)
- **增量开发**：手动提示词直接改，小颗粒度不强制走 Spec-Kit
- git commit 标记每个 user story 完成，方便回退
