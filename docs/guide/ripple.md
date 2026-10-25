# 涟漪 Ripple

`v-ripple` 是库里的公共点按反馈指令：按下时从按压点扩散一圈淡淡的 `currentColor`，松开后淡出。
它按 Material 3 的 ripple 参数实现（展开 450ms、淡出 150ms、不透明度 12%），颜色取自元素自身的文字颜色，
所以 `text-ds-on-primary`、`text-ds-on-tonal` 这些既有的 token 会自动决定涟漪的颜色，不需要额外配置。

库里的 `Button`、`IconButton`、`Tab`、`NavigationItem`、`NavigationRailItem`、`NavigationDrawerItem`、
`Input` 的尾部按钮、`Option` 与 `Select` 触发器都已经接上，直接使用即可。

## 用法

指令默认导出为 `vRipple`，在 `<script setup>` 里导入即可当 `v-ripple` 用：

```vue
<script setup lang="ts">
import { vRipple } from "@sharpdotnut/dotsharp";
</script>

<template>
  <button v-ripple class="rounded-full px-4 py-2">点我</button>
</template>
```

需要在全局注册（例如在应用入口）：

```ts
import { createApp } from "vue";
import { vRipple } from "@sharpdotnut/dotsharp";
import App from "./App.vue";

createApp(App).directive("ripple", vRipple).mount("#app");
```

## 选项

指令值可省略（等价于 `v-ripple`）或传对象；传 `false` 关闭：

| 选项      | 类型      | 默认值         | 说明                                        |
| --------- | --------- | -------------- | ------------------------------------------- |
| color     | `string`  | `currentColor` | 扩散颜色                                    |
| opacity   | `number`  | `0.12`         | 颜色不透明度                                |
| center    | `boolean` | `false`        | 总是从元素中心扩散，忽略按压位置            |
| unbounded | `boolean` | `false`        | 不裁剪到元素边界，也不改写元素的 `overflow` |

```vue
<div v-ripple="{ opacity: 0.16 }">更明显一点的涟漪</div>
<div v-ripple="{ color: 'var(--ds-primary-strong)' }">指定颜色</div>
<div v-ripple="false">关掉涟漪</div>
```

## 行为细节

- 元素自身需要能承载绝对定位的涟漪：指令会在元素 `position` 为 `static` 时补上 `relative`，
  在 `overflow` 为 `visible` 时补上 `hidden`（`unbounded` 时两者都跳过），并设置 `isolation: isolate`，
  让涟漪只画在元素背景与内容之间，不会盖住文字。
- `disabled` 或 `aria-disabled="true"` 的元素不会产生涟漪，无需手动关闭。
- 键盘 `Enter` / `Space` 触发时从元素中心扩散；`prefers-reduced-motion: reduce` 下不播放。
- 同一元素同时只保留一个涟漪，重复按压不会叠加。
