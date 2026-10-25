<script setup lang="ts">
import { ref } from "vue";
import { Button, Divider, Menu, MenuItem } from "@sharpdotnut/dotsharp";
import contentCopy from "@iconify-icons/material-symbols/content-copy";
import create from "@iconify-icons/material-symbols/edit";
import deleteIcon from "@iconify-icons/material-symbols/delete";
import description from "@iconify-icons/material-symbols/description";
import download from "@iconify-icons/material-symbols/download";
import help from "@iconify-icons/material-symbols/help";
import image from "@iconify-icons/material-symbols/image";
import redo from "@iconify-icons/material-symbols/redo";
import settings from "@iconify-icons/material-symbols/settings";
import share from "@iconify-icons/material-symbols/share";
import slideshow from "@iconify-icons/material-symbols/slideshow";
import undo from "@iconify-icons/material-symbols/undo";

const picked = ref<string | number>("—");
const offline = ref(true);
const anchor = ref<HTMLElement | null>(null);
const anchored = ref(false);
const anchoredPicked = ref<string | number>("—");
</script>

# Menu 菜单

由 `Menu` 与 `MenuItem` 组合而成：`Menu` 是弹出层容器，每个 `MenuItem` 描述一个菜单项。

- 菜单面板渲染到 `body`，底色 `bg-ds-elevated`、阴影 `shadow-ds-2`、圆角 `rounded-ds-sm`、上下内边距 `py-2`——与 `Select` 的弹层同一套规格。
- 触发元素由 `#trigger` 插槽描述，也可以省略插槽、用 `anchor` 指定贴靠元素，或用 `x` / `y` 直接定位（上下文菜单）。
- `MenuItem` 支持前置图标、辅助说明、尾部快捷键 / 自定义内容、禁用、勾选态。
- 菜单项里放 `#submenu` 插槽即成为二级菜单，悬停、点击或 `→` 展开。
- 键盘遵循 ARIA menu 模式：方向键、`Home` / `End` 移动焦点，`→` / `Enter` 进入子菜单，`←` 返回上级，`Escape` 关闭整棵菜单。

## 基础用法

`#trigger` 插槽里的元素会被自动补上 `aria-haspopup` / `aria-expanded`，点击即可展开；`Menu` 的 `select` 事件带上被选中项的标识（`value`，省略时是该项的索引）。

<div class="demo-row">
  <Menu @select="picked = $event">
    <template #trigger>
      <Button variant="tonal">更多操作</Button>
    </template>
    <MenuItem label="撤销" :icon="undo" shortcut="⌘Z" />
    <MenuItem label="重做" :icon="redo" shortcut="⇧⌘Z" disabled />
    <MenuItem label="删除" :icon="deleteIcon" />
  </Menu>
</div>

当前选中：{{ picked }}

```vue
<script setup lang="ts">
import { ref } from "vue";
import { Button, Menu, MenuItem } from "@sharpdotnut/dotsharp";
import deleteIcon from "@iconify-icons/material-symbols/delete";
import redo from "@iconify-icons/material-symbols/redo";
import undo from "@iconify-icons/material-symbols/undo";

const picked = ref<string | number>("—");
</script>

<template>
  <Menu @select="picked = $event">
    <template #trigger>
      <Button variant="tonal">更多操作</Button>
    </template>
    <MenuItem label="撤销" :icon="undo" shortcut="⌘Z" />
    <MenuItem label="重做" :icon="redo" shortcut="⇧⌘Z" disabled />
    <MenuItem label="删除" :icon="deleteIcon" />
  </Menu>
</template>
```

`Menu` 的属性与事件透传到菜单面板；触发元素自己的类名与事件照常写在自己的标签上。

## 受控展开

`Menu` 用 `v-model:open` 暴露展开状态，需要在代码里开关时绑定它：

