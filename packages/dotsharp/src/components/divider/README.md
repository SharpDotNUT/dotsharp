<script setup lang="ts">
import { Divider } from "@sharpdotnut/dotsharp";
</script>

# Divider 分隔线

1px 的分隔线，用 `--ds-border` 画线，把列表项、卡片内容或工具栏按钮分组。

- 默认水平：占满父容器宽度，两端贴边。
- `vertical`：宽度 1px，在 flex 容器里用 `self-stretch` 撑满父级高度。父级不是 flex 时请自行给高度。
- `inset`：`start` / `end` / `both`，水平线对应左 / 右留白，垂直线对应上 / 下留白，间距 16px。

## 水平分隔

<div class="demo-row">
  <div class="w-full max-w-md font-ds text-sm text-ds-fg">
    <div class="py-3">收件箱</div>
    <Divider />
    <div class="py-3">已发送</div>
    <Divider />
    <div class="py-3">草稿</div>
  </div>
</div>

```vue
<div>
  <div>收件箱</div>
  <Divider />
  <div>已发送</div>
</div>
```

水平分隔线在块级流里自动占满宽度；放进 flex 布局时也保持 `self-stretch`，不会被拉伸成多条线。

## 两端留白

`inset` 控制线的起点：`start` 只留左端，`end` 只留右端，`both` 两端都留，适合与带图标的列表项对齐。

<div class="demo-row">
  <div class="flex w-full max-w-md flex-col gap-4 font-ds text-sm text-ds-fg">
    <div>
      <div class="mb-2 text-xs text-ds-muted">inset="start"</div>
      <div class="py-2">对齐缩进的内容</div>
      <Divider inset="start" />
      <div class="py-2">对齐缩进的内容</div>
    </div>
    <div>
      <div class="mb-2 text-xs text-ds-muted">inset="both"</div>
      <div class="py-2">两端都留白</div>
      <Divider inset="both" />
      <div class="py-2">两端都留白</div>
    </div>
  </div>
</div>

```vue
<Divider inset="start" />
<Divider inset="both" />
```

## 垂直分隔

工具栏、按钮组或一行元信息之间用垂直线。它依赖父级 flex 的高度（`items-stretch` 或默认的 `stretch`）。

<div class="demo-row">
  <div class="flex h-12 items-center gap-4 font-ds text-sm text-ds-fg">
    <span>撤销</span>
    <Divider vertical />
    <span>重做</span>
    <Divider vertical />
    <span>另存为</span>
  </div>
</div>

```vue
<div class="flex h-12 items-center gap-4">
  <span>撤销</span>
  <Divider vertical />
  <span>重做</span>
</div>
```

垂直线的 `inset="both"` 会在上下各留 16px；父级没有固定高度时，线至少保留 16px 高度。

## API

| 属性     | 类型                                   | 默认值   | 说明                |
| -------- | -------------------------------------- | -------- | ------------------- |
| vertical | `boolean`                              | `false`  | 垂直分隔线          |
| inset    | `"none" \| "start" \| "end" \| "both"` | `"none"` | 两端留白，固定 16px |

- 水平渲染为 `<hr>`，垂直渲染为 `role="separator"` 的 `<div>`；两者都带 `aria-orientation`。
- 根元素无默认外边距（组件库不带 preflight），因此可以在任何上下文中直接使用。
- 其余属性与事件透传到根元素，可用 `class` 调整间距（例如 `class="my-4"`）。

### 可访问性

分隔线带 `role="separator"`，读屏会把它读作内容分组而不是普通装饰；纯视觉分隔若不需要被读到，
可以自行加 `aria-hidden="true"`。
