<script setup lang="ts">
import { reactive, ref } from "vue";
import { IconButton, RangeSlider, Slider } from "@sharpdotnut/dotsharp";
import add from "@iconify-icons/material-symbols/add";
import remove from "@iconify-icons/material-symbols/remove";

const volume = ref(40);
const centered = ref(20);
const range = ref<[number, number]>([30, 70]);
const discrete = ref(40);
const indicator = ref(50);
const brightness = ref(50);
const disabled = ref(30);
const sizeValues = reactive({ xs: 30, s: 40, m: 50, l: 60, xl: 70 });
const sizeLabels = [
  { size: "xs", label: "XS · 16px" },
  { size: "s", label: "S · 24px" },
  { size: "m", label: "M · 40px" },
  { size: "l", label: "L · 56px" },
  { size: "xl", label: "XL · 96px" },
] as const;

function decreaseBrightness() {
  brightness.value = Math.max(0, brightness.value - 10);
}

function increaseBrightness() {
  brightness.value = Math.min(100, brightness.value + 10);
}
</script>

# Slider 滑块

`Slider` 从区间中选一个值，`RangeSlider` 用两个手柄选一段区间。两者共用 Material 3 Expressive 的外观：
圆角轨道、竖条手柄、手柄两侧的间隙、端点圆点，以及可选的刻度点与数值气泡。

- `v-model` 绑定数值（`Slider` 为 `number`，`RangeSlider` 为 `[最小值, 最大值]`）。
- `size` 控制轨道厚度：XS 16px、S 24px、M 40px、L 56px、XL 96px（默认 XS）。
- 拖动时手柄变细，并在其上方显示数值气泡；`showValue="always"` 则始终显示。
- `ticks` 在轨道上标出每个可选值，`centered` 让 `Slider` 从 0 值处开始填充。
- 两端可以放任意内容（加号 / 减号图标、文字、按钮），由 `#start` / `#end` 插槽提供。

## 基础用法

<div class="demo-row">
  <Slider v-model="volume" label="音量" class="w-full max-w-lg" />
</div>

当前值：{{ volume }}

```vue
<script setup lang="ts">
import { ref } from "vue";
import { Slider } from "@sharpdotnut/dotsharp";

const volume = ref(40);
</script>

<template>
  <Slider v-model="volume" label="音量" />
</template>
```

`min` / `max` 默认 `0` / `100`，`step` 默认 `1`。点击轨道任意位置即可跳转，移动过程与点击后的跳转都带过渡动画；
拖动时按 `step` 吸附并夹在 `min`–`max` 之间。

## 居中零点

`centered` 把填充原点从轨道起点移到 0（若 0 不在范围内，则取最接近的端点），用于正负对称的取值，例如亮度补偿、温度偏移。

<div class="demo-row">
  <Slider v-model="centered" :min="-100" :max="100" :step="5" centered label="偏移量" class="w-full max-w-lg" />
</div>

当前值：{{ centered }}

```vue
<script setup lang="ts">
import { ref } from "vue";
import { Slider } from "@sharpdotnut/dotsharp";

const centered = ref(20);
</script>

<template>
  <Slider v-model="centered" :min="-100" :max="100" :step="5" centered />
</template>
```

## 范围滑块

`RangeSlider` 的 `v-model` 是 `[低位, 高位]`，两个手柄不会交叉；拖动 / 点击时命中的是离指针更近的手柄。
数值气泡一次只显示正在操作的那一个手柄。

两个手柄是两个独立的 `role="slider"`，只传 `label` 会让它们共用同一个名字；用 `labels` 分别命名：
`labels[0]` 是低位、`labels[1]` 是高位。

<div class="demo-row">
  <RangeSlider v-model="range" :labels="['最低价', '最高价']" class="w-full max-w-lg" />
</div>

当前区间：{{ range[0] }} – {{ range[1] }}

