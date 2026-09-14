# 快速开始

## 环境要求

- JDK 21+
- Maven 3.8+
- 一个 LLM API Key（DeepSeek / Kimi / OpenAI 兼容协议均可）

## 编译打包

```bash
git clone https://github.com/oryx-labs/oryxos.git
cd oryxos
mvn clean package
```

产出 `oryxos-boot/target/oryxos-boot-0.1.0-SNAPSHOT.jar`（fat JAR）。

## 初始化工作区

```bash
java -jar oryxos-boot/target/*.jar init
```

生成 `.oryxos/` 工作区（幂等，不覆盖已有文件）：

```
.oryxos/
├── agents/<name>/AGENT.md   # 一个目录 = 一个 Agent
├── skills/<name>/SKILL.md   # 公共 Skill 库
├── memory/MEMORY.md         # 长期记忆
├── mcp_servers.yaml         # MCP server 配置
├── AGENTS.md  SOUL.md  USER.md
└── oryxos.db                # SQLite
```

## 配置 API Key

```bash
export DEEPSEEK_API_KEY=sk-xxx   # 环境变量注入，不明文写死
```

## CLI 交互对话

```bash
java -jar oryxos-boot/target/*.jar chat --profile weather
```

## 启动 REST API

```bash
java -jar oryxos-boot/target/*.jar serve   # 默认 8080
```

```bash
# 创建会话
curl -X POST http://localhost:8080/api/v1/sessions

# 发消息（同步返回最终响应）
curl -X POST http://localhost:8080/api/v1/sessions/{id}/messages \
  -H "Content-Type: application/json" \
  -d '{"content":"查一下北京天气并告诉我穿什么"}'

# 无状态调用一个 Agent
curl -X POST http://localhost:8080/api/v1/agents/weather/invoke \
  -H "Content-Type: application/json" \
  -d '{"message":"上海今天适合穿什么"}'
```

## 定义一个 Agent（零代码）

编辑 `.oryxos/agents/daily-weather/AGENT.md`：

```markdown
---
name: daily-weather
description: 每天早上查天气并推送穿搭建议
provider:
  name: deepseek
  model: deepseek-chat
tools:
  - http_get
  - notify
schedules:
  - key: morning
    cron: "0 0 8 * * *"
    message: 查一下北京今天的天气，生成穿搭建议并推送到团队群
---

你是每日天气助手。按要求查询天气，给出简短的穿搭建议，
然后用 notify 工具把结果发到 team-lark 渠道。
```

下一轮加载即生效，这个 Agent 每天早上 8 点自动运行——全程零代码。
