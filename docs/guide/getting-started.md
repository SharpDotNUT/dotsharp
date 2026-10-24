# 快速开始

## 环境

- Vue `^3.5.0`
- 支持 ESM 的构建工具（Vite、Rollup、webpack 等）
- 不需要安装 Tailwind CSS，也不需要额外的样式配置

## 安装

```bash
pnpm add @sharpdotnut/dotsharp
```

## 引入样式

组件样式与主题变量在同一个样式表里，在应用入口引入一次：

```ts
import "@sharpdotnut/dotsharp/style.css";
```

这个样式表由 Tailwind CSS 4 编译：只包含组件实际用到的工具类，且不含 preflight，不会重置应用自身的
页面样式。

## 使用组件

```vue
<script setup lang="ts">
import { Button } from "@sharpdotnut/dotsharp";
</script>

<template>
  <Button>保存</Button>
</template>
```

组件只使用 `--ds-*` 主题令牌，因此引入样式后即可在明暗两种主题下正确显示。

## 主题

`useTheme()` 管理 `system` / `light` / `dark` 三种模式，并把解析结果写到 `<html data-theme="light|dark">`：

```ts
import { useTheme } from "@sharpdotnut/dotsharp";

const { theme, resolvedTheme, setTheme } = useTheme();

setTheme("dark");
```

首屏主题可以在页面 `<head>` 中提前设置，避免闪烁；完整说明见[主题](/guide/theme)。

## 下一步

- [简介](/guide/intro)：库的定位与约定。
- [统一范式](/guide/patterns)：`Tabs` / `Tab` 这类子项组件的组合方式。
- [组件](/components/button)：浏览全部组件。
