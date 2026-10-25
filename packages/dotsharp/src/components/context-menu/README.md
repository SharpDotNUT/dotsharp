<script setup lang="ts">
import { ref } from "vue";
import { ContextMenu, Divider, MenuItem } from "@sharpdotnut/dotsharp";
import contentCopy from "@iconify-icons/material-symbols/content-copy";
import contentCut from "@iconify-icons/material-symbols/content-cut";
import contentPaste from "@iconify-icons/material-symbols/content-paste";
import deleteIcon from "@iconify-icons/material-symbols/delete";
import undo from "@iconify-icons/material-symbols/undo";

const picked = ref<string | number>("—");
</script>

# ContextMenu 上下文菜单

`ContextMenu` 在目标区域上右键时，于指针位置展开一个 `Menu`。菜单内容通过 `#menu` 插槽传入，
写法与 `Menu` 的默认插槽完全一致。

- 右键（`contextmenu`）在指针位置展开，菜单会自动避让视口边缘；
- `Shift+F10` 或键盘菜单键在焦点元素的右下角展开；
- 点击外部、`Escape`、选中菜单项都会关闭；
- 菜单项、分隔线、二级菜单直接用 `MenuItem` / `Divider` / `#submenu` 组合，与 `Menu` 相同。

## 基础用法

<div class="demo-row">
  <ContextMenu @select="picked = $event">
    <p class="m-0 rounded-ds-lg border border-dashed border-ds-outline p-6 text-sm text-ds-muted">
      在阅读区任意位置右键（或聚焦后按 Shift+F10）打开菜单。
    </p>
    <template #menu>
      <MenuItem label="撤销" :icon="undo" shortcut="⌘Z" />
      <MenuItem label="复制" :icon="contentCopy" shortcut="⌘C" />
      <MenuItem label="剪切" :icon="contentCut" shortcut="⌘X" />
      <MenuItem label="粘贴" :icon="contentPaste" shortcut="⌘V" />
      <Divider class="my-2" />
      <MenuItem label="删除" :icon="deleteIcon" />
    </template>
  </ContextMenu>
</div>

当前选中：{{ picked }}

```vue
<script setup lang="ts">
import { ref } from "vue";
import { ContextMenu, Divider, MenuItem } from "@sharpdotnut/dotsharp";
import contentCopy from "@iconify-icons/material-symbols/content-copy";
import undo from "@iconify-icons/material-symbols/undo";

const picked = ref<string | number>("—");
</script>

<template>
  <ContextMenu @select="picked = $event">
    <p>在这里右键。</p>
    <template #menu>
      <MenuItem label="撤销" :icon="undo" shortcut="⌘Z" />
      <MenuItem label="复制" :icon="contentCopy" shortcut="⌘C" />
      <Divider class="my-2" />
      <MenuItem label="删除" />
    </template>
  </ContextMenu>
</template>
```

`ContextMenu` 的根元素是 `display: contents` 容器：它只负责挂载右键监听，不参与布局，因此不会改变目标区域的
排版。它的属性（如 `class`）落在这个容器上，但 `display: contents` 的元素不绘制背景与内边距——需要样式时
请写在默认插槽的内容上。

## 禁用与二级菜单

`disabled` 为 `true` 时不响应右键；`#menu` 里照常使用 `MenuItem`，包括 `#submenu` 的二级菜单和 `disabled` 菜单项。

```vue
<ContextMenu disabled>
  <span>禁用的区域</span>
  <template #menu>
    <MenuItem label="复制" />
  </template>
</ContextMenu>
```

```vue
<ContextMenu>
  <span>右键我</span>
  <template #menu>
    <MenuItem label="创建" :icon="create">
      <template #submenu>
        <MenuItem label="文档" />
        <MenuItem label="图片" />
      </template>
    </MenuItem>
  </template>
</ContextMenu>
```

## API

| 属性     | 类型      | 默认值  | 说明                         |
| -------- | --------- | ------- | ---------------------------- |
| disabled | `boolean` | `false` | 禁用：不响应右键与键盘菜单键 |

- 插槽：`default`（右键目标区域）、`menu`（菜单内容）。
- 事件：`select(value)`，来自内部 `Menu`，`value` 是被选中项的 `value` 或索引。
- 不在菜单里另做焦点限制：展开后焦点进入第一个菜单项，关闭时交还给展开前的焦点元素。
