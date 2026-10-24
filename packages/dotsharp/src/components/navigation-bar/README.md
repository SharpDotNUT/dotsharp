<script setup lang="ts">
import { ref } from "vue";
import { NavigationBar, NavigationItem } from "@sharpdotnut/dotsharp";
import explore from "@iconify-icons/material-symbols/explore";
import home from "@iconify-icons/material-symbols/home";
import libraryMusic from "@iconify-icons/material-symbols/library-music";
import radio from "@iconify-icons/material-symbols/radio";

const compact = ref("home");
const medium = ref("home");
const index = ref(0);
</script>

# NavigationBar 导航栏

由 `NavigationBar` 与 `NavigationItem` 组合而成：`NavigationBar` 持有选中值（`v-model:value`），每个 `NavigationItem` 描述一项导航。

- 所有 `NavigationItem` 平分 `NavigationBar` 的宽度，与文字长短无关。
- 选中项有一个浅色胶囊：`compact` 只包住图标，`medium` 包住图标与文字。
- `NavigationItem` 的标识默认为自身索引，也可以用 `value` 指定。

## compact 标签栏

默认排版：图标在上、文字在下，选中项高亮图标（胶囊 + 主色），文字保持中性色，适合移动端底栏。

<div class="demo-row">
  <NavigationBar v-model:value="compact">
    <NavigationItem label="首页" value="home" :icon="home" />
    <NavigationItem label="发现" value="browse" :icon="explore" />
    <NavigationItem label="电台" value="radio" :icon="radio" />
    <NavigationItem label="音乐库" value="library" :icon="libraryMusic" />
  </NavigationBar>
</div>

当前选中值：{{ compact }}

```vue
<script setup lang="ts">
import { ref } from "vue";
import { NavigationBar, NavigationItem } from "@sharpdotnut/dotsharp";
import explore from "@iconify-icons/material-symbols/explore";
import home from "@iconify-icons/material-symbols/home";
import libraryMusic from "@iconify-icons/material-symbols/library-music";
import radio from "@iconify-icons/material-symbols/radio";

const current = ref("home");
</script>

<template>
  <NavigationBar v-model:value="current">
    <NavigationItem label="首页" value="home" :icon="home" />
    <NavigationItem label="发现" value="browse" :icon="explore" />
    <NavigationItem label="电台" value="radio" :icon="radio" />
    <NavigationItem label="音乐库" value="library" :icon="libraryMusic" />
  </NavigationBar>
</template>
```

## medium 横向导航

`variant="medium"` 时图标与文字左右排列，选中项高亮图标与文字。用 `max-width` 限制整条导航的最大宽度，超出后居中留白，各项仍在最大宽度内平分。

<div class="demo-row">
  <NavigationBar v-model:value="medium" variant="medium" max-width="34rem">
    <NavigationItem label="首页" value="home" :icon="home" />
    <NavigationItem label="发现" value="browse" :icon="explore" />
    <NavigationItem label="电台" value="radio" :icon="radio" />
    <NavigationItem label="音乐库" value="library" :icon="libraryMusic" />
  </NavigationBar>
</div>

当前选中值：{{ medium }}

```vue
<NavigationBar v-model:value="current" variant="medium" max-width="34rem">
  <NavigationItem label="首页" value="home" :icon="home" />
  <NavigationItem label="发现" value="browse" :icon="explore" />
  <NavigationItem label="电台" value="radio" :icon="radio" />
  <NavigationItem label="音乐库" value="library" :icon="libraryMusic" />
</NavigationBar>
```

`max-width` 既接受 CSS 长度字符串（`"34rem"`、`"480px"`），也接受数字（按 px 处理）；省略时不限制宽度。

## 标识：value 与索引

`NavigationItem` 省略 `value` 时用自己的数字索引（从 `0` 开始）作为标识。`NavigationBar` 的 `v-model:value` 默认是 `0`，所以首项默认选中。

<div class="demo-row">
  <NavigationBar v-model:value="index" variant="medium" max-width="34rem">
    <NavigationItem label="首页" :icon="home" />
    <NavigationItem label="发现" :icon="explore" />
    <NavigationItem label="电台" :icon="radio" />
  </NavigationBar>
</div>

当前选中索引：{{ index }}

```vue
<script setup lang="ts">
import { ref } from "vue";
import { NavigationBar, NavigationItem } from "@sharpdotnut/dotsharp";

const index = ref(0);
</script>

<template>
  <NavigationBar v-model:value="index" variant="medium">
    <NavigationItem label="首页" :icon="home" />
    <NavigationItem label="发现" :icon="explore" />
    <NavigationItem label="电台" :icon="radio" />
  </NavigationBar>
</template>
```

索引由 `NavigationBar` 按声明顺序注入，只统计 `NavigationItem` 子项本身；`v-if` 增删、`v-for` 循环都按最终渲染顺序重新编号。需要跨版本稳定的标识时显式传 `value`。

## 内容：label、icon 与插槽

- `label`：纯文本；
- `icon`：与 `Icon` 的 `icon` 同源，直接给图标数据（尺寸 `1.5em`，跟随字号）；
- 默认插槽：其它自定义内容，**优先于 `label`**——插槽与 `label` 同时存在时 `label` 不参与渲染。

`icon` 可以省略，此时只剩文字或插槽内容：

```vue
<NavigationItem label="只有文字" value="text" />
<NavigationItem value="badge" :icon="radio">
  <span>带徽标</span>
  <span class="ml-1 rounded-full bg-ds-primary px-1.5 text-xs text-ds-on-primary">3</span>
</NavigationItem>
```

长文字会把超出部分截断成省略号，不会撑破导航栏。

## API

### NavigationBar

| 属性          | 类型                    | 默认值      | 说明                                                      |
| ------------- | ----------------------- | ----------- | --------------------------------------------------------- |
| v-model:value | `string \| number`      | `0`         | 当前选中值，对应子项的 `value` 或索引                     |
| variant       | `"compact" \| "medium"` | `"compact"` | `compact` 图标在上、文字在下；`medium` 图标与文字左右排列 |
| max-width     | `string \| number`      | —           | 最大宽度；数字按 px 处理，导航栏在最大宽度内居中          |

根元素是 `<nav>`，其余属性与事件透传到该元素。

### NavigationItem

| 属性  | 类型                    | 默认值       | 说明                                             |
| ----- | ----------------------- | ------------ | ------------------------------------------------ |
| label | `string`                | —            | 纯文本内容；存在默认插槽时被插槽覆盖             |
| icon  | `IconifyIcon \| string` | —            | 图标，渲染在文字/插槽之前，尺寸 `1.5em` 跟随字号 |
| value | `string \| number`      | 所在位置索引 | 子项标识                                         |

- 所有子项平分导航栏宽度，点击区域是整块格子，而高亮胶囊只包住内容。
- 默认插槽：导航项内容，优先于 `label`；与 `icon` 同时使用时插槽内容排在图标之后。
- 根元素是 `type="button"` 的 `button`，其余属性与事件透传到该按钮。
- 选中项带 `aria-current="page"`；点击已选中的项不会重复写模型，也不会触发 `update:value`。

### 可访问性

`NavigationBar` 输出 `<nav>`，`NavigationItem` 是原生 `button`，可聚焦、可用回车/空格激活，选中项同步 `aria-current="page"`。焦点环画在整个导航项格子上（`outline-ds-focus`，负偏移），不改变布局。需要与路由链接挂钩时，使用方在点击后自行导航；面板内容不在本组件内。
