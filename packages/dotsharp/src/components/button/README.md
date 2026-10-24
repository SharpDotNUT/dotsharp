<script setup lang="ts">
import { ref } from "vue";
import { Button } from "@sharpdotnut/dotsharp";

const clicks = ref(0);
</script>

# Button 按钮

提供五种视觉层级与三种尺寸，默认 `variant="filled"`。

| 变体       | 容器           | 文字               | 用途                           |
| ---------- | -------------- | ------------------ | ------------------------------ |
| `elevated` | 近底色 + 阴影  | 主色               | 需要从背景中浮起的中等强调操作 |
| `filled`   | 主色           | `on-primary`       | 页面最重要的操作               |
| `tonal`    | 主色浅色调容器 | 深色（`on-tonal`） | 次重要但需要一定强调的操作     |
| `outlined` | 透明 + 边框    | 正文色             | 中等强调的次要操作             |
| `text`     | 透明           | 主色               | 对话框操作等低强调场景         |

## 基础用法

<div class="demo-row">
  <Button @click="clicks++">点击了 {{ clicks }} 次</Button>
</div>

```vue
<script setup lang="ts">
import { ref } from "vue";
import { Button } from "@sharpdotnut/dotsharp";

const clicks = ref(0);
</script>

<template>
  <Button @click="clicks++">点击了 {{ clicks }} 次</Button>
</template>
```

## 变体

<div class="demo-row">
  <Button variant="elevated">Elevated</Button>
  <Button variant="filled">Filled</Button>
  <Button variant="tonal">Tonal</Button>
  <Button variant="outlined">Outlined</Button>
  <Button variant="text">Text</Button>
</div>

```vue
<template>
  <Button variant="elevated">Elevated</Button>
  <Button variant="filled">Filled</Button>
  <Button variant="tonal">Tonal</Button>
  <Button variant="outlined">Outlined</Button>
  <Button variant="text">Text</Button>
</template>
```

五个变体都是全圆角（胶囊）形状；`elevated` 是唯一带阴影的变体，悬浮时只加深容器底色。

## 尺寸

通过 `size` 指定高度：`sm`（32px）、`md`（默认，40px）、`lg`（48px）。左右内边距随尺寸变化，
文字始终是 14px medium。

<div class="demo-row">
  <Button size="sm">小号</Button>
  <Button size="md">中号</Button>
  <Button size="lg">大号</Button>
</div>

```vue
<template>
  <Button size="sm">小号</Button>
  <Button size="md">中号</Button>
  <Button size="lg">大号</Button>
</template>
```

## 禁用

`disabled` 为 `true` 时按钮不可点击，悬浮样式也不再生效。

<div class="demo-row">
  <Button disabled>Filled</Button>
  <Button variant="outlined" disabled>Outlined</Button>
  <Button variant="text" disabled>Text</Button>
</div>

```vue
<template>
  <Button disabled>Filled</Button>
  <Button variant="outlined" disabled>Outlined</Button>
  <Button variant="text" disabled>Text</Button>
</template>
```

## 图标

默认插槽里直接放 `Icon`，两者按 `gap-2` 排列；图标尺寸跟随字号，推荐 `1.125em` 左右。

```vue
<script setup lang="ts">
import { Button, Icon } from "@sharpdotnut/dotsharp";
import edit from "@iconify-icons/material-symbols/edit";
</script>

<template>
  <Button>
    <Icon :icon="edit" size="1.125em" />
    编辑
  </Button>
</template>
```

## API

### Button

| 属性     | 类型                                                        | 默认值     | 说明                   |
| -------- | ----------------------------------------------------------- | ---------- | ---------------------- |
| variant  | `"elevated" \| "filled" \| "tonal" \| "outlined" \| "text"` | `"filled"` | 视觉层级               |
| size     | `"sm" \| "md" \| "lg"`                                      | `"md"`     | 高度 32 / 40 / 48px    |
| disabled | `boolean`                                                   | `false`    | 禁用，且不响应悬浮样式 |
| type     | `"button" \| "submit" \| "reset"`                           | `"button"` | 原生按钮类型           |

- 根元素是原生 `button`，其余属性与事件透传到该元素。
- 默认插槽承载文字或图标；需要方形图标按钮时给 `class` 设固定宽高并去掉内边距。
- 焦点样式是 `outline-ds-focus`（2px，偏移 2px）；颜色全部来自 `--ds-*` 令牌，明暗主题自动适配。
