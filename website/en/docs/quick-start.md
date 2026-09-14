# Quick Start

## Prerequisites

- JDK 21+
- Maven 3.8+
- An LLM API key (DeepSeek / Kimi / any OpenAI-compatible endpoint)

## Build

```bash
git clone https://github.com/oryx-labs/oryxos.git
cd oryxos
mvn clean package
```

This produces `oryxos-boot/target/oryxos-boot-0.1.0-SNAPSHOT.jar` (fat JAR).

## Initialize the workspace

```bash
java -jar oryxos-boot/target/*.jar init
```

Generates the `.oryxos/` workspace (idempotent, never overwrites):

```
.oryxos/
├── agents/<name>/AGENT.md   # one directory = one agent
├── skills/<name>/SKILL.md   # shared skill library
├── memory/MEMORY.md         # long-term memory
├── mcp_servers.yaml         # MCP server config
├── AGENTS.md  SOUL.md  USER.md
└── oryxos.db                # SQLite
```

## Configure the API key

```bash
export DEEPSEEK_API_KEY=sk-xxx   # injected via env, never hardcoded
```

## Chat on the CLI

```bash
java -jar oryxos-boot/target/*.jar chat --profile weather
```

## Start the REST API

```bash
java -jar oryxos-boot/target/*.jar serve   # default port 8080
```

```bash
# Create a session
curl -X POST http://localhost:8080/api/v1/sessions

# Send a message (returns the final response synchronously)
curl -X POST http://localhost:8080/api/v1/sessions/{id}/messages \
  -H "Content-Type: application/json" \
  -d '{"content":"Check Beijing weather and tell me what to wear"}'

# Stateless one-shot agent invocation
curl -X POST http://localhost:8080/api/v1/agents/weather/invoke \
  -H "Content-Type: application/json" \
  -d '{"message":"What should I wear in Shanghai today"}'
```

## Define an agent (zero code)

Edit `.oryxos/agents/daily-weather/AGENT.md`:

```markdown
---
name: daily-weather
description: Daily morning weather briefing with outfit advice
provider:
  name: deepseek
  model: deepseek-chat
tools:
  - http_get
  - notify
schedules:
  - key: morning
    cron: "0 0 8 * * *"
    message: Check today's weather in Beijing and push an outfit briefing to the team channel
---

You are the daily weather assistant. Query the weather on demand,
give a brief outfit suggestion, then push the result to the
team-lark channel via the notify tool.
```

Effective on the next reload — the agent runs automatically every morning at 8. Zero code throughout.