```vue
<script setup lang="ts">
import { ref } from "vue";
import { RangeSlider } from "@sharpdotnut/dotsharp";

const range = ref<[number, number]>([30, 70]);
</script>

<template>
  <RangeSlider v-model="range" :labels="['最低价', '最高价']" />
</template>
```

## 显示可用值

`ticks` 在轨道上为每个可选值画一个点，选中部分用反色点、未选中部分用主题色点；端点圆点始终保留。
如 Material 的建议，只有「范围 ÷ 步长」较小时才适合开启：刻度超过 20 个时组件会自动省略，避免糊成一条线。

<div class="demo-row">
  <Slider v-model="discrete" :step="20" ticks label="显示尺寸" class="w-full max-w-lg" />
</div>

当前值：{{ discrete }}

```vue
<script setup lang="ts">
import { ref } from "vue";
import { Slider } from "@sharpdotnut/dotsharp";

const discrete = ref(40);
</script>

<template>
  <Slider v-model="discrete" :step="20" ticks />
</template>
```

## 数值气泡

默认 `showValue="drag"`：按下 / 拖动时手柄变细，并在上方显示当前值，松手后气泡收起。
`showValue="always"` 常显（示例预留了顶部空间），`"never"` 完全关闭。`format` 可以自定义气泡与
`aria-valuetext` 的文本。

<div class="demo-row">
  <div class="w-full max-w-lg pt-12">
    <Slider v-model="indicator" show-value="always" label="不透明度" class="w-full" />
  </div>
</div>

当前值：{{ indicator }}

```vue
<script setup lang="ts">
import { ref } from "vue";
import { Slider } from "@sharpdotnut/dotsharp";

const indicator = ref(50);
</script>

<template>
  <Slider v-model="indicator" show-value="always" />
</template>
```

## 两端图标

`#start` / `#end` 接受任意内容。下例用 `IconButton` 做加减按钮，同时保留轨道上的拖动与键盘操作。

<div class="demo-row">
  <Slider v-model="brightness" label="亮度" class="w-full max-w-lg">
    <template #start>
      <IconButton :icon="remove" label="降低亮度" :disabled="brightness <= 0" @click="decreaseBrightness" />
    </template>
    <template #end>
      <IconButton :icon="add" label="提高亮度" :disabled="brightness >= 100" @click="increaseBrightness" />
    </template>
  </Slider>
</div>

当前值：{{ brightness }}

```vue
<script setup lang="ts">
import { ref } from "vue";
import { IconButton, Slider } from "@sharpdotnut/dotsharp";
import add from "@iconify-icons/material-symbols/add";
import remove from "@iconify-icons/material-symbols/remove";

const brightness = ref(50);

function decreaseBrightness() {
  brightness.value = Math.max(0, brightness.value - 10);
}

function increaseBrightness() {
  brightness.value = Math.min(100, brightness.value + 10);
}
</script>

<template>
  <Slider v-model="brightness">
    <template #start>
      <IconButton :icon="remove" label="降低亮度" @click="decreaseBrightness" />
    </template>
    <template #end>
      <IconButton :icon="add" label="提高亮度" @click="increaseBrightness" />
    </template>
  </Slider>
</template>
```

插槽内容位于轨道两侧，轨道自动占据剩余宽度；放纯文字也可以（例如「小」「大」）。

## 尺寸

五种厚度对应 Material 3 Expressive 的 XS–XL，手柄高度随轨道增长（最小 44px）。大尺寸适合强调某一个数值或触控设备。

<div class="demo-row">
  <div class="flex w-full max-w-2xl flex-col gap-6">
    <div v-for="item in sizeLabels" :key="item.size" class="flex items-center gap-4">
      <span class="w-24 shrink-0 text-sm text-ds-muted">{{ item.label }}</span>
      <Slider
        v-model="sizeValues[item.size]"
        :size="item.size"
        :label="item.label"
        class="min-w-0 flex-1"
      />
    </div>
  </div>
