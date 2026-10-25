<script setup lang="ts">
import { Badge, Icon } from "@sharpdotnut/dotsharp";
import mailIcon from "@iconify-icons/material-symbols/mail-outline";
import home from "@iconify-icons/material-symbols/home";
import search from "@iconify-icons/material-symbols/search";
import favorite from "@iconify-icons/material-symbols/favorite";
</script>

# Icon 图标

对 [`@iconify/vue`](https://iconify.design/docs/icon-components/vue/) 的封装：图标数据由使用方 import 后通过 `icon` 属性传入，组件本身不发网络请求，也不内置任何图标集合。

## 基础用法

从图标包按需 import 图标数据，再交给 `Icon`：

<div class="demo-row">
  <Icon :icon="home" />
  <Icon :icon="search" />
  <Icon :icon="favorite" />
</div>

```vue
<script setup lang="ts">
import { Icon } from "@sharpdotnut/dotsharp";
import favorite from "@iconify-icons/material-symbols/favorite";
import home from "@iconify-icons/material-symbols/home";
import search from "@iconify-icons/material-symbols/search";
</script>

<template>
  <Icon :icon="home" />
  <Icon :icon="search" />
  <Icon :icon="favorite" />
</template>
```

## 尺寸与颜色

`size` 默认 `1em`，即图标跟随所在文字的字号；传数字按像素处理。颜色默认 `currentColor`，可用 `color` 属性或前景色工具类（`text-ds-primary-strong` 等）改变。

<div class="demo-row">
  <Icon :icon="home" :size="16" />
  <Icon :icon="home" :size="24" />
  <Icon :icon="home" :size="32" class="text-ds-primary-strong" />
  <span class="text-xl text-ds-fg">购物车 <Icon :icon="home" /></span>
</div>

```vue
<Icon :icon="home" :size="16" />
<Icon :icon="home" :size="24" />
<Icon :icon="home" :size="32" class="text-ds-primary-strong" />
<span class="text-xl text-ds-fg">购物车 <Icon :icon="home" /></span>
```

`inline` 默认为 `true`，图标会以 `-0.125em` 基线与文字对齐；需要纯图形排版时可传 `:inline="false"`。

## 徽标

`#badge` 插槽把 `Badge` 贴在图标右上角：图标外面有一层 `relative` 容器，徽标被绝对定位并向外偏移自身一半。
父级若 `overflow-hidden`，请留出内边距，否则徽标会被裁掉。

<div class="demo-row">
  <Icon :icon="mailIcon" label="消息">
    <template #badge><Badge label="有新邮件" /></template>
  </Icon>
  <Icon :icon="home" :size="32" label="主页">
    <template #badge><Badge :value="12" label="12 个新项目" /></template>
  </Icon>
</div>

```vue
<script setup lang="ts">
import { Badge, Icon } from "@sharpdotnut/dotsharp";
import mailIcon from "@iconify-icons/material-symbols/mail-outline";
</script>

<template>
  <Icon :icon="mailIcon" label="消息">
    <template #badge>
      <Badge label="有新邮件" />
    </template>
  </Icon>
</template>
```

徽标本身的行为与 `max` / `label` 等属性见 [Badge](/components/badge)。

## 无障碍

默认按装饰图标处理：输出 `aria-hidden="true"` 与 `focusable="false"`，屏幕阅读器会跳过。图标本身承载语义时（例如只有图标的按钮），用 `label` 提供名称：

```vue
<Icon :icon="favorite" label="收藏" />
<!-- <svg role="img" aria-label="收藏" …> -->
```

## 图标来源（最佳实践）

图标数据来自 Iconify 图标集，按单个图标 import 即可：打包产物只包含真正用到的图标，运行时无网络请求。下面以 `@iconify-icons/material-symbols` 为例：

```bash
pnpm add @iconify-icons/material-symbols
```

```ts
import home from "@iconify-icons/material-symbols/home";
import homeOutline from "@iconify-icons/material-symbols/home-outline";
import search from "@iconify-icons/material-symbols/search";
```

- 图标名与该图标集的命名一致，可用后缀选风格：`home`（filled）、`home-outline`、`home-rounded`、`home-sharp` 等。
- 其他 Iconify 图标集同理：`@iconify-icons/mdi/home`、`@iconify-icons/tabler/home`、`@iconify-icons/lucide/home`……
- 同一页面大量图标时可以先 `addIcon` / `addCollection` 注册，再按名字传入，行为与 `@iconify/vue` 一致。

`icon` 也接受字符串图标名（如 `"material-symbols:home"`），但字符串需要运行时从 Iconify API 拉取，离线或受限网络环境不要使用。

## API

| 属性   | 类型                    | 默认值  | 说明                                                |
| ------ | ----------------------- | ------- | --------------------------------------------------- |
| icon   | `IconifyIcon \| string` | —       | 必填。图标数据对象，或需要联网加载的图标名          |
| size   | `number \| string`      | `"1em"` | 宽高；数字按 px 处理，字符串原样输出（`"1em"`）     |
| color  | `string`                | —       | 填充色，缺省 `currentColor`                         |
| label  | `string`                | —       | 无障碍名称；提供时输出 `role="img"` 与 `aria-label` |
| inline | `boolean`               | `true`  | 与文字基线对齐（`vertical-align: -0.125em`）        |

| 插槽  | 说明                                       |
| ----- | ------------------------------------------ |
| badge | 定位在图标右上角的徽标，通常放一个 `Badge` |

其余属性（`class`、`style`、事件等）与 `flip`、`rotate` 等 Iconify 定制属性都透传到图标的 `svg`。
最外层是 `relative inline-flex` 的容器，只为 `#badge` 定位存在；图标尺寸由 `size` 决定。
