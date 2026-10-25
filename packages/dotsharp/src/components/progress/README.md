<script setup lang="ts">
import { ref } from "vue";
import { Progress } from "@sharpdotnut/dotsharp";

const value = ref(32);
const uploaded = ref(76);
const playing = ref(48);
const syncing = ref(64);
</script>

# Progress 进度条

`Progress` 展示一项任务的完成程度：线性进度条占满容器宽度，圆环按 `size` 固定直径。值只读，没有交互。

## 基础用法

默认样式把「已完成」和「剩余」画成两段：中间留一个 4px 的间隙，线性轨道末端还有一个圆点标出剩余部分的终点。

<div class="demo-row">
  <div class="w-full max-w-lg">
    <Progress :value="value" label="上传进度" />
  </div>
</div>

```vue
<script setup lang="ts">
import { Progress } from "@sharpdotnut/dotsharp";
</script>

<template>
  <Progress :value="32" />
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
  <Progress :value="76" />
  <Progress :value="76" variant="continuous" />
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
  <Progress :value="48" shape="circular" />
  <Progress :value="48" shape="circular" variant="continuous" />
  <Progress :value="64" shape="circular" :size="96" variant="continuous" />
</template>
```

## API

| 属性    | 类型                         | 默认值       | 说明                                      |
| ------- | ---------------------------- | ------------ | ----------------------------------------- |
| value   | `number`                     | `0`          | 当前进度，夹在 `0`–`max` 之间             |
| max     | `number`                     | `100`        | 进度上限                                  |
| shape   | `"linear" \| "circular"`     | `"linear"`   | 线性进度条或圆环                          |
| variant | `"detached" \| "continuous"` | `"detached"` | 两段留空 / 整条背景                       |
| size    | `number`                     | `48`         | 圆环直径（px），粗细取 1/12；线性形状忽略 |
| label   | `string`                     | —            | 无障碍名称                                |

- 根元素是 `role="progressbar"`，`class` / `style` 与其余属性都落在它上面。
- 圆环按 `size` 固定尺寸；线性进度条总是占满容器宽度，用 `class="w-64"` 或父元素收窄。

### 可访问性

根元素带 `role="progressbar"` 与 `aria-valuemin` / `aria-valuemax` / `aria-valuenow`，`aria-valuenow` 写入夹住后的值；
`label` 写成 `aria-label`。视觉部分是装饰性的（`aria-hidden`），读屏只读这个根节点。
