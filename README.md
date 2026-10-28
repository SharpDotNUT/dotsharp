# dotsharp

面向 Vue 3 的组件库：一个源色生成整套配色，明暗主题即时切换，组件文档与示例共用同一份源码。

文档：<https://dotsharp.sharpdotnut.com/> · 仓库：<https://github.com/SharpDotNUT/dotsharp>

- **一个源色，整套主题**：明暗两套 `--ds-*` 令牌都由单个源色经 Material 3 色调映射生成，`setSourceColor()` 即可整体换色。
- **组件只吃令牌**：组件里不出现写死的颜色、圆角与字体，换主题不会漏掉某一块。
- **属性与插槽两用**：纯文本、图标交给属性，富内容交给同名插槽；插槽优先，简单场景保持简短。
- **文档即源码**：每个组件的说明、实时演示与代码片段都在 `src/components/<name>/README.md`，文档站直接引入同一份文件。

## 安装

```bash
pnpm add @sharpdotnut/dotsharp
```

需要 Vue `^3.5.0` 与支持 ESM 的构建工具（Vite、Rollup、webpack 等）。样式表已由 Tailwind CSS 4 预编译，
**不需要安装 Tailwind，也不需要任何样式配置**。

## 使用

```ts
// 入口引入一次：组件样式 + 主题变量
import "@sharpdotnut/dotsharp/style.css";
```

```vue
<script setup lang="ts">
import { Button } from "@sharpdotnut/dotsharp";
</script>

<template>
  <Button>保存</Button>
</template>
```

样式表不含 preflight，不会重置应用自身的页面样式。

## 主题

`useTheme()` 管理 `system` / `light` / `dark` 三种模式，把解析结果写到 `<html data-theme="light|dark">`：

```ts
import { useTheme } from "@sharpdotnut/dotsharp";

const { theme, resolvedTheme, sourceColor, setTheme, setSourceColor } = useTheme();

setTheme("dark");
setSourceColor("#a855f7"); // 整套明暗配色随之重建
```

## 组件

| 分类       | 组件                                                                                                                                                                                                                                          |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 基础       | `Button` `ButtonGroup` `ButtonGroupItem` `SplitButton` `Fab` `FabMenu` `IconButton` `Icon`                                                                                                                                                    |
| 输入与选择 | `Form` `FormItem` `Input` `OptInputs` `DateInput` `DatePicker` `TimeInput` `TimePicker` `Select` `Option` `Checkbox` `Radio` `RadioGroup` `Switch` `SegmentedButtons` `SegmentedButton` `Chip` `Slider` `RangeSlider` `Uploader` `UploadArea` |
| 布局与展示 | `Container` `Card` `Divider` `List` `ListItem` `Badge` `Menu` `MenuItem` `ContextMenu`                                                                                                                                                        |
| 反馈       | `Tooltip` `Progress` `Dialog` `Snackbar`                                                                                                                                                                                                      |
| 导航       | `AppBar` `Tabs` `Tab` `NavigationBar` `NavigationItem` `NavigationRail` `NavigationRailItem` `NavigationDrawer` `NavigationDrawerItem` `NavigationDrawerHeading` `NavigationDrawerDivider`                                                    |

子项组件（`Tabs` + `Tab`、`Select` + `Option`、`Menu` + `MenuItem` …）遵循同一套范式：选中值由父组件持有，
子项用 `label` / `icon` 属性或同名插槽描述内容，标识取 `value`，省略时用声明顺序索引。

除组件外还导出：

- `useTheme()`：主题与源色。
- `setLocale()` / `registerLocale()` / `matchLocale()` / `useI18n()`：文案语言。
- `vRipple`：Material 3 涟漪指令。
- `showSnackbar()` / `closeAllSnackbars()`：命令式消息条。

## 本地开发

仓库是 pnpm workspace：`packages/dotsharp` 是组件库，`docs` 是 VitePress 文档站。

```bash
pnpm install       # 安装全部 workspace 依赖
pnpm dev           # 文档站开发服务器
pnpm build         # build:lib + build:docs
pnpm typecheck     # 两个包的 vue-tsc
pnpm test          # 单元测试（happy-dom）
pnpm check         # Oxfmt 格式 + oxlint（含类型感知）
pnpm exec vp check --fix   # 自动修复格式与可自动修复的 lint
```

单包执行：`pnpm --filter @sharpdotnut/dotsharp <script>`、`pnpm --filter @dotsharp/docs <script>`。

## 目录

```
packages/dotsharp/
  src/index.ts                 # 唯一公共入口：组件、组合式函数、指令、i18n
  src/styles/index.css         # Tailwind 入口：生成的默认令牌 + @theme 映射
  src/theme/palette.ts         # 源色 → Material 3 色调 → --ds-* 令牌
  src/components/<name>/
    <Name>.vue                 # 组件实现（Tailwind 工具类 + --ds-* 令牌）
    README.md                  # 该组件的整页文档：演示 + 代码片段
docs/                          # VitePress 文档站，components/*.md 只 @include 组件 README
references/material-web/       # git submodule，仅作行为参考，不参与构建
```

新增组件：实现 SFC → 写同目录 `README.md` → 在 `src/index.ts` 导出 → 加 `docs/components/<name>.md`
包装与侧边栏条目。细节见 [AGENTS.md](./AGENTS.md)。

## 参考

交互行为、DOM 结构与 ARIA 用法参考 [material-components/material-web](https://github.com/material-components/material-web)，
但所有组件均为本库独立实现，不依赖其代码或包。