```vue
<script setup lang="ts">
import { ref } from "vue";
import { Button, Menu, MenuItem } from "@sharpdotnut/dotsharp";
import settings from "@iconify-icons/material-symbols/settings";

const open = ref(false);
</script>

<template>
  <Menu v-model:open="open">
    <template #trigger>
      <Button>更多操作</Button>
    </template>
    <MenuItem label="设置" :icon="settings" />
  </Menu>
</template>
```

点击外部、按 `Escape`、选中菜单项都会写回 `open`。

## 图标、说明文字与快捷键

- `icon`：前置图标，与 `Icon` 的 `icon` 同源；
- `description`：主文本下方的辅助说明，自动切成两行排版；
- `shortcut`：尾部快捷键文本；
- `#trailing` 插槽：角标、自定义元素等尾部内容，排在快捷键之后。

<div class="demo-row">
  <Menu>
    <template #trigger>
      <Button variant="outlined">文件</Button>
    </template>
    <MenuItem label="创建副本" :icon="contentCopy" description="保存到同一文件夹" shortcut="⌘D" />
    <MenuItem label="重命名" :icon="create">
      <template #trailing>
        <span class="rounded-ds-sm bg-ds-tonal px-1.5 py-0.5 text-xs text-ds-on-tonal">新</span>
      </template>
    </MenuItem>
    <MenuItem label="分享" :icon="share" disabled />
  </Menu>
</div>

```vue
<Menu>
  <template #trigger>
    <Button variant="outlined">文件</Button>
  </template>
  <MenuItem label="创建副本" :icon="contentCopy" description="保存到同一文件夹" shortcut="⌘D" />
  <MenuItem label="重命名" :icon="create">
    <template #trailing>
      <span class="rounded-ds-sm bg-ds-tonal px-1.5 py-0.5 text-xs text-ds-on-tonal">新</span>
    </template>
  </MenuItem>
  <MenuItem label="分享" :icon="share" disabled />
</Menu>
```

需要完全自定义行内容时用默认插槽，插槽优先于 `label`：

```vue
<MenuItem value="custom">
  <span class="font-medium">保存全部</span>
</MenuItem>
```

## 勾选态

给 `checked` 一个布尔值，菜单项即成为 `role="menuitemcheckbox"`，前置位置显示勾选标记（`checked` 为 `false` 时保留空位，文字不会跳动）。勾选标记优先于 `icon`。

可勾选项与普通菜单项的区别在点击后的收尾：**切换勾选态后菜单保持展开**，方便连续开关多项；普通菜单项选中即收起整棵菜单。

<div class="demo-row">
  <Menu>
    <template #trigger>
      <Button variant="tonal">偏好设置</Button>
    </template>
    <MenuItem
      label="离线模式"
      :checked="offline"
      shortcut="⌘O"
      @select="offline = !offline"
    />
    <MenuItem label="显示网格" :checked="false" disabled />
  </Menu>
</div>

离线模式：{{ offline ? "开" : "关" }}

```vue
<script setup lang="ts">
import { ref } from "vue";
import { Button, Menu, MenuItem } from "@sharpdotnut/dotsharp";

const offline = ref(true);
</script>

<template>
  <Menu>
    <template #trigger>
      <Button variant="tonal">偏好设置</Button>
    </template>
    <MenuItem label="离线模式" :checked="offline" shortcut="⌘O" @select="offline = !offline" />
    <MenuItem label="显示网格" :checked="false" disabled />
  </Menu>
</template>
```

## 分隔线

菜单里可直接放 `Divider`（以及任何普通元素，例如分组标题）：

<div class="demo-row">
  <Menu>
    <template #trigger>
      <Button variant="outlined">整理</Button>
    </template>
    <MenuItem label="撤销" :icon="undo" shortcut="⌘Z" />
    <MenuItem label="重做" :icon="redo" shortcut="⇧⌘Z" />
    <Divider class="my-2" />
    <MenuItem label="设置" :icon="settings" />
    <MenuItem label="帮助与反馈" :icon="help" />
  </Menu>
</div>

