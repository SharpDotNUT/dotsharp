# 更新日志

本文件记录 `@sharpdotnut/dotsharp` 的版本变更，格式参考 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)，版本号遵循[语义化版本](https://semver.org/lang/zh-CN/)。

## [Unreleased]

## [1.3.0] - 2026-11-13

### 新增

- `NavigationRail`：新增 `collapsed-label`（默认 `true`）。设为 `false` 时折叠态只显示图标：行高按内容取 48px，高亮胶囊与行同高、上下不留边距，展开时贴到 rail 左边缘并把左角改成直角；折叠态胶囊保留左右圆角。
- `NavigationRail`：新增 `expand-on-hover`。指针进入 rail 即以覆盖布局展开、移出收起；隐含 `expandable`，展开是内部临时状态、不写回 `v-model:expanded`，不设遮罩也不进入 `dialog` 语义。触摸与笔尖不触发。

### 变更

- `NavigationRail`：每个 item 拆成固定的图标块与展开的文字块，展开 / 收起动画中图标保持水平位置不变。
- `NavigationRail`：默认（显示文字）模式下展开态胶囊高 56px、上下各留 4px；展开时去掉图标下方文字的占位，item 总高始终为 64px。
- `NavigationRail`：子项通过 context 拿到有效展开状态，悬浮展开时同样切换到「文字在右」的排版。

### 修复

- `NavigationRail`：收起过程中不再闪出横向滚动条。项目的滚动容器只设了 `overflow-y`，浏览器会把 `overflow-x` 算成 `auto`；现在列表容器与模态 / 悬浮面板都固定 `overflow-x: hidden`。

### 文档

- `NavigationRail`：展开导航按「标准 / 模态 / 悬浮」三部分组织，每部分给出显示文字与仅显示图标的演示，代码示例只保留一份并在模板注释里标出图标版差异；移除 `expandedWidth` 小节与 API 行。
- 首页与根 README：站点定位改为 Material You 组件库，优点改为动态取色、国际化、自定义性、轻量化、TS 优先、组件丰富、按需引入、文档完善。
- `AGENTS.md`：补齐目录树中的 `i18n`、`directives`、`useOverlayPanel` 与各篇 guide，新增「国际化」约定。

## [1.2.0] - 2026-10-31

### 新增

- `Input`：`label` 与 `placeholder` 可以同时使用，两者不再重叠。未聚焦的空状态下只显示居中的标签；标签上浮后（聚焦、`floatLabel`、`filled`、多行或已有内容）才显示 `placeholder`，用户输入后随原生行为隐藏；`shape="pill"` 没有可见标签，`placeholder` 始终显示。

### 变更

- `ButtonGroup`：选中态改用统一的圆角令牌 `--ds-radius`（8px）。`shape="standard"` 下选中的子项不再是完整胶囊；`shape="connected"` 下选中项不论位于哪一端，四个角都一致，不再出现「一端全圆、一端小圆」的不对称。

### 文档

- `Input`：新增「标签与 placeholder」示例，并补充各形状与变体下 `placeholder` 的出现时机。
- `ButtonGroup`：形状一节补充未选中 / 选中的圆角对照表。

## [1.1.1] - 2026-10-29

### 修复

- `Select`：长列表弹层滚动时不再被拉回顶部。定位时改用 `scrollHeight` 测量内容高度，不再临时清除 `max-height`（那会让面板瞬间失去溢出、把 `scrollTop` 钳回 0）；弹层内部的滚动事件也不再触发重新定位。

### 文档

- `Select`：新增长列表示例，说明超过 `320px` 时弹层内部滚动，以及键盘移动会滚动到高亮项。

## [1.1.0] - 2026-10-29

### 修复

- `Select`、`Menu`、`FabMenu`：修复再次打开弹层时可能只渲染出空壳、看不到任何子项的问题（仅在 SSR 水合后的页面出现）。面板每次挂载都会重新生成插槽 vnode，不再复用已卸载的节点。
- `Select`：修复描边被触发器背景遮住的问题，悬停、聚焦与错误态的边框恢复正常显示。

### 文档

- 补充根 README，加入仓库链接并调整站点描述。

[Unreleased]: https://github.com/SharpDotNUT/dotsharp/compare/v1.3.0...HEAD
[1.3.0]: https://github.com/SharpDotNUT/dotsharp/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/SharpDotNUT/dotsharp/compare/v1.1.1...v1.2.0
[1.1.1]: https://github.com/SharpDotNUT/dotsharp/compare/v1.1.0...v1.1.1
[1.1.0]: https://github.com/SharpDotNUT/dotsharp/compare/v1.0.0...v1.1.0
