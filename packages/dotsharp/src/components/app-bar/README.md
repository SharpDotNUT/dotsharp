<script setup lang="ts">
import { ref } from "vue";
import { AppBar, IconButton, Input } from "@sharpdotnut/dotsharp";
import accountCircle from "@iconify-icons/material-symbols/account-circle";
import arrowBack from "@iconify-icons/material-symbols/arrow-back";
import calendarMonth from "@iconify-icons/material-symbols/calendar-month";
import menu from "@iconify-icons/material-symbols/menu";
import search from "@iconify-icons/material-symbols/search";

const keyword = ref("");
</script>

# AppBar 顶部应用栏

顶部应用栏：左侧操作区、标题区、右侧操作区三段结构，标题区可以换成任意内容。

- 标题区优先取默认插槽，`title` 只是纯文本回退。
- `#left` / `#right` 是两侧操作区，推荐放 `IconButton`：40×40 圆形点击区，图标 24px，相邻图标的字形间距约 20px。
- `variant` 三档：`small` 单行；`medium-flexible` / `large-flexible` 的标题另起一行、字号逐级变大，
  并可用 `subtitle` 加一行副标题。
- `fixed` 把栏留在原位之外的视口顶部，`placeholder` 在文档流里补一个等高占位元素，页面内容不会被抽走。

## small 应用栏

默认排版：单行，高度 64px。左侧是菜单按钮，中间是搜索栏（默认插槽），右侧是账户按钮。

搜索栏用 `Input` 的 `shape="pill"`：无描边、浅色填充、40px 高的胶囊形。

<div class="demo-row">
  <AppBar>
    <template #left>
      <IconButton :icon="menu" label="打开菜单" />
    </template>
    <Input v-model="keyword" shape="pill" type="search" placeholder="搜索" />
    <template #right>
      <IconButton :icon="accountCircle" label="账户" />
    </template>
  </AppBar>
</div>

```vue
<script setup lang="ts">
import { ref } from "vue";
import { AppBar, IconButton, Input } from "@sharpdotnut/dotsharp";
import accountCircle from "@iconify-icons/material-symbols/account-circle";
import menu from "@iconify-icons/material-symbols/menu";

const keyword = ref("");
</script>

<template>
  <AppBar>
    <template #left>
      <IconButton :icon="menu" label="打开菜单" />
    </template>
    <Input v-model="keyword" shape="pill" type="search" placeholder="搜索" />
    <template #right>
      <IconButton :icon="accountCircle" label="账户" />
    </template>
  </AppBar>
</template>
```

## 标题与两侧操作

`title` 渲染在左侧操作区之后，过长时截断为省略号。右侧可以放多个操作按钮。

<div class="demo-row">
  <AppBar title="小号应用栏">
    <template #left>
      <IconButton :icon="arrowBack" label="返回" />
    </template>
    <template #right>
      <IconButton :icon="search" label="搜索" />
      <IconButton :icon="calendarMonth" label="日历" />
    </template>
  </AppBar>
</div>

```vue
<AppBar title="小号应用栏">
  <template #left>
    <IconButton :icon="arrowBack" label="返回" />
  </template>
  <template #right>
    <IconButton :icon="search" label="搜索" />
    <IconButton :icon="calendarMonth" label="日历" />
  </template>
</AppBar>
```

两侧插槽之间的 `gap` 是 4px，而 `IconButton` 自身有 8px 内边距，所以相邻图标的字形间距是 20px；直接放裸 `<Icon>` 会贴在一起。

## medium-flexible / large-flexible 应用栏

`variant="medium-flexible"`、`variant="large-flexible"` 把标题移到单独一行：
第一行只有两侧操作区，第二行是标题（`large-flexible` 字号 36px，`medium-flexible` 28px）。

高度按是否有副标题分两档：

| variant           | 无副标题 | 有副标题 |
| ----------------- | -------- | -------- |
| `medium-flexible` | 112px    | 136px    |
| `large-flexible`  | 120px    | 152px    |

副标题用 `subtitle`，或用 `#subtitle` 插槽给自定义内容；`small` 变体忽略 `subtitle`。

<div class="demo-row">
  <AppBar title="中号灵活应用栏" variant="medium-flexible">
    <template #left>
      <IconButton :icon="arrowBack" label="返回" />
    </template>
    <template #right>
      <IconButton :icon="search" label="搜索" />
      <IconButton :icon="calendarMonth" label="日历" />
    </template>
  </AppBar>
