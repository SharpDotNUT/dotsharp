# 简介

dotsharp 是一个面向 Vue 3 的组件库：组件用 SFC 与 `<script setup>` 编写，以 ESM 形式发布，
样式与组件分离，明暗主题开箱即用。

## 设计取向

- **一个源色生成整套主题**：源色经 HCT 色空间生成 primary / secondary / neutral / neutral-variant / error
  五条色调梯，每个 `--ds-*` 令牌取固定明度。换色时色相关系与对比度保持不变，组件只消费令牌，不写死颜色。
- **属性描述简单内容，插槽承载复杂内容**：纯文本用 `label` / `title` 这类属性，图标用 `icon` 属性；需要链接、
  标记或任意结构时改用同名插槽。插槽优先于属性，两种写法不会同时渲染。
- **组件即源码**：每个组件的文档、实时演示与代码片段都写在该组件目录的 `README.md` 中，文档站点直接引入
  同一份文件，演示与实现不会脱节。
- **样式可预测**：`style.css` 由 Tailwind CSS 4 编译，只包含组件用到的工具类，不含 preflight，不会重置
  应用自身的页面样式；使用方不需要安装 Tailwind，也不需要配置 `@source`。
- **可访问性优先**：交互元素使用原生 `button` / `input` / `nav`，状态通过 ARIA 属性表达，浮层处理焦点陷阱、
  Escape 关闭与焦点恢复。

## 包内容

| 入口                              | 内容                                     |
| --------------------------------- | ---------------------------------------- |
| `@sharpdotnut/dotsharp`           | 组件、`useTheme`、`useI18n` 与 `vRipple` |
| `@sharpdotnut/dotsharp/style.css` | 编译后的组件样式与主题变量               |

## 基本约定

- 只提供 ESM 产物，`vue` 是 peer dependency（`^3.5.0`），由应用安装。
- 图标数据由使用方按需引入，再交给 `Icon` 或组件的 `icon` 属性；库本身不内置图标集合，详见[图标](/guide/icons)。
- 由「父组件 + 一组子项」构成的组件（`Tabs` / `Tab`、`NavigationBar` / `NavigationItem` 等）遵循
  同一套[父子组件以及插槽统一范式](/guide/patterns)。
- 点按反馈与阴影层级分别由 [Ripple](/guide/ripple) 与[层级](/guide/elevation)两套公共能力提供。

## 下一步

- [快速开始](/guide/getting-started)：安装、引入样式与主题。
- [父子组件以及插槽统一范式](/guide/patterns)：子项组件的组合方式，以及属性与插槽的取舍。
- [图标](/guide/icons)：选择图标集并按需引入。
- [组件](/components/button)：从 `Button` 开始浏览。