```vue
<Menu>
  <template #trigger>
    <Button variant="outlined">整理</Button>
  </template>
  <MenuItem label="撤销" :icon="undo" shortcut="⌘Z" />
  <MenuItem label="重做" :icon="redo" shortcut="⇧⌘Z" />
  <Divider class="my-2" />
  <MenuItem label="设置" :icon="settings" />
  <MenuItem label="帮助与反馈" :icon="help" />
</Menu>
```

## 二级菜单

`MenuItem` 的 `#submenu` 插槽里放菜单项，该行尾部自动出现展开箭头。子菜单贴在本项右侧、上对齐，空间不足时翻到左侧。

<div class="demo-row">
  <Menu>
    <template #trigger>
      <Button variant="tonal">新建</Button>
    </template>
    <MenuItem label="创建" :icon="create">
      <template #submenu>
        <MenuItem label="文档" :icon="description" />
        <MenuItem label="图片" :icon="image" />
        <MenuItem label="幻灯片" :icon="slideshow" />
      </template>
    </MenuItem>
    <MenuItem label="下载" :icon="download">
      <template #submenu>
        <MenuItem label="原始文件" />
        <MenuItem label="PDF" />
      </template>
    </MenuItem>
    <Divider class="my-2" />
    <MenuItem label="分享" :icon="share" />
  </Menu>
</div>

```vue
<Menu>
  <template #trigger>
    <Button variant="tonal">新建</Button>
  </template>
  <MenuItem label="创建" :icon="create">
    <template #submenu>
      <MenuItem label="文档" :icon="description" />
      <MenuItem label="图片" :icon="image" />
      <MenuItem label="幻灯片" :icon="slideshow" />
    </template>
  </MenuItem>
  <MenuItem label="下载" :icon="download">
    <template #submenu>
      <MenuItem label="原始文件" />
      <MenuItem label="PDF" />
    </template>
  </MenuItem>
  <Divider class="my-2" />
  <MenuItem label="分享" :icon="share" />
</Menu>
```

- 指针悬停 120ms 展开，移出菜单项后 200ms 收起；
- 点击本项（或 `→` / `Enter`）展开，焦点进入子菜单第一项；
- 子菜单里的 `←` 收起到父菜单项，`Escape` 同样只收起这一级；
- 选中任意层级的菜单项会收起整棵菜单，并把焦点还给最初的触发元素。

## 贴靠元素定位

不使用 `#trigger` 时，用 `anchor` 指定贴靠元素（通常给触发按钮套一层带 `ref` 的容器）。`placement` 控制方向：`bottom-start`（默认）、`bottom-end`、`right-start`。

<div class="demo-row">
  <span ref="anchor" class="inline-flex">
    <Button variant="outlined" @click="anchored = !anchored">贴靠定位</Button>
  </span>
  <Menu v-model:open="anchored" :anchor="anchor" @select="anchoredPicked = $event">
    <MenuItem label="复制" :icon="contentCopy" shortcut="⌘C" />
    <MenuItem label="删除" :icon="deleteIcon" shortcut="⌫" />
  </Menu>
</div>

当前选中：{{ anchoredPicked }}

```vue
<script setup lang="ts">
import { ref } from "vue";
import { Button, Menu, MenuItem } from "@sharpdotnut/dotsharp";
import contentCopy from "@iconify-icons/material-symbols/content-copy";
import deleteIcon from "@iconify-icons/material-symbols/delete";

const anchor = ref<HTMLElement | null>(null);
const open = ref(false);
</script>

<template>
  <span ref="anchor" class="inline-flex">
    <Button variant="outlined" @click="open = !open">贴靠定位</Button>
  </span>
  <Menu v-model:open="open" :anchor="anchor">
    <MenuItem label="复制" :icon="contentCopy" shortcut="⌘C" />
    <MenuItem label="删除" :icon="deleteIcon" shortcut="⌫" />
  </Menu>
</template>
```

## 键盘与可访问性