</div>

<div class="demo-row">
  <AppBar title="大号灵活应用栏" variant="large-flexible" subtitle="带副标题">
    <template #left>
      <IconButton :icon="arrowBack" label="返回" />
    </template>
    <template #right>
      <IconButton :icon="search" label="搜索" />
      <IconButton :icon="calendarMonth" label="日历" />
    </template>
  </AppBar>
</div>

```vue
<AppBar title="中号灵活应用栏" variant="medium-flexible">
  <template #left>
    <IconButton :icon="arrowBack" label="返回" />
  </template>
  <template #right>
    <IconButton :icon="search" label="搜索" />
    <IconButton :icon="calendarMonth" label="日历" />
  </template>
</AppBar>

<AppBar title="大号灵活应用栏" variant="large-flexible" subtitle="带副标题">
  <template #left>
    <IconButton :icon="arrowBack" label="返回" />
  </template>
  <template #right>
    <IconButton :icon="search" label="搜索" />
    <IconButton :icon="calendarMonth" label="日历" />
  </template>
</AppBar>
```

默认插槽在 flexible 变体下渲染在标题那一行，同样优先于 `title`；`subtitle` 渲染在标题下方，
文字颜色是 `--ds-muted`（`medium-flexible` 14px，`large-flexible` 16px）。

## 固定与占位

`fixed` 让应用栏脱离文档流、固定在视口顶部（`position: fixed`，横向铺满），因此它是相对组件外部的视口定位的，不再占据内容区的高度。

`placeholder` 在文档流里输出一个与之等高的空元素，避免内容被应用栏盖住或上移。高度是实测的（`ResizeObserver`），标题区放了插槽内容也能跟上；服务端渲染与挂载前退回 `variant` 的名义高度。

```vue
<template>
  <AppBar title="固定应用栏" fixed placeholder>
    <template #left>
      <IconButton :icon="arrowBack" label="返回" />
    </template>
  </AppBar>
  <main>页面内容</main>
</template>
```

`placeholder` 只在 `fixed` 时生效；不固定时应用栏本来就在文档流里，占位元素会平白多出一块空白。

## API

### AppBar

| 属性        | 类型                                               | 默认值    | 说明                                                         |
| ----------- | -------------------------------------------------- | --------- | ------------------------------------------------------------ |
| title       | `string`                                           | —         | 标题纯文本；存在默认插槽时被插槽覆盖                         |
| variant     | `"small" \| "medium-flexible" \| "large-flexible"` | `"small"` | 排版与高度：`small` 单行，flexible 变体标题另起一行          |
| subtitle    | `string`                                           | —         | 副标题纯文本，仅 flexible 变体；存在 `subtitle` 插槽时被覆盖 |
| fixed       | `boolean`                                          | `false`   | 固定在视口顶部（`position: fixed`，横向铺满，`z-40`）        |
| placeholder | `boolean`                                          | `false`   | 仅 `fixed` 时生效：输出等高占位元素                          |

- 根元素是 `<header>`，其余属性与事件透传到该元素。
- 三段结构：`#left` 操作区、默认插槽（标题区）、`#right` 操作区；两侧插槽为空时不占位。
- 两侧插槽默认字号 `1.5rem`、间距 4px，配合 `IconButton` 得到 24px 图标与约 20px 的字形间距。
- 高度：`small` 64px；`medium-flexible` 112px / 有副标题 136px；`large-flexible` 120px / 有副标题 152px。
- `title` 超过可用宽度时截断；默认插槽的内容由使用方自己控制溢出。

### 插槽

| 插槽     | 说明                                                  |
| -------- | ----------------------------------------------------- |
| default  | 标题区内容，优先于 `title`；flexible 变体下位于第二行 |
| subtitle | 副标题内容，优先于 `subtitle`；仅 flexible 变体渲染   |
| left     | 左侧操作区，标题之前                                  |
| right    | 右侧操作区                                            |

### 可访问性

应用栏是语义化的 `<header>`，本身不可交互；两侧操作区用 `IconButton`（原生 `button` + `aria-label`）即可获得可聚焦、可读屏的按钮。固定时插入的占位元素带 `aria-hidden="true"`，不会被读屏读取。
