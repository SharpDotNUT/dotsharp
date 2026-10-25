<script setup lang="ts">
import { ref } from "vue";
import { Checkbox, List, ListItem, Switch } from "@sharpdotnut/dotsharp";
import notificationsIcon from "@iconify-icons/material-symbols/notifications";
import wifiIcon from "@iconify-icons/material-symbols/wifi";

const wifi = ref(true);
const bluetooth = ref(false);
const notifications = ref(true);
</script>

# List 列表

`List` 提供带分隔线的容器，`ListItem` 描述一行内容：主文本、辅助文字、前置图标与尾部插槽。
列表本身不持有状态——尾部放 `Checkbox`、`Switch` 或按钮，状态由使用方管理。

## 基础用法

<div class="demo-row">
  <List class="w-full max-w-md">
    <ListItem label="Wi-Fi">
      <template #trailing>
        <Checkbox v-model="wifi" aria-label="Wi-Fi" />
      </template>
    </ListItem>
    <ListItem label="蓝牙">
      <template #trailing>
        <Checkbox v-model="bluetooth" aria-label="蓝牙" />
      </template>
    </ListItem>
  </List>
</div>

```vue
<script setup lang="ts">
import { ref } from "vue";
import { Checkbox, List, ListItem, Switch } from "@sharpdotnut/dotsharp";

const wifi = ref(true);
const bluetooth = ref(false);
</script>

<template>
  <List>
    <ListItem label="Wi-Fi">
      <template #trailing>
        <Checkbox v-model="wifi" aria-label="Wi-Fi" />
      </template>
    </ListItem>
    <ListItem label="蓝牙">
      <template #trailing>
        <Checkbox v-model="bluetooth" aria-label="蓝牙" />
      </template>
    </ListItem>
  </List>
</template>
```

## 图标与辅助文字

`icon` 渲染前置图标；`#leading` 插槽可以用任意内容替换它。`description` 显示在主文本下方。
尾部的内容统一放进 `#trailing`。

<div class="demo-row">
  <List class="w-full max-w-md">
    <ListItem label="Wi-Fi" description="已连接到 dotsharp" :icon="wifiIcon">
      <template #trailing>
        <Checkbox v-model="wifi" aria-label="Wi-Fi" />
      </template>
    </ListItem>
    <ListItem label="通知" description="仅接收重要提醒" :icon="notificationsIcon">
      <template #trailing>
        <Switch v-model="notifications" aria-label="通知" />
      </template>
    </ListItem>
  </List>
</div>

```vue
<script setup lang="ts">
import { ref } from "vue";
import { Checkbox, List, ListItem, Switch } from "@sharpdotnut/dotsharp";
import wifiIcon from "@iconify-icons/material-symbols/wifi";
import notificationsIcon from "@iconify-icons/material-symbols/notifications";

const wifi = ref(true);
const notifications = ref(true);
</script>

<template>
  <List>
    <ListItem label="Wi-Fi" description="已连接到 dotsharp" :icon="wifiIcon">
      <template #trailing>
        <Checkbox v-model="wifi" aria-label="Wi-Fi" />
      </template>
    </ListItem>
    <ListItem label="通知" description="仅接收重要提醒" :icon="notificationsIcon">
      <template #trailing>
        <Switch v-model="notifications" aria-label="通知" />
      </template>
    </ListItem>
  </List>
</template>
```

## 链接行

给 `ListItem` 传 `href` 时整行渲染成 `<a>`，带悬停底色与焦点环。`disabled` 会移除它的可点击性。

<div class="demo-row">
  <List class="w-full max-w-md">
    <ListItem label="账户设置" description="修改密码与通知偏好" href="#账户设置" />
    <ListItem label="不可用行" description="暂时无法进入" href="#不可用行" disabled />
  </List>
</div>

```vue
<List>
  <ListItem label="账户设置" description="修改密码与通知偏好" href="#账户设置" />
  <ListItem label="不可用行" description="暂时无法进入" href="#不可用行" disabled />
</List>
```

## API

### List

根元素是 `ul[role="list"]`，带 `divide-y` 分隔线与 `rounded-ds` 圆角；其余属性与事件透传到该元素。

### ListItem

| 属性        | 类型                    | 默认值  | 说明                               |
| ----------- | ----------------------- | ------- | ---------------------------------- |
| label       | `string`                | —       | 主文本；存在默认插槽时被插槽覆盖   |
| description | `string`                | —       | 主文本下方的辅助文字               |
| icon        | `IconifyIcon \| string` | —       | 前置图标；`#leading` 插槽优先      |
| href        | `string`                | —       | 有值时整行渲染成链接               |
| disabled    | `boolean`               | `false` | 仅对链接行生效：不可点击、不可聚焦 |

- 根元素是 `li`；`class` / `style` 落在 `li` 上，其余属性透传给行内容（有 `href` 时是 `<a>`）。
- 插槽：`#leading`（前置内容）、默认插槽（主文本）、`#trailing`（尾部内容）。
- 行高度至少 `56px`，主文本与辅助文字都会截断，不换行。

### 可访问性

`List` 输出 `ul[role="list"]`，`ListItem` 输出 `li`。链接行是原生 `a`，禁用的链接行带
`aria-disabled="true"` 与 `tabindex="-1"`。尾部控件（`Checkbox`、`Switch` 等）自己提供无障碍名称，
列表不会替它们生成标签。
