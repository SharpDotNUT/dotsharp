# 简介

dotsharp 是一个面向 Vue 3 的轻量组件库：组件用 SFC 与 `<script setup>` 编写，以 ESM 形式发布，
样式与组件分离，明暗主题开箱即用。

## 特点

- **组件即源码**：每个组件的文档、实时演示与代码片段都写在该组件目录的 `README.md` 中，文档站点直接引入
  同一份文件，演示与实现不会脱节。
- **主题**：颜色由 HSL 锚点组合成 `--ds-*` 令牌，`useTheme()` 支持 `system` / `light` / `dark` 三种模式，
  只写 `<html data-theme>`，不绑定任何文档框架。
- **样式可预测**：`style.css` 由 Tailwind CSS 4 编译，只包含组件用到的工具类，不含 preflight，不会重置
  应用自身的页面样式；使用方不需要安装 Tailwind，也不需要配置 `@source`。
- **可访问性优先**：交互元素使用原生 `button` / `input` / `nav`，状态通过 ARIA 属性表达，浮层处理焦点陷阱、
  Escape 关闭与焦点恢复。

## 包内容

| 入口                              | 内容                       |
| --------------------------------- | -------------------------- |
| `@sharpdotnut/dotsharp`           | 组件与 `useTheme`          |
| `@sharpdotnut/dotsharp/style.css` | 编译后的组件样式与主题变量 |

## 基本约定

- 只提供 ESM 产物，`vue` 是 peer dependency（`^3.5.0`），由应用安装。
- 图标通过 `Icon` 渲染，图标数据由使用方按需引入，库本身不内置图标集合。
- 由「父组件 + 一组子项」构成的组件（`Tabs` / `Tab`、`NavigationBar` / `NavigationItem` 等）遵循
  同一套[统一范式](/guide/patterns)。

## 下一步

- [快速开始](/guide/getting-started)：安装、引入样式与主题。
- [统一范式](/guide/patterns)：子项组件的组合方式。
- [组件](/components/button)：从 `Button` 开始浏览。
