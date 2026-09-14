<script setup>
import { computed } from 'vue'
import { useData } from 'vitepress'

const { lang } = useData()
const isZh = computed(() => lang.value !== 'en-US')
const t = (zh, en) => isZh.value ? zh : en

const capabilities = computed(() => [
  {
    icon: '📄',
    title: t('一个目录 = 一个 Agent', 'One Directory = One Agent'),
    subtitle: t('AGENT.md · frontmatter 配置 · 正文即指令', 'AGENT.md · frontmatter config · body as instructions'),
    code: `# .oryxos/agents/daily-weather/AGENT.md
---
name: daily-weather
description: 每天早上查天气并推送穿搭建议
provider:
  name: deepseek
  model: deepseek-chat
tools: [http_get, notify]
schedules:
  - key: morning
    cron: "0 0 8 * * *"
    message: 查北京天气，生成穿搭建议并推送
---

你是每日天气助手。按要求查询天气，
给出简短的穿搭建议，然后用 notify
工具把结果发到团队群。`,
  },
  {
    icon: '🧠',
    title: t('会话记忆 + 长期记忆', 'Session Memory + Long-term Memory'),
    subtitle: t('MEMORY.md · save_memory / recall_memory · 后端可插拔', 'MEMORY.md · save_memory / recall_memory · pluggable backend'),
    code: `# Agent 在对话中主动读写长期记忆
user: 记住我们团队用飞书，别再发邮件了

assistant -> tool_call:
  save_memory(
    key: "team.im.preference",
    content: "团队 IM 是飞书，通知走飞书"
  )

# 跨对话按需召回
user: 把昨天的巡检结论再发我一次

assistant -> tool_call:
  recall_memory(query: "巡检结论")`,
  },
  {
    icon: '🛠️',
    title: t('内置 Tool + MCP + 沙箱', 'Built-in Tools + MCP + Sandbox'),
    subtitle: t('9 个内置工具 · 三档接入 · 白名单沙箱', '9 built-in tools · 3 tiers · whitelist sandbox'),
    code: `# .oryxos/mcp_servers.yaml — 零代码挂外部工具
servers:
  - name: jira
    command: npx
    args: ["-y", "@mcp/jira-server"]
    env:
      JIRA_URL: \${JIRA_URL}

# .oryxos/config.yaml — 白名单沙箱
sandbox:
  file:
    allowed_paths: [".oryxos/output"]
  shell:
    allowed_commands: ["git", "mvn"]
  http:
    allowed_domains: ["api.github.com"]`,
  },
])

const scenarios = computed(() => [
  {
    num: '01',
    title: t('每日天气推送', 'Daily weather briefing'),
    desc: t('光杆 AGENT.md 定义的最小 Agent：cron 钟推触发，http_get 查天气，notify 推送到群。零代码上线。', 'The minimal agent defined by a bare AGENT.md: cron-triggered, http_get for weather, notify to push. Zero code.'),
  },
  {
    num: '02',
    title: t('每日科技日报', 'Daily tech digest'),
    desc: t('绑定 Skill 的内容型 Agent：按 Skill 里的信源清单抓取、筛选、成文，定时推送日报。', 'A content agent with a bound Skill: fetch, filter, and compose per the skill\'s source list, pushed on schedule.'),
  },
  {
    num: '03',
    title: t('GitHub 仓库日报', 'GitHub repo digest'),
    desc: t('带 scripts/ 的进阶 Agent：自定义脚本聚合 issue/PR 动态，生成团队周报素材。', 'An advanced agent with scripts/: custom scripts aggregate issue/PR activity into weekly-report material.'),
  },
  {
    num: '04',
    title: t('运维值守', 'Ops on-call companion'),
    desc: t('AgentScheduler 定时巡检指标，异常时按优先级推送告警到值班群，附处置建议与审计留痕。', 'Scheduled health checks; anomalies push prioritized alerts to the on-call channel with remediation hints, fully audited.'),
  },
  {
    num: '05',
    title: t('客服知识助手', 'Customer support assistant'),
    desc: t('知识库检索流水线 + IM 渠道接入：客户在飞书/企微/钉钉提问，Agent 检索知识库作答，人工可随时接管。', 'Knowledge retrieval + IM inbound: customers ask on Feishu/WeCom/DingTalk, the agent answers from the KB, humans can take over.'),
  },
  {
    num: '06',
    title: t('HR 入职助手', 'HR onboarding assistant'),
    desc: t('长期记忆记住每位新同事的进度，自动提醒材料、排期培训，入职流程不再靠人肉跟进。', 'Long-term memory tracks each new hire\'s progress; reminders and training scheduled automatically.'),
  },
  {
    num: '07',
    title: t('IM 入站对话', 'Inbound IM conversations'),
    desc: t('飞书、企微、钉钉长连接渠道，消息与 CLI、REST API 汇入同一 AgentService 链路，ReAct 不感知来源。', 'Feishu/WeCom/DingTalk long-connections feed the same AgentService pipeline as CLI and REST — the loop never knows the origin.'),
  },
  {
    num: '08',
    title: t('定时数据报表', 'Scheduled data reports'),
    desc: t('cron 触发查询、加工、成表、推送一条龙，执行历史落 SQLite，重启不丢、可回溯补跑。', 'Cron-driven query-transform-report-push pipeline; execution history persists in SQLite, resumable and replayable.'),
  },
])

