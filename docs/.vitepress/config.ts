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
      { text: "指南", link: "/guide/theme" },
      { text: "组件", link: "/components/button" },
    ],

    sidebar: [
      {
        text: "指南",
        items: [{ text: "主题", link: "/guide/theme" }],
      },
      {
        text: "组件",
        items: [
          { text: "Button 按钮", link: "/components/button" },
          { text: "Input 输入框", link: "/components/input" },
        ],
      },
    ],

    outline: {
      label: "本页目录",
    },
  },
});