</div>

```vue
<template>
  <Slider v-model="value" size="xs" />
  <Slider v-model="value" size="s" />
  <Slider v-model="value" size="m" />
  <Slider v-model="value" size="l" />
  <Slider v-model="value" size="xl" />
</template>
```

## 禁用

<div class="demo-row">
  <Slider v-model="disabled" disabled label="不可用" class="w-full max-w-lg" />
</div>

```vue
<template>
  <Slider v-model="value" disabled />
</template>
```

禁用时手柄不可聚焦、不响应指针与键盘，整体降低不透明度。

## API

### Slider 属性

| 属性      | 类型                                | 默认值   | 说明                                         |
| --------- | ----------------------------------- | -------- | -------------------------------------------- |
| v-model   | `number`                            | `0`      | 当前值                                       |
| min       | `number`                            | `0`      | 最小值                                       |
| max       | `number`                            | `100`    | 最大值                                       |
| step      | `number`                            | `1`      | 步长；值会吸附到 `min + n * step`            |
| size      | `"xs" \| "s" \| "m" \| "l" \| "xl"` | `"xs"`   | 轨道厚度（16 / 24 / 40 / 56 / 96px）         |
| centered  | `boolean`                           | `false`  | 以 0 值为填充原点                            |
| ticks     | `boolean`                           | `false`  | 显示每个可选值的刻度点（超过 20 个自动省略） |
| showValue | `"drag" \| "always" \| "never"`     | `"drag"` | 数值气泡的显示时机                           |
| format    | `(value: number) => string`         | —        | 自定义数值文本（气泡与 `aria-valuetext`）    |
| label     | `string`                            | —        | 无障碍名称                                   |
| disabled  | `boolean`                           | `false`  | 禁用                                         |

### RangeSlider 属性

与 `Slider` 相同，区别是 `v-model` 为 `[number, number]`，且没有 `centered`（范围滑块固定填充两个手柄之间）。

| 属性      | 类型                                | 默认值     | 说明                                    |
| --------- | ----------------------------------- | ---------- | --------------------------------------- |
| v-model   | `[number, number]`                  | `[0, 100]` | 低位与高位，顺序自动归一                |
| size      | `"xs" \| "s" \| "m" \| "l" \| "xl"` | `"xs"`     | 轨道厚度                                |
| ticks     | `boolean`                           | `false`    | 显示刻度点（超过 20 个自动省略）        |
| showValue | `"drag" \| "always" \| "never"`     | `"drag"`   | 数值气泡的显示时机                      |
| labels    | `[string, string]`                  | —          | 两个手柄各自的无障碍名称（低位 / 高位） |

`min`、`max`、`step`、`format`、`label`、`disabled` 与 `Slider` 一致。

### 插槽

| 插槽    | 说明                                     |
| ------- | ---------------------------------------- |
| `start` | 轨道左侧内容，常用减号图标或「小」等文字 |
| `end`   | 轨道右侧内容，常用加号图标或「大」等文字 |

### 事件

| 事件                | 说明                         |
| ------------------- | ---------------------------- |
| `update:modelValue` | 值变化（拖动 / 点击 / 键盘） |

### 可访问性

- 每个手柄是 `role="slider"` 的可聚焦元素，带 `aria-valuemin` / `aria-valuemax` / `aria-valuenow` /
  `aria-valuetext`；`label` 会写成它的 `aria-label`，`RangeSlider` 用 `labels` 给两个手柄各自命名。
- 键盘：左右 / 上下方向键按步长增减，`PageUp` / `PageDown` 按 10 倍步长，`Home` / `End` 跳到两端。
- 拖动时使用指针捕获，指针离开组件也不会中断；轨道设置 `touch-action: none`，触屏上不会与页面滚动冲突。
- 范围滑块的两个手柄各自独立聚焦；低位不会超过高位，反之亦然。