const protoGroups = computed(() => [
  {
    label: t('触发源（统一入口 AgentService.process）', 'Triggers (single entry: AgentService.process)'),
    rows: [
      { subject: 'oryxos chat', desc: t('CLI Channel 命令行交互（人推）', 'CLI channel, interactive (human push)') },
      { subject: 'POST /api/v1/sessions/{id}/messages', desc: t('REST API 会话消息（人推）', 'REST API session message (human push)') },
      { subject: 'POST /api/v1/agents/{name}/invoke', desc: t('无状态调用一个 Agent', 'Stateless one-shot agent invocation') },
      { subject: 'schedules: cron', desc: t('AGENT.md 声明式定时任务（钟推）', 'Declarative cron in AGENT.md (clock push)') },
    ],
  },
  {
    label: t('内置 Tool（经白名单沙箱执行）', 'Built-in Tools (via whitelist sandbox)'),
    rows: [
      { subject: 'read_file / write_file / list_dir', desc: t('工作区内文件读写', 'File I/O within the workspace') },
      { subject: 'shell', desc: t('命令白名单内执行', 'Shell within command whitelist') },
      { subject: 'http_get / http_post', desc: t('域名白名单内 HTTP 请求', 'HTTP within domain whitelist') },
      { subject: 'save_memory / recall_memory', desc: t('长期记忆读写（MEMORY.md）', 'Long-term memory read/write (MEMORY.md)') },
      { subject: 'notify', desc: t('按名推送到通知渠道', 'Push to a named notify channel') },
    ],
  },
  {
    label: t('支撑设施（SQLite + 文件）', 'Infrastructure (SQLite + files)'),
    rows: [
      { subject: 'tool_invocations / llm_calls', desc: t('全链路审计表，day one 落库', 'Full-chain audit tables, persisted from day one') },
      { subject: 'MEMORY.md', desc: t('长期记忆文件（核心/归档两分区）', 'Long-term memory file (core + archive)') },
      { subject: 'mcp_servers.yaml', desc: t('MCP server 配置，stdio 优先', 'MCP server config, stdio first') },
      { subject: 'WhitelistSandbox', desc: t('文件路径 / Shell 命令 / HTTP 域名白名单', 'File path / shell command / HTTP domain whitelists') },
    ],
  },
])
</script>

