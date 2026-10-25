<script setup lang="ts">
import { Badge, Icon } from "@sharpdotnut/dotsharp";
import favorite from "@iconify-icons/material-symbols/favorite";
import home from "@iconify-icons/material-symbols/home";
import mailIcon from "@iconify-icons/material-symbols/mail-outline";
import search from "@iconify-icons/material-symbols/search";
</script>

# Icon 图标

按需渲染图标数据的组件。图标由使用方 `import` 后通过 `icon` 传入，组件不内置图标集合，也不发网络请求。
图标集的选择与引入方式见[图标](/guide/icons)。

## 基础用法

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

`size` 默认 `1em`，跟随所在文字的字号；传数字按像素处理。颜色默认 `currentColor`，用 `text-ds-*` 工具类
或 `color` 属性改变。

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

`inline` 默认为 `true`，图标以 `-0.125em` 基线与文字对齐；纯图形排版时传 `:inline="false"`。

## 徽标

`#badge` 插槽把 `Badge` 定位到图标右上角，并向外偏移自身一半。父级若 `overflow-hidden`，请留出内边距，
否则徽标会被裁掉。

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

徽标本身的行为见 [Badge](/components/badge)。

## 无障碍

默认按装饰图标处理：输出 `aria-hidden="true"` 与 `focusable="false"`，读屏会跳过。图标承载语义时用
`label` 提供名称：

```vue
<Icon :icon="favorite" label="收藏" />
```

只有图标的按钮应给按钮本身设置 `label`，而不是只依赖图标内部的名称。

## API

| 属性   | 类型                    | 默认值  | 说明                                                |
| ------ | ----------------------- | ------- | --------------------------------------------------- |
| icon   | `IconifyIcon \| string` | —       | 必填。图标数据对象；字符串会联网加载，不建议使用    |
| size   | `number \| string`      | `"1em"` | 宽高；数字按 px 处理，字符串原样输出                |
| color  | `string`                | —       | 填充色，缺省 `currentColor`                         |
| label  | `string`                | —       | 无障碍名称；提供时输出 `role="img"` 与 `aria-label` |
| inline | `boolean`               | `true`  | 与文字基线对齐（`vertical-align: -0.125em`）        |

| 插槽  | 说明                                       |
| ----- | ------------------------------------------ |
| badge | 定位在图标右上角的徽标，通常放一个 `Badge` |

其余属性与 `flip`、`rotate` 等 Iconify 定制属性透传到图标的 `svg`。最外层是 `relative inline-flex` 容器，
仅为 `#badge` 定位存在。
