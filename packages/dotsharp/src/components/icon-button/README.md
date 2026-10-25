<script setup lang="ts">
import { Icon, IconButton } from "@sharpdotnut/dotsharp";
import arrowBack from "@iconify-icons/material-symbols/arrow-back";
import calendarMonth from "@iconify-icons/material-symbols/calendar-month";
import menu from "@iconify-icons/material-symbols/menu";
import moreVert from "@iconify-icons/material-symbols/more-vert";
import search from "@iconify-icons/material-symbols/search";
</script>

# IconButton 图标按钮

没有可见文字的原生 `button`：40×40 圆形点击区，图标跟随字号（默认 `1.5rem`，即 24px），悬停显示浅色底，键盘聚焦画焦点环。

- `label` 必填，写进 `aria-label`——图标按钮的读屏名称只能来自它。
- `icon` 与 `Icon` 的 `icon` 同源，直接传图标数据；默认插槽优先，可以放任意内容（徽标、头像首字母等）。
- 图标是装饰性的（`aria-hidden`），不会被读屏重复朗读。

## 基础用法

<div class="demo-row">
  <IconButton :icon="menu" label="打开菜单" />
  <IconButton :icon="search" label="搜索" />
  <IconButton :icon="calendarMonth" label="日历" />
  <IconButton :icon="moreVert" label="更多" />
  <IconButton :icon="arrowBack" label="返回" disabled />
</div>

```vue
<script setup lang="ts">
import { IconButton } from "@sharpdotnut/dotsharp";
import calendarMonth from "@iconify-icons/material-symbols/calendar-month";
import menu from "@iconify-icons/material-symbols/menu";
import search from "@iconify-icons/material-symbols/search";
</script>

<template>
  <IconButton :icon="menu" label="打开菜单" />
  <IconButton :icon="search" label="搜索" />
  <IconButton :icon="calendarMonth" label="日历" />
</template>
```

`disabled` 时不响应指针事件并降到 40% 不透明度，也从 Tab 序列中移除（原生 `button` 行为）。

## 自定义内容

默认插槽优先于 `icon`，适合头像首字母、带徽标的图标这类内容。

<div class="demo-row">
  <IconButton label="账户">
    <span
      class="flex h-6 w-6 items-center justify-center rounded-full bg-ds-primary-strong text-xs font-medium text-ds-primary"
    >
      A
    </span>
  </IconButton>
</div>

```vue
<template>
  <IconButton label="账户">
    <span
      class="flex h-6 w-6 items-center justify-center rounded-full bg-ds-primary-strong text-xs text-ds-primary"
    >
      A
    </span>
  </IconButton>
</template>
```

## API

| 属性     | 类型                    | 默认值  | 说明                                |
| -------- | ----------------------- | ------- | ----------------------------------- |
| icon     | `IconifyIcon \| string` | —       | 图标；默认插槽优先                  |
| label    | `string`                | —       | 无障碍名称，必填，写入 `aria-label` |
| disabled | `boolean`               | `false` | 禁用                                |

- 根元素是 `type="button"` 的 `button`，其余属性与事件（`@click`、`title` 等）透传到该按钮。
- 尺寸固定 40×40，图标默认 `1.5rem`；需要更大 / 更小的图标时给 `<Icon>` 传 `size` 并用插槽。
- 可访问性：`aria-label` 来自 `label`；焦点环画在圆形按钮内（`outline-ds-focus`，负偏移），悬停底色用 `--ds-surface-hover`，不改变布局。
