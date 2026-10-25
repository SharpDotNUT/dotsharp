# 图标

库本身不内置图标集合，只提供 `Icon` 这个渲染入口。图标数据由使用方按需引入：打包时只保留真正用到的图标，
运行时也不发网络请求。

```vue
<script setup lang="ts">
import { Icon } from "@sharpdotnut/dotsharp";
import home from "@iconify-icons/material-symbols/home";
</script>

<template>
  <Icon :icon="home" />
</template>
```

需要图标的地方统一传图标数据，而不是图标名：`Icon` 的 `icon` 属性、`Tab` / `NavigationItem` 等子项的 `icon`
属性、`IconButton` 的 `icon` 属性都接受同一个数据对象。

## 安装图标集

图标数据来自 [Iconify](https://iconify.design/) 的图标包，按单个图标 `import` 即可：

```bash
pnpm add @iconify-icons/material-symbols
```

```ts
import home from "@iconify-icons/material-symbols/home";
import homeOutline from "@iconify-icons/material-symbols/home-outline";
import search from "@iconify-icons/material-symbols/search";
```

- 图标名与图标集的命名一致，可用后缀选风格：`home`、`home-outline`、`home-rounded`、`home-sharp` 等。
- 其他图标集同理：`@iconify-icons/mdi/home`、`@iconify-icons/tabler/home`、`@iconify-icons/lucide/home`……
- 同一页面图标很多时，可以先用 `addIcon` / `addCollection` 注册，再按名字传入，行为与 `@iconify/vue` 一致。

## 尺寸与颜色

`Icon` 的 `size` 默认 `1em`，跟随所在文字的字号；传数字按像素处理。颜色默认 `currentColor`，因此用
`text-ds-*` 工具类即可改变图标颜色，`Icon` 的 `color` 属性用于单独指定颜色。

```vue
<script setup lang="ts">
import { Button, Icon } from "@sharpdotnut/dotsharp";
import edit from "@iconify-icons/material-symbols/edit";
import home from "@iconify-icons/material-symbols/home";
</script>

<template>
  <Icon :icon="home" />
  <Icon :icon="home" :size="32" class="text-ds-primary-strong" />
  <Button>
    <Icon :icon="edit" size="1.125em" />
    编辑
  </Button>
</template>
```

其它组件内部的图标尺寸已按各自排版固定（例如 `IconButton` 为 `1.5rem`），需要不同尺寸时用插槽放 `Icon`
并传 `size`。

## 无障碍

图标默认按装饰处理：输出 `aria-hidden="true"` 与 `focusable="false"`，读屏会跳过。图标本身承载语义时
（例如只有图标的按钮），用 `label` 提供名称：

```vue
<Icon :icon="favorite" label="收藏" />
```

只有图标的按钮应给按钮本身设置 `label`（`IconButton` 的 `label` 属性），而不是只依赖图标内部的名称。

## 不要使用图标名字符串

`icon` 也接受 `"material-symbols:home"` 这类字符串，但字符串会在运行时向 Iconify API 请求数据。
离线、内网或对首屏有要求的项目应始终传入 `import` 得到的图标数据。

## 下一步

- [Icon 图标](/components/icon)：`Icon` 的属性、`#badge` 插槽与完整示例。
- [父子组件以及插槽统一范式](/guide/patterns)：子项如何用 `icon` 属性或插槽描述内容。
