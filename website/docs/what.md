# OryxOS 是什么

OryxOS 是**企业级 Agent Harness OS（Agent 操作系统）**：装在企业自己的 K8s、虚拟机或物理机上，作为统一底座运行各种业务 Agent——运维助手、客服助手、HR 助手、销售助手、知识管理助手——共享同一套渠道接入、模型路由、记忆系统、工具调用、沙箱执行与审计能力。数据完全留在企业自己的基础设施，不锁任何云生态。

```
AGENT.md 目录 + Memory + Tool + MCP + Skill = 一个 Agent
```

一个目录定义一个 Agent，一个底座运行一群 Agent。业务方不需要写 Agent 后端代码。

## 为什么需要它

- **定义一个 Agent 不该要写代码**：写一份 `AGENT.md`（frontmatter 运行配置 + 正文任务指令）即上线
- **数据不出企业**：私有部署，SQLite + 本地文件，不绑任何云
- **执行不是黑盒**：`tool_invocations` / `llm_calls` 审计表 day one 落库，工具调用过白名单沙箱
- **跑一群不难**：多 Agent 并存、定时调度、统一渠道与 Provider 路由

## 五大核心能力

| 能力 | 说明 |
|------|------|
| **对接 LLM** | Provider 抽象统一对接 DeepSeek、通义、Kimi、智谱、OpenAI、Anthropic 及本地推理，provider name → ChatModel 显式映射 |
| **ReAct 循环** | 自实现的推理引擎：思考 → 调工具 → 看结果 → 再决策，直到给出最终响应 |
| **Memory 记忆** | 会话记忆 + 长期记忆（MEMORY.md），Agent 主动读写，后端可插拔（md / sqlite / mem0） |
| **Tool 工具** | 9 个内置工具 + MCP 扩展，Plugin Tool 三档接入，零代码为主推 |
| **Web Service** | REST API 暴露全部能力，任何语言 HTTP 接入 |

## 技术形态

- JDK 21 + Spring Boot 3.x 单体，Maven 多模块，单 JAR 部署（`java -jar`）
- SQLite 持久化（会话、审计、定时任务）+ MEMORY.md 长期记忆文件
- 三个触发源汇同一入口：CLI / REST API（人推）+ AgentScheduler cron（钟推）
- Apache 2.0 开源协议，由 [oryx-labs](https://github.com/oryx-labs) 社区维护

## 适合谁

- 想把 AI 助手跑在自己服务器上、数据合规要求高的企业
- 有多个业务 Agent 需求、不想每个都自建后端的团队
- 希望用 Java 体系运维工具链统一治理 Agent 的技术负责人
