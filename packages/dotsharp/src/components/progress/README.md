<script setup lang="ts">
import { ref } from "vue";
import { Button, Progress } from "@sharpdotnut/dotsharp";

const value = ref(32);
const uploaded = ref(76);
const playing = ref(48);
const syncing = ref(64);
const random = ref(20);
const progress = ref<InstanceType<typeof Progress> | null>(null);
const ring = ref<InstanceType<typeof Progress> | null>(null);

function randomize() {
  const next = Math.round(Math.random() * 100);
  progress.value?.setValue(next);
  ring.value?.setValue(next);
}
</script>

# Progress 进度条

`Progress` 展示一项任务的完成程度：线性进度条占满容器宽度，圆环按 `size` 固定直径。它不收用户输入，
值只由数据驱动；父组件也可以调实例方法直接推动进度。

## 基础用法

默认样式把「已完成」和「剩余」画成两段：中间留一个 4px 的间隙，线性轨道末端还有一个圆点标出剩余部分的终点。

<div class="demo-row">
  <div class="w-full max-w-lg">
    <Progress :value="value" label="上传进度" />
  </div>
</div>

```vue
<script setup lang="ts">
import { ref } from "vue";
import { Progress } from "@sharpdotnut/dotsharp";

const value = ref(32);
</script>

<template>
  <Progress :value="value" label="上传进度" />
</template>
```

`value` 夹在 `0`–`max`（默认 `100`）之间，非法值按 `0` 处理。线性进度条厚度固定 4px，宽度由外部（`class` 或父元素）决定。

## 变体

`variant="continuous"` 换成整条背景：轨道不再断开，进度直接叠在完整背景上，也没有末端圆点。

<div class="demo-row">
  <div class="flex w-full max-w-lg flex-col gap-4">
    <Progress :value="uploaded" label="默认样式" />
    <Progress :value="uploaded" variant="continuous" label="整条背景" />
  </div>
</div>

```vue
<template>
  <Progress :value="76" label="默认样式" />
  <Progress :value="76" variant="continuous" label="整条背景" />
</template>
```

## 圆环

`shape="circular"` 从 12 点顺时针填充。`size` 是直径（px，默认 `48`），圆环粗细取它的 1/12，所以放大时比例保持不变。
默认变体在 12 点和进度点各留一处间隙，`continuous` 则是一整圈背景加上方的进度弧。

<div class="demo-row">
  <Progress :value="playing" shape="circular" label="播放进度" />
  <Progress :value="playing" shape="circular" variant="continuous" label="播放进度" />
  <Progress :value="syncing" shape="circular" :size="72" label="同步进度" />
  <Progress :value="syncing" shape="circular" variant="continuous" :size="96" label="同步进度" />
</div>

```vue
<template>
  <Progress :value="48" shape="circular" label="播放进度" />
  <Progress :value="48" shape="circular" variant="continuous" label="播放进度" />
  <Progress :value="64" shape="circular" :size="72" label="同步进度" />
  <Progress :value="64" shape="circular" variant="continuous" :size="96" label="同步进度" />
</template>
```

## 不确定进度

时长未知时用 `indeterminate`：线性轨道上循环扫过一段实心段，圆环是一段绕圈的弧。此时 `value` 被忽略，
`variant` 也不再生效——不确定态没有端点，也就没有「留空」可言，两条 / 整圈轨道都原样保留。

<div class="demo-row">
  <div class="flex w-full max-w-lg flex-col gap-4">
    <Progress indeterminate label="正在处理" />
    <Progress indeterminate shape="circular" label="正在加载" />
    <Progress indeterminate shape="circular" :size="72" label="正在加载" />
  </div>
</div>

```vue
<template>
  <Progress indeterminate label="正在处理" />
  <Progress indeterminate shape="circular" label="正在加载" />
  <Progress indeterminate shape="circular" :size="72" label="正在加载" />
</template>
```

动效来自 `src/styles/index.css` 里的 `--animate-ds-progress-indeterminate`（线性）与 Tailwind 自带的
`animate-spin`（圆环）。两者都带 `motion-reduce` 退路：系统开启「减少动态效果」时，线性停成一段静止的实心段，
圆环停成一段静止的弧，而不是停在轨道外或整圈空转。

## 命令式更新

组件实例暴露 `setValue(value)`：值先夹在 `0`–`max` 之间，再写回 `v-model:value`，显示进度沿既有的 300ms 过渡
动到新位置。方法不分形状，线性与圆环是同一个入口；下例两个形状共用同一个绑定值，按钮只调实例方法。

<div class="demo-row">
  <Progress ref="progress" v-model:value="random" label="随机进度" class="min-w-0 flex-1" />
  <Progress ref="ring" v-model:value="random" shape="circular" :size="64" label="随机进度" />
  <Button @click="randomize">随机更新</Button>
</div>

当前值：{{ random }}

```vue
<script setup lang="ts">
import { ref } from "vue";
import { Button, Progress } from "@sharpdotnut/dotsharp";

const progress = ref<InstanceType<typeof Progress> | null>(null);
const ring = ref<InstanceType<typeof Progress> | null>(null);
const random = ref(20);

function randomize() {
  const next = Math.round(Math.random() * 100);
  progress.value?.setValue(next);
  ring.value?.setValue(next);
}
</script>

<template>
  <Progress ref="progress" v-model:value="random" label="随机进度" class="min-w-0 flex-1" />
  <Progress ref="ring" v-model:value="random" shape="circular" :size="64" label="随机进度" />
  <Button @click="randomize">随机更新</Button>
</template>
```

没有 `v-model:value` 时，`setValue()` 写下的值只留在组件内部；父组件传下的 `value` 再次变化会覆盖它。
不确定态下调用只同步值，视觉不变。

## API

| 属性          | 类型                         | 默认值       | 说明                                      |
| ------------- | ---------------------------- | ------------ | ----------------------------------------- |
| v-model:value | `number`                     | `0`          | 当前进度，夹在 `0`–`max` 之间             |
| max           | `number`                     | `100`        | 进度上限                                  |
| shape         | `"linear" \| "circular"`     | `"linear"`   | 线性进度条或圆环                          |
| variant       | `"detached" \| "continuous"` | `"detached"` | 两段留空 / 整条背景                       |
| size          | `number`                     | `48`         | 圆环直径（px），粗细取 1/12；线性形状忽略 |
| indeterminate | `boolean`                    | `false`      | 不确定进度：忽略 `value` 与 `variant`     |
| label         | `string`                     | —            | 无障碍名称                                |

- 根元素是 `role="progressbar"`，`class` / `style` 与其余属性都落在它上面。
- 圆环按 `size` 固定尺寸；线性进度条总是占满容器宽度，用 `class="w-64"` 或父元素收窄。
- `indeterminate` 是布尔开关，与 `value` 同时出现时以它为准。

### 暴露的方法

| 方法              | 说明                                      |
| ----------------- | ----------------------------------------- |
| `setValue(value)` | 夹取后写入 `value`，并发出 `update:value` |

### 事件

| 事件           | 说明                                                 |
| -------------- | ---------------------------------------------------- |
| `update:value` | 值变化（`setValue()` 写入时发出，供 `v-model` 同步） |

### 可访问性

根元素带 `role="progressbar"` 与 `aria-valuemin` / `aria-valuemax` / `aria-valuenow`，`aria-valuenow` 写入夹住后的值；
`indeterminate` 时这三个属性全部省略，读屏据此报「不确定进度」；`label` 写成 `aria-label`。
视觉部分是装饰性的（`aria-hidden`），读屏只读这个根节点。