<template>
  <div class="oryx-page">

    <!-- ── HERO ── -->
    <section class="oryx-hero">
      <div class="oryx-hero-inner">
        <div class="oryx-badge">
          <span class="oryx-badge-dot"></span>
          {{ t('企业级 Agent Harness OS · 私有部署 · 可审计', 'Enterprise Agent Harness OS · Private · Auditable') }}
        </div>

        <h1 class="oryx-title">
          <span class="oryx-title-name">OryxOS</span>
        </h1>

        <p class="oryx-title-sub">{{ t('装在企业自己服务器上的 Agent 操作系统', 'An Agent OS installed on your own servers') }}</p>

        <p class="oryx-hero-desc">
          {{ t('一个目录定义一个 Agent，一个底座运行一群 Agent。JDK 21 + Spring Boot 3.x 单 JAR 部署：Provider 路由、ReAct 引擎、长期记忆、工具沙箱、全链路审计全部内置，数据不出企业。', 'One directory defines an agent; one harness runs them all. A single JDK 21 + Spring Boot 3.x JAR ships provider routing, the ReAct engine, long-term memory, tool sandbox, and full-chain audit — your data never leaves your infrastructure.') }}
        </p>

        <div class="oryx-hero-actions">
          <a class="oryx-btn-primary" :href="t('/docs/what', '/en/docs/what')">
            {{ t('开始使用', 'Get Started') }} →
          </a>
          <a class="oryx-btn-ghost" :href="t('/docs/architecture', '/en/docs/architecture')">
            {{ t('系统架构', 'Architecture') }}
          </a>
          <a class="oryx-btn-ghost" href="https://github.com/oryx-labs/oryxos" target="_blank" rel="noopener">
            GitHub
          </a>
        </div>

        <div class="oryx-hero-note">
          {{ t('JDK 21 · Spring Boot 3.x · SQLite + MEMORY.md · MCP · Skill · Apache 2.0', 'JDK 21 · Spring Boot 3.x · SQLite + MEMORY.md · MCP · Skills · Apache 2.0') }}
        </div>
      </div>
    </section>

    <!-- ── PROBLEM ── -->
    <section class="oryx-section">
      <div class="oryx-section-inner">
        <div class="oryx-problem">
          <div class="oryx-problem-text">
            <h2 class="oryx-section-title">{{ t('企业为什么需要 Agent OS', 'Why an Agent OS') }}</h2>
            <p>{{ t('每个企业都有该交给 Agent 的活，但大部分 Agent 停在 demo，卡在同样的两个问题上。', 'Every company has work that belongs to agents, yet most stall at the demo stage on the same two problems.') }}</p>
            <p class="oryx-problem-item">
              <strong>{{ t('① 定义一个 Agent 为什么要写代码？', '① Why should defining an agent require code?') }}</strong>
              {{ t('业务方不该为了一个助手维护一套后端工程。', 'Business teams should not maintain a backend service for every assistant.') }}
            </p>
            <p class="oryx-problem-item">
              <strong>{{ t('② 数据和执行怎么放心？', '② How to trust data and execution?') }}</strong>
              {{ t('对话、记忆、工具调用必须留在企业内，且每一次执行可审计。', 'Conversations, memory, and tool calls must stay in-house, and every execution must be auditable.') }}
            </p>
            <p class="oryx-solution-line">{{ t('OryxOS 把这两件事做进底座，业务方只需要写一份 AGENT.md。', 'OryxOS builds both into the harness — business teams only write an AGENT.md.') }}</p>
          </div>
          <div class="oryx-problem-compare">
            <div class="oryx-compare-item oryx-compare-bad">
              <div class="oryx-compare-label">{{ t('今天的做法', 'Today') }}</div>
              <div class="oryx-compare-rows">
                <div class="oryx-compare-row">
                  <span class="oryx-compare-icon">✗</span>
                  <span>{{ t('每个团队自建 Agent 后端，重复造轮子', 'Every team builds its own agent backend') }}</span>
                </div>
                <div class="oryx-compare-row">
                  <span class="oryx-compare-icon">✗</span>
                  <span>{{ t('数据上云，合规与审计难落地', 'Data goes to the cloud; compliance and audit suffer') }}</span>
                </div>
                <div class="oryx-compare-row">
                  <span class="oryx-compare-icon">✗</span>
                  <span>{{ t('工具执行是黑盒，不敢放开权限', 'Tool execution is a black box — permissions stay locked down') }}</span>
                </div>
                <div class="oryx-compare-row">
                  <span class="oryx-compare-icon">✗</span>
                  <span>{{ t('跑一个容易，跑一群难', 'One agent is easy; a fleet is not') }}</span>
                </div>
              </div>
            </div>
            <div class="oryx-compare-item oryx-compare-good">
              <div class="oryx-compare-label">OryxOS</div>
              <div class="oryx-compare-rows">
                <div class="oryx-compare-row">
                  <span class="oryx-compare-icon oryx-icon-ok">✓</span>
                  <span>{{ t('一个目录 = 一个 Agent，零代码上线', 'One directory = one agent, zero code') }}</span>
                </div>
                <div class="oryx-compare-row">
                  <span class="oryx-compare-icon oryx-icon-ok">✓</span>
                  <span>{{ t('私有部署，数据不出企业', 'Private deployment, data never leaves') }}</span>
                </div>
                <div class="oryx-compare-row">
                  <span class="oryx-compare-icon oryx-icon-ok">✓</span>
                  <span>{{ t('全链路审计落库 + 白名单沙箱', 'Full-chain audit in SQLite + whitelist sandbox') }}</span>
                </div>
                <div class="oryx-compare-row">
                  <span class="oryx-compare-icon oryx-icon-ok">✓</span>
                  <span>{{ t('统一调度、渠道与治理，一群 Agent 一个底座', 'One harness for scheduling, channels, and governance') }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ── FLOW DIAGRAM ── -->
    <section class="oryx-section oryx-flow-section">
      <div class="oryx-section-inner">
        <img src="/flow.svg" alt="OryxOS architecture" class="oryx-flow-img" />
      </div>
    </section>

    <!-- ── CAPABILITIES ── -->
    <section class="oryx-section oryx-primitives-section">
      <div class="oryx-section-inner oryx-primitives-inner">
        <div class="oryx-section-header">
          <div class="oryx-section-tag">{{ t('五大核心能力', 'Five Core Capabilities') }}</div>
          <h2 class="oryx-section-title">{{ t('Provider · ReAct · Memory · Tool · Web Service', 'Provider · ReAct · Memory · Tool · Web Service') }}</h2>
        </div>
        <div class="oryx-primitives">
          <div v-for="p in capabilities" :key="p.title" class="oryx-primitive">
            <div class="oryx-primitive-header">
              <span class="oryx-primitive-icon">{{ p.icon }}</span>
              <div>
                <h3 class="oryx-primitive-title">{{ p.title }}</h3>
                <p class="oryx-primitive-subtitle">{{ p.subtitle }}</p>
              </div>
            </div>
            <pre class="oryx-code"><code>{{ p.code }}</code></pre>
          </div>
        </div>
      </div>
    </section>

    <!-- ── SCENARIOS ── -->
    <section class="oryx-section">
      <div class="oryx-section-inner">
        <div class="oryx-section-header">
          <div class="oryx-section-tag">{{ t('真实场景', 'Real Scenarios') }}</div>
          <h2 class="oryx-section-title">{{ t('八个真实使用场景', 'Eight real-world use cases') }}</h2>
        </div>
        <div class="oryx-scenarios">
          <div v-for="s in scenarios" :key="s.num" class="oryx-scenario">
            <div class="oryx-scenario-num">{{ s.num }}</div>
            <div>
              <h3 class="oryx-scenario-title">{{ s.title }}</h3>
              <p class="oryx-scenario-desc">{{ s.desc }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ── INTEGRATION ── -->
    <section class="oryx-section oryx-sdk-section">
      <div class="oryx-section-inner">
        <div class="oryx-section-header">
          <div class="oryx-section-tag">{{ t('接入方式', 'Integration') }}</div>
          <h2 class="oryx-section-title">{{ t('三档接入，按需选择', 'Three tiers — pick what fits') }}</h2>
        </div>
        <div class="oryx-sdk-cards">
          <div class="oryx-sdk-card">
            <div class="oryx-sdk-card-icon">🔌</div>
            <h3 class="oryx-sdk-card-title">{{ t('零代码：目录 + MCP', 'Zero-code: directory + MCP') }}</h3>
            <p class="oryx-sdk-card-desc">{{ t('写一份 AGENT.md 即定义 Agent，外部能力挂 MCP server，业务方全程不碰 Java。主推方式。', 'Write an AGENT.md to define an agent; attach external capabilities as MCP servers. No Java required — the recommended path.') }}</p>
            <div class="oryx-langs">
              <span v-for="l in ['AGENT.md', 'SKILL.md', 'MCP', 'Notify']" :key="l" class="oryx-lang">{{ l }}</span>
            </div>
          </div>
          <div class="oryx-sdk-card oryx-sdk-card-featured">
            <div class="oryx-sdk-card-icon">📦</div>
            <h3 class="oryx-sdk-card-title">{{ t('CLI & REST API', 'CLI & REST API') }}</h3>
            <p class="oryx-sdk-card-desc">{{ t('单 JAR 部署，CLI 交互对话，REST API 暴露全部能力，任何语言都能 HTTP 接入。', 'Single-JAR deployment; interactive CLI; full REST API for HTTP access from any language.') }}</p>
            <div class="oryx-sdk-installs">
              <code>mvn clean package</code>
              <code>java -jar oryxos-boot/target/*.jar init</code>
              <code>java -jar oryxos-boot/target/*.jar chat</code>
              <code>java -jar oryxos-boot/target/*.jar serve</code>
            </div>
          </div>
          <div class="oryx-sdk-card">
            <div class="oryx-sdk-card-icon">🤖</div>
            <h3 class="oryx-sdk-card-title">{{ t('IM 渠道集成', 'IM Channel Integration') }}</h3>
            <p class="oryx-sdk-card-desc">{{ t('飞书、企微、钉钉长连接入站对话；出站通知走 notify_channels 全局注册表，Agent 正文按名引用。', 'Inbound conversations over Feishu/WeCom/DingTalk long connections; outbound via the notify_channels registry, referenced by name.') }}</p>
            <div class="oryx-sdk-badges">
              <span class="oryx-sdk-badge">飞书</span>
              <span class="oryx-sdk-badge">企业微信</span>
              <span class="oryx-sdk-badge">钉钉</span>
              <span class="oryx-sdk-badge">Webhook</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ── PROTOCOL / REFERENCE ── -->
    <section class="oryx-section">
      <div class="oryx-section-inner">
        <div class="oryx-section-header">
          <div class="oryx-section-tag">{{ t('接口总览', 'Interface Reference') }}</div>
          <h2 class="oryx-section-title">{{ t('统一入口与内置能力', 'Single Entry & Built-in Capabilities') }}</h2>
          <p class="oryx-section-desc">{{ t('三个触发源汇入同一 AgentService 链路，ReAct 循环不感知消息来源；所有工具调用经白名单沙箱并落审计表。', 'All triggers converge on one AgentService pipeline — the ReAct loop never knows the origin; every tool call passes the sandbox and lands in the audit tables.') }}</p>
        </div>
        <div class="oryx-proto-grid">
          <div v-for="g in protoGroups" :key="g.label" class="oryx-proto-group">
            <div class="oryx-proto-group-label">{{ g.label }}</div>
            <div v-for="r in g.rows" :key="r.subject" class="oryx-proto-row">
              <code class="oryx-proto-subject">{{ r.subject }}</code>
              <span class="oryx-proto-desc">{{ r.desc }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ── CTA ── -->
    <section class="oryx-section oryx-cta-section">
      <div class="oryx-section-inner">
        <div class="oryx-cta">
          <h2 class="oryx-cta-title">{{ t('开始构建', 'Start Building') }}</h2>
          <p class="oryx-cta-desc">{{ t('五分钟在本地跑起第一个 Agent。', 'Run your first agent locally in five minutes.') }}</p>
          <pre class="oryx-code oryx-cta-code"><code>git clone https://github.com/oryx-labs/oryxos.git
cd oryxos &amp;&amp; mvn clean package

# 初始化 .oryxos/ 工作区（幂等）
java -jar oryxos-boot/target/*.jar init

# 配置任一 OpenAI 兼容模型的 Key
export DEEPSEEK_API_KEY=sk-xxx

# CLI 对话 / 启动 REST API
java -jar oryxos-boot/target/*.jar chat
java -jar oryxos-boot/target/*.jar serve   # :8080</code></pre>
          <div class="oryx-cta-links">
            <a class="oryx-btn-primary" :href="t('/docs/', '/en/docs/')">{{ t('查看文档', 'Read the Docs') }}</a>
            <a class="oryx-btn-ghost" href="https://github.com/oryx-labs/oryxos" target="_blank" rel="noopener">GitHub</a>
          </div>
        </div>
      </div>
    </section>

  </div>
</template>

<style scoped>
.oryx-page {
  min-height: 100vh;
  background: #ffffff;
  color: #000000;
  font-family: inherit;
}

/* ── Hero ── */
.oryx-hero {
  position: relative;
  padding: 100px 24px 80px;
  text-align: center;
  overflow: hidden;
}
.oryx-hero-inner {
  position: relative;
  max-width: 760px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.oryx-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 16px;
  border-radius: 20px;
  border: 1px solid #d4d4d4;
  background: #f5f5f5;
  color: #555555;
  font-size: 12px;
  margin-bottom: 28px;
}
.oryx-badge-dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: #000000;
  animation: pulse 2s infinite;
}
@keyframes pulse {
  0%,100% { opacity:1; transform:scale(1); }
  50% { opacity:0.4; transform:scale(1.4); }
}
.oryx-title {
  margin: 0 0 12px;
  line-height: 1;
}
.oryx-title-name {
  font-size: clamp(72px, 14vw, 120px);
  font-weight: 900;
  letter-spacing: -0.03em;
  color: #000000;
}
.oryx-title-sub {
  font-size: 18px;
  color: #666666;
  margin: 0 0 20px;
}
.oryx-hero-desc {
  font-size: 16px;
  line-height: 1.7;
  color: #444444;
  max-width: 640px;
  margin: 0 0 32px;
}
.oryx-hero-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: center;
  margin-bottom: 20px;
}
.oryx-btn-primary {
  padding: 11px 28px;
  border-radius: 8px;
  background: #000000;
  color: #ffffff;
  font-weight: 600;
  font-size: 14px;
  text-decoration: none;
  transition: opacity 0.2s, transform 0.15s;
}
.oryx-btn-primary:hover { opacity: 0.75; transform: translateY(-1px); }
.oryx-btn-ghost {
  padding: 11px 28px;
  border-radius: 8px;
  border: 1px solid #d4d4d4;
  color: #333333;
  font-weight: 600;
  font-size: 14px;
  text-decoration: none;
  transition: border-color 0.2s, background 0.2s;
}
.oryx-btn-ghost:hover { border-color: #000000; background: #f5f5f5; }
.oryx-hero-note {
  font-size: 12px;
  color: #999999;
}

/* ── Section ── */
.oryx-section { padding: 72px 24px; }
.oryx-section-inner { max-width: 1000px; margin: 0 auto; }
.oryx-primitives-inner { max-width: 1400px; }
.oryx-section-header { text-align: center; margin-bottom: 48px; }
.oryx-section-tag {
  display: inline-block;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #555555;
  padding: 4px 12px;
  border-radius: 20px;
  border: 1px solid #d4d4d4;
  background: #f5f5f5;
  margin-bottom: 14px;
}
.oryx-section-title {
  font-size: clamp(22px, 4vw, 32px);
  font-weight: 700;
  color: #000000;
  margin: 0 0 12px;
}
.oryx-section-desc {
  font-size: 15px;
  color: #666666;
  max-width: 680px;
  margin: 0 auto;
  line-height: 1.6;
}

/* ── Problem ── */
.oryx-problem {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 48px;
  align-items: start;
}
.oryx-problem-text p { color: #666666; line-height: 1.7; margin: 0 0 14px; font-size: 15px; }
.oryx-problem-item strong { color: #000000; display: block; margin-bottom: 4px; }
.oryx-solution-line { color: #000000 !important; font-weight: 600; }
.oryx-problem-compare { display: flex; flex-direction: column; gap: 16px; }
.oryx-compare-item {
  padding: 20px;
  border-radius: 12px;
  border: 1px solid #e5e5e5;
}
.oryx-compare-bad { background: #fafafa; }
.oryx-compare-good { background: #f5f5f5; border-color: #d4d4d4; }
.oryx-compare-label { font-size: 11px; font-weight: 700; color: #999999; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.08em; }
.oryx-compare-rows { display: flex; flex-direction: column; gap: 8px; }
.oryx-compare-row { display: flex; align-items: flex-start; gap: 10px; font-size: 13px; color: #555555; line-height: 1.5; }
.oryx-compare-icon { flex-shrink: 0; font-style: normal; color: #bbbbbb; font-weight: 700; width: 14px; }
.oryx-icon-ok { color: #000000; }

/* ── Primitives ── */
.oryx-primitives-section { background: #f5f5f5; }
.oryx-primitives { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); grid-auto-rows: 1fr; gap: 16px; }
.oryx-primitive {
  padding: 20px;
  border-radius: 14px;
  border: 1px solid #e5e5e5;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: border-color 0.2s, box-shadow 0.2s;
  min-width: 0;
  overflow: hidden;
}
.oryx-primitive .oryx-code { flex: 1; }
.oryx-primitive:hover { border-color: #000000; box-shadow: 0 4px 16px rgba(0,0,0,0.06); }
.oryx-primitive-header { display: flex; align-items: flex-start; gap: 12px; }
.oryx-primitive-icon { font-size: 28px; flex-shrink: 0; }
.oryx-primitive-title { font-size: 17px; font-weight: 700; color: #000000; margin: 0 0 2px; }
.oryx-primitive-subtitle { font-size: 12px; color: #999999; margin: 0; }
.oryx-code {
  background: #f5f5f5;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  padding: 14px 16px;
  font-size: 12px;
  line-height: 1.6;
  color: #333333;
  overflow-x: auto;
  margin: 0;
  white-space: pre;
}
.oryx-code code { font-family: 'JetBrains Mono', 'Fira Code', monospace; background: none; color: inherit; }

/* ── Scenarios ── */
.oryx-scenarios { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
.oryx-scenario {
  display: flex;
  gap: 16px;
  padding: 20px;
  border-radius: 12px;
  border: 1px solid #e5e5e5;
  background: #fafafa;
}
.oryx-scenario-num {
  font-size: 28px;
  font-weight: 900;
  color: #e5e5e5;
  line-height: 1;
  flex-shrink: 0;
  font-variant-numeric: tabular-nums;
}
.oryx-scenario-title { font-size: 15px; font-weight: 600; color: #000000; margin: 0 0 6px; }
.oryx-scenario-desc { font-size: 13px; color: #666666; line-height: 1.6; margin: 0; }

/* ── SDK ── */
.oryx-sdk-section { background: #f5f5f5; }
.oryx-sdk-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}
.oryx-sdk-card {
  background: #ffffff;
  border: 1px solid #e5e5e5;
  border-radius: 16px;
  padding: 28px 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.oryx-sdk-card-featured { border-color: #000000; }
.oryx-sdk-card-icon { font-size: 28px; }
.oryx-sdk-card-title { font-size: 17px; font-weight: 700; color: #000000; margin: 0; }
.oryx-sdk-card-desc { font-size: 14px; color: #666666; line-height: 1.6; margin: 0; flex: 1; }
.oryx-langs { display: flex; flex-wrap: wrap; gap: 8px; }
.oryx-lang {
  padding: 4px 12px;
  border-radius: 20px;
  border: 1px solid #d4d4d4;
  background: #f5f5f5;
  color: #333333;
  font-size: 12px;
  font-weight: 600;
}
.oryx-sdk-installs { display: flex; flex-direction: column; gap: 6px; }
.oryx-sdk-installs code {
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 12px;
  background: #f5f5f5;
  border: 1px solid #e5e5e5;
  border-radius: 6px;
  padding: 5px 10px;
  color: #000000;
  display: block;
}
.oryx-sdk-badges { display: flex; flex-wrap: wrap; gap: 8px; }
.oryx-sdk-badge {
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 700;
  background: #f0f0f0;
  border: 1px solid #d4d4d4;
  color: #333333;
}

/* ── Reference grid ── */
.oryx-proto-grid { display: flex; flex-direction: column; gap: 28px; }
.oryx-proto-group { display: flex; flex-direction: column; gap: 6px; }
.oryx-proto-group-label {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #555555;
  margin-bottom: 4px;
}
.oryx-proto-row {
  display: flex;
  align-items: baseline;
  gap: 16px;
  padding: 8px 14px;
  border-radius: 8px;
  background: #fafafa;
  border: 1px solid #e5e5e5;
  flex-wrap: wrap;
}
.oryx-proto-subject {
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 12px;
  color: #000000;
  background: #f0f0f0;
  border: 1px solid #d4d4d4;
  padding: 2px 8px;
  border-radius: 4px;
  flex-shrink: 0;
  white-space: nowrap;
}
.oryx-proto-desc { font-size: 13px; color: #666666; flex: 1; }

/* ── CTA ── */
.oryx-cta-section { background: #f5f5f5; }
.oryx-cta { text-align: center; max-width: 680px; margin: 0 auto; }
.oryx-cta-title { font-size: 28px; font-weight: 700; color: #000000; margin: 0 0 12px; }
.oryx-cta-desc { font-size: 15px; color: #666666; margin: 0 0 24px; }
.oryx-cta-code { text-align: left; margin-bottom: 28px; }
.oryx-cta-links { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }

/* ── Flow diagram ── */
.oryx-flow-section { padding: 0 24px 72px; }
.oryx-flow-img {
  width: 100%;
  display: block;
  border: 1px solid #e5e5e5;
  border-radius: 12px;
}

/* ── Responsive ── */
@media (max-width: 900px) {
  .oryx-sdk-cards { grid-template-columns: 1fr; }
}
@media (max-width: 768px) {
  .oryx-hero { padding: 72px 20px 60px; }
  .oryx-problem { grid-template-columns: 1fr; }
  .oryx-primitives { grid-template-columns: 1fr; }
  .oryx-scenarios { grid-template-columns: 1fr; }
  .oryx-section { padding: 48px 20px; }
}
</style>
