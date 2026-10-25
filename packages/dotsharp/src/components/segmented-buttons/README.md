<script setup lang="ts">
import { ref } from "vue";
import { SegmentedButton, SegmentedButtons } from "@sharpdotnut/dotsharp";
import calendarIcon from "@iconify-icons/material-symbols/calendar-today";
import homeIcon from "@iconify-icons/material-symbols/home";
import wifiIcon from "@iconify-icons/material-symbols/wifi";

const period = ref("day");
const index = ref(0);
const place = ref("home");
</script>

# SegmentedButtons 分段按钮

由 `SegmentedButtons` 与 `SegmentedButton` 组合而成：父组件持有选中值（`v-model:value`），
每个 `SegmentedButton` 描述一个分段。一个分段组是一个单选控件——选中项不能被取消选中。

- 所有分段平分父组件宽度，与文字长短无关。
- 分段标识默认为自身索引，也可以用 `value` 指定。
- 未选中时用 `icon` 显示前置图标；选中后固定显示勾选图标。

## 基础用法

<div class="demo-row">
  <SegmentedButtons v-model:value="period" class="w-full max-w-sm">
    <SegmentedButton label="每日" value="day" />
    <SegmentedButton label="每周" value="week" />
    <SegmentedButton label="每月" value="month" />
  </SegmentedButtons>
</div>

当前选中值：{{ period }}

```vue
<script setup lang="ts">
import { ref } from "vue";
import { SegmentedButton, SegmentedButtons } from "@sharpdotnut/dotsharp";

const period = ref("day");
</script>

<template>
  <SegmentedButtons v-model:value="period">
    <SegmentedButton label="每日" value="day" />
    <SegmentedButton label="每周" value="week" />
    <SegmentedButton label="每月" value="month" />
  </SegmentedButtons>
</template>
```

## 标识：value 与索引

省略 `value` 时，分段用声明顺序的索引（从 `0` 开始）作为标识；`v-model:value` 默认是 `0`，
因此首个分段默认选中。

<div class="demo-row">
  <SegmentedButtons v-model:value="index" class="w-full max-w-sm">
    <SegmentedButton label="日" />
    <SegmentedButton label="周" />
    <SegmentedButton label="月" />
  </SegmentedButtons>
</div>

当前选中索引：{{ index }}

```vue
<script setup lang="ts">
import { ref } from "vue";
import { SegmentedButton, SegmentedButtons } from "@sharpdotnut/dotsharp";

const index = ref(0);
</script>

<template>
  <SegmentedButtons v-model:value="index">
    <SegmentedButton label="日" />
    <SegmentedButton label="周" />
    <SegmentedButton label="月" />
  </SegmentedButtons>
</template>
```

## 图标

未选中时渲染 `icon`；选中后该位置换成勾选图标，用来强调当前状态。需要不受 1.25em
限制的图标时，改用默认插槽配合 `<Icon size="…">`。

<div class="demo-row">
  <SegmentedButtons v-model:value="place" class="w-full max-w-sm">
    <SegmentedButton label="首页" value="home" :icon="homeIcon" />
    <SegmentedButton label="日程" value="calendar" :icon="calendarIcon" />
    <SegmentedButton label="网络" value="wifi" :icon="wifiIcon" />
  </SegmentedButtons>
</div>

```vue
<script setup lang="ts">
import { ref } from "vue";
import { SegmentedButton, SegmentedButtons } from "@sharpdotnut/dotsharp";
import homeIcon from "@iconify-icons/material-symbols/home";

const place = ref("home");
</script>

<template>
  <SegmentedButtons v-model:value="place">
    <SegmentedButton label="首页" value="home" :icon="homeIcon" />
    <SegmentedButton label="日程" value="calendar" :icon="calendarIcon" />
  </SegmentedButtons>
</template>
```

## 禁用

禁用的分段不可点击、不可聚焦，也不参与方向键移动。

<div class="demo-row">
  <SegmentedButtons v-model:value="period" class="w-full max-w-sm">
    <SegmentedButton label="每日" value="day" />
    <SegmentedButton label="每周" value="week" />
    <SegmentedButton label="每月" value="month" disabled />
  </SegmentedButtons>
</div>

```vue
<SegmentedButtons v-model:value="period">
  <SegmentedButton label="每日" value="day" />
  <SegmentedButton label="每周" value="week" />
  <SegmentedButton label="每月" value="month" disabled />
</SegmentedButtons>
```

## 键盘操作

分段组使用 roving tabindex：整组只有一个分段是 `tabindex="0"`，其余为 `-1`。

- `←` / `→`：在可用分段之间移动焦点，首尾循环；RTL 方向自动对调。
- `Home` / `End`：跳到第一个 / 最后一个可用分段。

方向键移动焦点时**立即选中**，与单选组的行为一致；`Tab` 键正常离开整组。

## API

### SegmentedButtons

| 属性          | 类型               | 默认值 | 说明                                  |
| ------------- | ------------------ | ------ | ------------------------------------- |
| v-model:value | `string \| number` | `0`    | 当前选中值，对应子项的 `value` 或索引 |

根元素是 `role="group"` 的 `div`，其余属性与事件透传到该元素。

### SegmentedButton

| 属性     | 类型                    | 默认值       | 说明                                         |
| -------- | ----------------------- | ------------ | -------------------------------------------- |
| label    | `string`                | —            | 纯文本内容；存在默认插槽时被插槽覆盖         |
| icon     | `IconifyIcon \| string` | —            | 未选中时的前置图标，尺寸 `1.25em` 跟随字号   |
| value    | `string \| number`      | 所在位置索引 | 分段标识                                     |
| disabled | `boolean`               | `false`      | 禁用：不可聚焦、不参与方向键移动、点击不选中 |

- 根元素是原生 `button`，带 `aria-pressed`，其余属性与事件透传到该按钮。
- 点击已选中的分段不会重复写模型，也不会触发 `update:value`。

### 可访问性

组根元素是 `role="group"`，每个分段是原生 `button` 并带 `aria-pressed`，因此读屏会把整组理解为一组切换按钮。
键盘遵循 roving tabindex：只有当前焦点分段可被 `Tab` 到达，方向键在 `button:not([disabled])` 之间移动，
`Home` / `End` 跳到两端。