- 面板是 `role="menu"`，菜单项是 `role="menuitem"`，可勾选项是 `role="menuitemcheckbox"`（同步 `aria-checked`）。
- 打开后焦点进入第一个可用菜单项；`↑` / `↓` 循环移动，`Home` / `End` 跳到两端，禁用的菜单项不参与。
- `→` 展开子菜单，`←` 收起子菜单，`Escape` 逐级收起并把焦点交还（子菜单还给父菜单项，根菜单还给触发元素）。
- `Tab` 关闭菜单，不拦截焦点离开；鼠标点击菜单外部同样关闭。
- 面板贴边时自动翻转 / 夹到视口内，并在高度不足时滚动。

## API

### Menu

| 属性         | 类型                                              | 默认值           | 说明                                                 |
| ------------ | ------------------------------------------------- | ---------------- | ---------------------------------------------------- |
| v-model:open | `boolean`                                         | `false`          | 菜单是否展开                                         |
| anchor       | `HTMLElement \| null`                             | `null`           | 贴靠元素；省略时使用 `#trigger` 里的触发元素         |
| placement    | `"bottom-start" \| "bottom-end" \| "right-start"` | `"bottom-start"` | 相对锚点的展开方向，空间不足时自动翻转               |
| x            | `number`                                          | —                | 视口 `x` 坐标；给出时忽略 `anchor`（上下文菜单使用） |
| y            | `number`                                          | —                | 视口 `y` 坐标                                        |
| autoFocus    | `boolean`                                         | `true`           | 展开时是否把焦点移入第一个可用菜单项                 |

- 插槽：`default`（菜单项与分隔线等）、`trigger`（触发元素，可选）。
- 事件：`select(value)`，`value` 是被选中项的 `value` 或索引。子菜单里的选中同样冒泡到根 `Menu`。
- 可勾选项（`checked` 为布尔值）触发 `select` 后不收起菜单，普通菜单项会收起。
- 暴露：`focusFirst()`，把焦点移到第一个可用菜单项（子菜单内部使用）。
- 根级属性与事件透传到菜单面板。

### MenuItem

| 属性        | 类型                    | 默认值       | 说明                                                        |
| ----------- | ----------------------- | ------------ | ----------------------------------------------------------- |
| label       | `string`                | —            | 菜单项文本；存在默认插槽时被插槽覆盖                        |
| icon        | `IconifyIcon \| string` | —            | 前置图标，尺寸 `1.5em` 跟随字号                             |
| description | `string`                | —            | 主文本下方的辅助说明，切换为两行排版                        |
| shortcut    | `string`                | —            | 尾部快捷键文本                                              |
| value       | `string \| number`      | 所在位置索引 | 菜单项标识，`select` 事件携带                               |
| checked     | `boolean`               | —            | 给出布尔值即可勾选：`role="menuitemcheckbox"`，显示勾选标记 |
| disabled    | `boolean`               | `false`      | 禁用：不参与键盘移动，点击 / 悬停不响应                     |

- 插槽：`default`（行内容，优先于 `label`）、`leading`（前置内容，优先于 `icon` 与勾选标记）、`trailing`（尾部内容，排在快捷键之前）、`submenu`（子菜单的菜单项）。
- 事件：`select(value)`；同时冒泡到所属 `Menu`。
- 点击可勾选项只切换勾选态，菜单保持展开；点击普通项收起整棵菜单。
- 根元素是原生 `button`，其余属性与事件透传到该按钮。
- 单行高度由 `px-3 py-2` 与 `leading-5` 决定（约 36px）；紧凑用法可用 `class="py-1"` 之类调整，但会牺牲触控面积。

### 子项约定

`Menu` / `MenuItem` 沿用[父子组件以及插槽统一范式](/guide/patterns)的取值规则：`value` 省略时使用 `Menu` 注入的渲染顺序索引，
`v-for` 与 `v-if` 会按最终顺序重新编号；`label` 只做纯文本回退，默认插槽优先。
