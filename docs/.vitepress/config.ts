import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vitepress";

const repoRoot = fileURLToPath(new URL("../..", import.meta.url));

export default defineConfig({
  lang: "zh-CN",
  title: "dotsharp",
  description: "dotsharp——适用于 Vue 3 的轻量组件库，内置明暗主题切换。",
  appearance: false,

  head: [
    ["link", { rel: "preconnect", href: "https://fonts-cdn.sharpdotnut.com", crossorigin: "" }],
    ["link", { rel: "stylesheet", href: "https://fonts-cdn.sharpdotnut.com/Inter/Inter.css" }],
    [
      "link",
      {
        rel: "stylesheet",
        href: "https://fonts-cdn.sharpdotnut.com/SourceHanSansCN/SourceHanSansCN.css",
      },
    ],
    [
      "script",
      {},
      `(() => {
  try {
    const stored = localStorage.getItem('dotsharp-theme')
    const dark =
      stored === 'dark' ||
      (stored !== 'light' && matchMedia('(prefers-color-scheme: dark)').matches)
    document.documentElement.dataset.theme = dark ? 'dark' : 'light'
    document.documentElement.classList.toggle('dark', dark)
  } catch {}
})()`,
    ],
  ],

  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: [
        {
          find: /^@sharpdotnut\/dotsharp$/,
          replacement: fileURLToPath(
            new URL("../../packages/dotsharp/src/index.ts", import.meta.url),
          ),
        },
        {
          find: /^@sharpdotnut\/dotsharp\/style\.css$/,
          replacement: fileURLToPath(
            new URL("../../packages/dotsharp/src/styles/index.css", import.meta.url),
          ),
        },
      ],
    },
    server: {
      fs: {
        allow: [repoRoot],
      },
    },
  },

  themeConfig: {
    nav: [
      { text: "指南", link: "/guide/intro" },
      { text: "组件", link: "/components/button" },
    ],

    sidebar: [
      {
        text: "指南",
        items: [
          { text: "简介", link: "/guide/intro" },
          { text: "快速开始", link: "/guide/getting-started" },
          { text: "统一范式", link: "/guide/patterns" },
          { text: "主题", link: "/guide/theme" },
        ],
      },
      {
        text: "组件",
        items: [
          { text: "Button 按钮", link: "/components/button" },
          { text: "Dialog 对话框", link: "/components/dialog" },
          { text: "Icon 图标", link: "/components/icon" },
          { text: "IconButton 图标按钮", link: "/components/icon-button" },
          { text: "Input 文本框", link: "/components/input" },
          { text: "Select 选择器", link: "/components/select" },
          { text: "Slider 滑块", link: "/components/slider" },
          { text: "Tabs 标签页", link: "/components/tabs" },
        ],
      },
      {
        text: "导航组件",
        items: [
          { text: "AppBar 顶部应用栏", link: "/components/app-bar" },
          { text: "NavigationBar 导航栏", link: "/components/navigation-bar" },
          { text: "NavigationDrawer 导航抽屉", link: "/components/navigation-drawer" },
          { text: "NavigationRail 侧边导航栏", link: "/components/navigation-rail" },
        ],
      },
    ],

    outline: {
      label: "本页目录",
    },
  },
});
