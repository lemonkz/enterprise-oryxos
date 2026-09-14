import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'OryxOS',
  titleTemplate: ':title — OryxOS',
  description: '企业级 Agent Harness OS：一个目录定义一个 Agent，一个底座运行一群 Agent。Java 原生 · 私有部署 · 可审计。',
  base: '/',
  cleanUrls: true,
  appearance: 'force-light',

  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.googleapis.com' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' }],
    ['link', { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@700&display=swap' }],
    ['meta', { name: 'author', content: 'oryx-labs' }],
    ['meta', { name: 'keywords', content: 'OryxOS, Agent OS, Agent Harness, 企业级 Agent, 私有部署, 可审计, Java, Spring Boot, MCP, ReAct, AGENT.md' }],
    ['meta', { name: 'robots', content: 'index, follow' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:site_name', content: 'OryxOS' }],
    ['meta', { property: 'og:title', content: 'OryxOS — 企业级 Agent Harness OS' }],
    ['meta', { property: 'og:description', content: '一个目录定义一个 Agent，一个底座运行一群 Agent。Java 原生 · 私有部署 · 可审计。' }],
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { name: 'twitter:title', content: 'OryxOS — 企业级 Agent Harness OS' }],
    ['meta', { name: 'twitter:description', content: '一个目录定义一个 Agent，一个底座运行一群 Agent。Java 原生 · 私有部署 · 可审计。' }],
  ],

  locales: {
    root: {
      label: '中文',
      lang: 'zh-CN',
      themeConfig: {
        nav: [
          { text: '首页', link: '/' },
          { text: '文档', link: '/docs/what' },
          { text: 'GitHub', link: 'https://github.com/oryx-labs/oryxos' },
        ],
        sidebar: {
          '/docs/': [
            {
              text: '快速入门',
              items: [
                { text: 'OryxOS 是什么', link: '/docs/what' },
                { text: '快速开始', link: '/docs/quick-start' },
              ],
            },
            {
              text: '深入了解',
              items: [
                { text: '系统架构', link: '/docs/architecture' },
                { text: '路线图', link: '/docs/roadmap' },
              ],
            },
          ],
        },
      },
    },
    en: {
      label: 'English',
      lang: 'en-US',
      link: '/en/',
      themeConfig: {
        nav: [
          { text: 'Home', link: '/en/' },
          { text: 'Docs', link: '/en/docs/what' },
          { text: 'GitHub', link: 'https://github.com/oryx-labs/oryxos' },
        ],
        sidebar: {
          '/en/docs/': [
            {
              text: 'Getting Started',
              items: [
                { text: 'What is OryxOS', link: '/en/docs/what' },
                { text: 'Quick Start', link: '/en/docs/quick-start' },
              ],
            },
            {
              text: 'Deep Dives',
              items: [
                { text: 'Architecture', link: '/en/docs/architecture' },
                { text: 'Roadmap', link: '/en/docs/roadmap' },
              ],
            },
          ],
        },
      },
    },
  },

  themeConfig: {
    siteTitle: false,
    logo: '/logo.svg',
    socialLinks: [
      { icon: 'github', link: 'https://github.com/oryx-labs/oryxos' },
    ],
  },
})
