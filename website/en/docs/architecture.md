# Architecture

![OryxOS architecture](/flow.svg)

## Layers

### Trigger layer (human push / clock push)

- **CLI Channel**: interactive `oryxos chat`
- **Web Service**: REST API, HTTP access from any language
- **AgentScheduler**: declarative cron in `AGENT.md`

All three converge on a single entry — `AgentService.process()` — and the ReAct loop never knows the origin.

### Engine layer (self-implemented ReAct)

- **ReActLoop**: think → act → observe, MAX_ITERATIONS defaults to 10
- **PromptBuilder**: four-part context (system prompt + memory + chat history + tool list)
- **ToolExecutor**: tool dispatch + whitelist sandbox; Spring AI's automatic tool execution is disabled

### Capability layer

- **Provider (capability 1)**: explicit provider name → ChatModel mapping, switchable at runtime
- **Memory (capability 3)**: MemoryService facade over session + MEMORY.md long-term memory
- **Tool (capability 4)**: 9 built-in tools + MCP extension, three integration tiers

### External dependencies

- LLM APIs (OpenAI-compatible)
- SQLite + files (sessions, audit, MEMORY.md)
- MCP servers (stdio first)
- Enterprise user systems (Feishu / WeCom / DingTalk / Webhook)

## Maven modules (14)

| Module | Responsibility |
|------|------|
| oryxos-core | Core abstractions: OryxTool, Session, Profile, ReActLoop, AgentService, etc. |
| oryxos-persona | Persona library (copy-in templates) |
| oryxos-provider | Provider abstraction and explicit mapping |
| oryxos-memory | MemoryService facade, LongTermMemory, MemoryTools |
| oryxos-knowledge | Knowledge base: local backend, retrieval pipeline |
| oryxos-tool | Built-in tools, MCP client, ToolRegistry, Sandbox, Notify |
| oryxos-channel-cli | CLI channel |
| oryxos-channel-feishu | Feishu inbound channel |
| oryxos-channel-wecom | WeCom inbound channel |
| oryxos-channel-dingtalk | DingTalk inbound channel |
| oryxos-web | Web service: REST API, OpenAPI |
| oryxos-storage | SQLite persistence, audit repositories |
| oryxos-cli | Picocli CLI entry |
| oryxos-boot | Spring Boot bootstrap |

Modules are decoupled by interface: adding a channel or tool adds a module without touching core.
