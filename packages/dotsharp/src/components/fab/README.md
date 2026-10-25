<script setup lang="ts">
import { ref } from "vue";
import { Fab, FabMenu } from "@sharpdotnut/dotsharp";
import addIcon from "@iconify-icons/material-symbols/add";
import editIcon from "@iconify-icons/material-symbols/edit";
import documentIcon from "@iconify-icons/material-symbols/description";
import messageIcon from "@iconify-icons/material-symbols/chat";
import folderIcon from "@iconify-icons/material-symbols/folder";

const clicks = ref(0);
const lastAction = ref("—");
const menuOpen = ref(false);
</script>

# Fab 悬浮操作按钮

`Fab` 是一个悬浮在内容之上的主操作按钮：只有一个图标时是方形，带 `label`（或默认插槽）时变成扩展 FAB。
`FabMenu` 在它之上叠一列扩展 FAB，用于把几个相关操作收进同一个入口。

## 颜色

`variant` 决定容器配色：`primary`（默认，主色容器）、`secondary`（浅色调容器）、`surface`（浮起的表面色）。

<div class="demo-row">
  <Fab :icon="editIcon" variant="primary" aria-label="编辑" />
  <Fab :icon="editIcon" variant="secondary" aria-label="编辑" />
  <Fab :icon="editIcon" variant="surface" aria-label="编辑" />
</div>

```vue
<script setup lang="ts">
import { Fab } from "@sharpdotnut/dotsharp";
import editIcon from "@iconify-icons/material-symbols/edit";
</script>

<template>
  <Fab :icon="editIcon" variant="primary" aria-label="编辑" />
  <Fab :icon="editIcon" variant="secondary" aria-label="编辑" />
  <Fab :icon="editIcon" variant="surface" aria-label="编辑" />
</template>
```

图标按钮没有可见文字，必须用 `aria-label` 给出无障碍名称。

## 尺寸与阴影

`size` 有三种：`sm`（40px）、`md`（默认，56px）、`lg`（96px）。`lowered` 加一层更深的阴影，
适合悬浮在已有阴影的内容之上。

<div class="demo-row">
  <Fab :icon="addIcon" size="sm" aria-label="新建" />
  <Fab :icon="addIcon" aria-label="新建" />
  <Fab :icon="addIcon" size="lg" aria-label="新建" />
  <Fab :icon="addIcon" lowered aria-label="新建" />
</div>

```vue
<Fab :icon="addIcon" size="sm" aria-label="新建" />
<Fab :icon="addIcon" aria-label="新建" />
<Fab :icon="addIcon" size="lg" aria-label="新建" />
<Fab :icon="addIcon" lowered aria-label="新建" />
```

## 扩展 FAB

给出 `label` 即变成扩展 FAB（图标 + 文字，宽度由内容撑开）；默认插槽可以放比纯文本更自由的内容。

<div class="demo-row">
  <Fab :icon="editIcon" label="编辑" @click="clicks++" />
</div>

点击了 {{ clicks }} 次

```vue
<script setup lang="ts">
import { ref } from "vue";
import { Fab } from "@sharpdotnut/dotsharp";
import editIcon from "@iconify-icons/material-symbols/edit";

const clicks = ref(0);
</script>

<template>
  <Fab :icon="editIcon" label="编辑" @click="clicks++" />
</template>
```

## FAB 菜单

`FabMenu` 的默认插槽放一列扩展 `Fab`：展开后它们从触发按钮上方依次出现，触发按钮的图标同时换成关闭图标。
点选任意一项、点击外部或按 `Esc` 都会收起，收起后焦点回到触发按钮。

<div class="demo-row">
  <FabMenu v-model:open="menuOpen" label="新建">
    <Fab
      :icon="documentIcon"
      label="文档"
      variant="secondary"
      @click="lastAction = '文档'"
    />
    <Fab :icon="messageIcon" label="消息" variant="secondary" @click="lastAction = '消息'" />
    <Fab :icon="folderIcon" label="文件夹" variant="secondary" @click="lastAction = '文件夹'" />
  </FabMenu>
</div>

最后选择：{{ lastAction }}（当前{{ menuOpen ? "展开" : "收起" }}）

```vue
<script setup lang="ts">
import { Fab, FabMenu } from "@sharpdotnut/dotsharp";
import documentIcon from "@iconify-icons/material-symbols/description";
import messageIcon from "@iconify-icons/material-symbols/chat";
import folderIcon from "@iconify-icons/material-symbols/folder";
</script>

<template>
  <FabMenu label="新建">
    <Fab :icon="documentIcon" label="文档" variant="secondary" />
    <Fab :icon="messageIcon" label="消息" variant="secondary" />
    <Fab :icon="folderIcon" label="文件夹" variant="secondary" />
  </FabMenu>
</template>
```

- 菜单里的每个 `Fab` 会被补上 `role="menuitem"`，容器是 `role="menu"`。
- 展开时焦点自动落到第一项；`↑` / `↓` 在菜单项之间循环，`Home` / `End` 跳到两端。
- 点击菜单外只收起、不抢焦点；`Esc` 或选中任意一项收起后，焦点回到触发按钮。

## API

### Fab

| 属性     | 类型                                    | 默认值      | 说明                             |
| -------- | --------------------------------------- | ----------- | -------------------------------- |
| icon     | `IconifyIcon \| string`                 | —           | 前置图标；图标尺寸随 `size` 缩放 |
| label    | `string`                                | —           | 文本标签，给出即成为扩展 FAB     |
| variant  | `"primary" \| "secondary" \| "surface"` | `"primary"` | 容器配色                         |
| size     | `"sm" \| "md" \| "lg"`                  | `"md"`      | 40 / 56 / 96px                   |
| lowered  | `boolean`                               | `false`     | 加深阴影                         |
| disabled | `boolean`                               | `false`     | 禁用                             |
| type     | `"button" \| "submit" \| "reset"`       | `"button"`  | 原生按钮类型                     |

- 根元素是原生 `button`，其余属性与事件透传到该元素。
- 默认插槽是文字区域，优先于 `label`；只给插槽不给 `label` 也会渲染成扩展 FAB。

### FabMenu

| 属性    | 类型                                    | 默认值      | 说明                                 |
| ------- | --------------------------------------- | ----------- | ------------------------------------ |
| label   | `string`                                | —           | 触发按钮的 `aria-label`，必填        |
| icon    | `IconifyIcon \| string`                 | 加号        | 收起状态的触发图标；展开后固定为关闭 |
| variant | `"primary" \| "secondary" \| "surface"` | `"primary"` | 触发按钮配色                         |
| size    | `"sm" \| "md" \| "lg"`                  | `"md"`      | 触发按钮尺寸                         |

| 模型         | 类型      | 默认值  | 说明         |
| ------------ | --------- | ------- | ------------ |
| v-model:open | `boolean` | `false` | 菜单是否展开 |

- 默认插槽：菜单项，写成扩展 `Fab`。
- 根元素是 `div`，其余属性与事件透传到该元素。
