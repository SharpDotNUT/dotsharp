<script setup lang="ts">
import { ref } from "vue";
import { Button } from "@sharpdotnut/dotsharp";

const clicks = ref(0);
</script>

# Button 按钮

最常用的操作按钮，提供三种变体与三种尺寸。

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

通过 `variant` 指定按钮的视觉层级：`primary`（默认）、`secondary`、`ghost`、`text`。
`text` 是无底色的主色文字按钮，Material Design 3 里用于对话框操作等低强调场景。

<div class="demo-row">
  <Button variant="primary">主要按钮</Button>
  <Button variant="secondary">次要按钮</Button>
  <Button variant="ghost">幽灵按钮</Button>
  <Button variant="text">文字按钮</Button>
</div>

```vue
<template>
  <Button variant="primary">主要按钮</Button>
  <Button variant="secondary">次要按钮</Button>
  <Button variant="ghost">幽灵按钮</Button>
  <Button variant="text">文字按钮</Button>
</template>
```

## 尺寸

通过 `size` 指定尺寸：`sm`、`md`（默认）、`lg`。

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
  <Button disabled>主要按钮</Button>
  <Button variant="secondary" disabled>次要按钮</Button>
  <Button variant="ghost" disabled>幽灵按钮</Button>
</div>

```vue
<template>
  <Button disabled>主要按钮</Button>
  <Button variant="secondary" disabled>次要按钮</Button>
  <Button variant="ghost" disabled>幽灵按钮</Button>
</template>
```
