import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vitepress";
import llmstxt from "vitepress-plugin-llms";

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
    plugins: [tailwindcss(), llmstxt()],
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

    socialLinks: [{ icon: "github", link: "https://github.com/SharpDotNUT/dotsharp" }],

    sidebar: [
      {
        text: "指南",
        items: [
          { text: "简介", link: "/guide/intro" },
          { text: "快速开始", link: "/guide/getting-started" },
          { text: "父子组件以及插槽统一范式", link: "/guide/patterns" },
          { text: "表单", link: "/guide/form" },
          { text: "图标", link: "/guide/icons" },
          { text: "主题", link: "/guide/theme" },
          { text: "国际化", link: "/guide/i18n" },
        ],
      },
      {
        text: "效果",
        items: [
          { text: "涟漪 Ripple", link: "/guide/ripple" },
          { text: "层级 Elevation", link: "/guide/elevation" },
        ],
      },
      {
        text: "基础",
        items: [
          { text: "Button 按钮", link: "/components/button" },
          { text: "ButtonGroup 按钮组", link: "/components/button-group" },
          { text: "SplitButton 分裂按钮", link: "/components/split-button" },
          { text: "Fab 悬浮操作按钮", link: "/components/fab" },
          { text: "IconButton 图标按钮", link: "/components/icon-button" },
          { text: "Icon 图标", link: "/components/icon" },
        ],
      },
      {
        text: "输入与选择",
        items: [
          { text: "Form 表单", link: "/components/form" },
          { text: "Input 文本框", link: "/components/input" },
          { text: "OptInputs 分组输入框", link: "/components/opt-inputs" },
          { text: "DateInput 日期输入框", link: "/components/date-input" },
          { text: "DatePicker 日期选择器", link: "/components/date-picker" },
          { text: "TimeInput 时间输入框", link: "/components/time-input" },
          { text: "TimePicker 时间选择器", link: "/components/time-picker" },
          { text: "Select 选择器", link: "/components/select" },
          { text: "Checkbox 复选框", link: "/components/checkbox" },
          { text: "Radio 单选按钮", link: "/components/radio" },
          { text: "Switch 开关", link: "/components/switch" },
          { text: "SegmentedButtons 分段按钮", link: "/components/segmented-buttons" },
          { text: "Chip 纸片", link: "/components/chip" },
          { text: "Slider 滑块", link: "/components/slider" },
          { text: "Uploader 上传", link: "/components/uploader" },
        ],
      },
      {
        text: "布局与展示",
        items: [
          { text: "Container 容器", link: "/components/container" },
          { text: "Card 卡片", link: "/components/card" },
          { text: "Divider 分隔线", link: "/components/divider" },
          { text: "List 列表", link: "/components/list" },
          { text: "Badge 徽标", link: "/components/badge" },
          { text: "Menu 菜单", link: "/components/menu" },
          { text: "ContextMenu 上下文菜单", link: "/components/context-menu" },
        ],
      },
      {
        text: "反馈",
        items: [
          { text: "Tooltip 工具提示", link: "/components/tooltip" },
          { text: "Progress 进度条", link: "/components/progress" },
          { text: "Dialog 对话框", link: "/components/dialog" },
          { text: "Snackbar 消息条", link: "/components/snackbar" },
        ],
      },
      {
        text: "导航",
        items: [
          { text: "AppBar 顶部应用栏", link: "/components/app-bar" },
          { text: "Tabs 标签页", link: "/components/tabs" },
          { text: "NavigationBar 导航栏", link: "/components/navigation-bar" },
          { text: "NavigationRail 侧边导航栏", link: "/components/navigation-rail" },
          { text: "NavigationDrawer 导航抽屉", link: "/components/navigation-drawer" },
        ],
      },
    ],

    outline: {
      label: "本页目录",
    },
  },
});
