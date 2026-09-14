# What is OryxOS

OryxOS is an **enterprise Agent Harness OS**: installed on your own K8s, VMs, or bare metal, it runs all your business agents — ops, support, HR, sales, knowledge assistants — on one unified harness sharing channel access, model routing, memory, tool execution, sandboxing, and audit. Your data never leaves your infrastructure.

```
AGENT.md directory + Memory + Tool + MCP + Skill = one Agent
```

One directory defines an agent; one harness runs them all. Business teams never write agent backend code.

## Why you need it

- **Defining an agent shouldn't require code**: write one `AGENT.md` (frontmatter runtime config + body instructions) and it's live
- **Data stays in-house**: private deployment, SQLite + local files, no cloud lock-in
- **Execution isn't a black box**: `tool_invocations` / `llm_calls` audit tables persisted from day one; tool calls pass a whitelist sandbox
- **A fleet, not just one**: multi-agent coexistence, cron scheduling, unified channels and provider routing

## Five core capabilities

| Capability | Description |
|------|------|
| **LLM Providers** | Unified provider abstraction for DeepSeek, Qwen, Kimi, Zhipu, OpenAI, Anthropic, and local inference; explicit provider name → ChatModel mapping |
| **ReAct loop** | A self-implemented reasoning engine: think → call tools → observe → decide, until the final response |
| **Memory** | Session memory + long-term memory (MEMORY.md), actively read/written by agents; pluggable backends (md / sqlite / mem0) |
| **Tools** | 9 built-in tools + MCP extension; three integration tiers, zero-code recommended |
| **Web Service** | Full REST API exposing every capability — HTTP access from any language |

## Technical shape

- JDK 21 + Spring Boot 3.x monolith, Maven multi-module, single-JAR deployment (`java -jar`)
- SQLite persistence (sessions, audit, schedules) + MEMORY.md long-term memory file
- Three triggers, one entry: CLI / REST API (human push) + AgentScheduler cron (clock push)
- Apache 2.0, maintained by the [oryx-labs](https://github.com/oryx-labs) community

## Who it's for

- Enterprises that must run AI assistants on their own servers under strict data compliance
- Teams with multiple agent needs who don't want to build a backend for each
- Tech leads who want to govern agents with their existing Java ops toolchain
