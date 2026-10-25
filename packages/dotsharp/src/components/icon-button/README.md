<script setup lang="ts">
import { Badge, Icon, IconButton } from "@sharpdotnut/dotsharp";
import arrowBack from "@iconify-icons/material-symbols/arrow-back";
import calendarMonth from "@iconify-icons/material-symbols/calendar-month";
import mailIcon from "@iconify-icons/material-symbols/mail-outline";
import menu from "@iconify-icons/material-symbols/menu";
import moreVert from "@iconify-icons/material-symbols/more-vert";
import notificationsIcon from "@iconify-icons/material-symbols/notifications-outline";
import search from "@iconify-icons/material-symbols/search";
</script>

# IconButton 图标按钮

没有可见文字的原生 `button`：40×40 圆形点击区，图标跟随字号（默认 `1.5rem`，即 24px），悬停显示浅色底，键盘聚焦画焦点环。

- `label` 必填，写进 `aria-label`——图标按钮的读屏名称只能来自它。
- `icon` 与 `Icon` 的 `icon` 同源，直接传图标数据；默认插槽优先，可以放任意内容（头像、首字母等）。
- 右上角徽标用 `#badge` 插槽，放一个 `Badge` 即可，定位由组件负责。
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

## 徽标

`#badge` 插槽把 `Badge` 定位到按钮右上角，并向外偏移自身一半；省略 `value` 时是 6px 小圆点，给出 `value` 时显示计数。
徽标不接收指针事件，不会挡住按钮点击。

<div class="demo-row">
  <IconButton :icon="mailIcon" label="消息">
    <template #badge><Badge :value="3" label="3 条未读消息" /></template>
  </IconButton>
  <IconButton :icon="notificationsIcon" label="通知">
    <template #badge><Badge :value="120" label="120 条未读通知" /></template>
  </IconButton>
  <IconButton :icon="notificationsIcon" label="有新通知">
    <template #badge><Badge label="有新通知" /></template>
  </IconButton>
</div>

```vue
<script setup lang="ts">
import { Badge, IconButton } from "@sharpdotnut/dotsharp";
import mailIcon from "@iconify-icons/material-symbols/mail-outline";

const unread = 3;
</script>

<template>
  <IconButton :icon="mailIcon" label="消息">
    <template #badge>
      <Badge :value="unread" label="3 条未读消息" />
    </template>
  </IconButton>
</template>
```

徽标的行为与 `max` / `label` 等属性见 [Badge](/components/badge)。父级若 `overflow-hidden`，请留出内边距，
否则向外偏移的部分会被裁掉。

## API

| 属性     | 类型                    | 默认值  | 说明                                |
| -------- | ----------------------- | ------- | ----------------------------------- |
| icon     | `IconifyIcon \| string` | —       | 图标；默认插槽优先                  |
| label    | `string`                | —       | 无障碍名称，必填，写入 `aria-label` |
| disabled | `boolean`               | `false` | 禁用                                |

| 插槽    | 说明                                   |
| ------- | -------------------------------------- |
| default | 替换图标的自定义内容                   |
| badge   | 定位在按钮右上角的徽标，通常放 `Badge` |

- 根元素是用于徽标定位的 `relative inline-flex` 容器，内部才是 `type="button"` 的 `button`；属性与事件
  （`@click`、`title` 等）仍然透传到该按钮。徽标因此不会被 ripple 的 `overflow: hidden` 裁掉。
- 尺寸固定 40×40，图标默认 `1.5rem`；需要更大 / 更小的图标时给 `<Icon>` 传 `size` 并用插槽。
- 可访问性：`aria-label` 来自 `label`；焦点环画在圆形按钮内（`outline-ds-focus`，负偏移），悬停底色用 `--ds-surface-hover`，不改变布局。
