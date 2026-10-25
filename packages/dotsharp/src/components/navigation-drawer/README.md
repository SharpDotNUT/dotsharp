<script setup lang="ts">
import { ref } from "vue";
import {
  Button,
  NavigationDrawer,
  NavigationDrawerDivider,
  NavigationDrawerHeading,
  NavigationDrawerItem,
} from "@sharpdotnut/dotsharp";
import deleteIcon from "@iconify-icons/material-symbols/delete-outline";
import favorite from "@iconify-icons/material-symbols/favorite-outline";
import folder from "@iconify-icons/material-symbols/folder-outline";
import inbox from "@iconify-icons/material-symbols/inbox-outline";
import send from "@iconify-icons/material-symbols/send-outline";

const standard = ref("inbox");
const modal = ref("inbox");
const modalOpen = ref(false);
const index = ref(0);
</script>

# NavigationDrawer 导航抽屉

侧边导航抽屉：`NavigationDrawer` 持有选中值（`v-model:value`），
`NavigationDrawerItem` 描述每一项，`NavigationDrawerHeading` / `NavigationDrawerDivider` 负责分组。

- `variant="standard"`：嵌在应用布局里、始终可见，常用于平板 / 桌面。
- `variant="modal"`：在最近的定位容器内覆盖内容，带遮罩与焦点陷阱，由 `v-model:open` 控制；不脱离容器、不锁定页面滚动。
- 两种变体宽度都是 360px，窄屏时收缩到可用宽度。
- 选中项是整行胶囊（`--ds-tonal` 底色），行尾可放 `badge`。

## 子项约定

`NavigationDrawer` / `NavigationDrawerItem` 遵循[父子组件以及插槽统一范式](/guide/patterns)：选中值由
`v-model:value` 持有，`NavigationDrawerItem` 用 `label`、`icon`、`badge` 或默认插槽描述内容，标识取
`value` 或父组件注入的索引。`NavigationDrawerHeading` / `NavigationDrawerDivider` 只做视觉分组，不参与编号。

## Standard：嵌在应用内

`standard` 抽屉占满父容器高度并自行滚动；宽度由组件固定为 360px，`shrink-0` 保证在 flex 布局里不被压缩。

<div class="demo-row">
  <div class="flex h-[26rem] w-full overflow-hidden rounded-ds border border-ds-line bg-ds-bg">
    <NavigationDrawer v-model:value="standard" label="邮件" class="border-r border-ds-line">
      <NavigationDrawerHeading label="邮件" />
      <NavigationDrawerItem label="收件箱" value="inbox" :icon="inbox" :badge="24" />
      <NavigationDrawerItem label="发件箱" value="outbox" :icon="send" />
      <NavigationDrawerItem label="收藏" value="favorites" :icon="favorite" />
      <NavigationDrawerItem label="垃圾箱" value="trash" :icon="deleteIcon" />
      <NavigationDrawerDivider />
      <NavigationDrawerHeading label="标签" />
      <NavigationDrawerItem label="工作" value="work" :icon="folder" />
      <NavigationDrawerItem label="生活" value="life" :icon="folder" />
    </NavigationDrawer>
    <div class="flex flex-1 items-start p-6 text-sm text-ds-muted">应用内容</div>
  </div>
</div>

当前选中值：{{ standard }}

```vue
<script setup lang="ts">
import { ref } from "vue";
import {
  NavigationDrawer,
  NavigationDrawerDivider,
  NavigationDrawerHeading,
  NavigationDrawerItem,
} from "@sharpdotnut/dotsharp";
import favorite from "@iconify-icons/material-symbols/favorite-outline";
import folder from "@iconify-icons/material-symbols/folder-outline";
import inbox from "@iconify-icons/material-symbols/inbox-outline";
import send from "@iconify-icons/material-symbols/send-outline";
import trash from "@iconify-icons/material-symbols/delete-outline";

const current = ref("inbox");
</script>

<template>
  <div class="flex h-[26rem] w-full overflow-hidden rounded-ds border border-ds-line bg-ds-bg">
    <NavigationDrawer v-model:value="current" label="邮件" class="border-r border-ds-line">
      <NavigationDrawerHeading label="邮件" />
      <NavigationDrawerItem label="收件箱" value="inbox" :icon="inbox" :badge="24" />
      <NavigationDrawerItem label="发件箱" value="outbox" :icon="send" />
      <NavigationDrawerItem label="收藏" value="favorites" :icon="favorite" />
      <NavigationDrawerItem label="垃圾箱" value="trash" :icon="trash" />
      <NavigationDrawerDivider />
      <NavigationDrawerHeading label="标签" />
      <NavigationDrawerItem label="工作" value="work" :icon="folder" />
      <NavigationDrawerItem label="生活" value="life" :icon="folder" />
    </NavigationDrawer>
    <div class="flex flex-1 items-start p-6 text-sm text-ds-muted">应用内容</div>
  </div>
</template>
```

宽度由组件固定为 360px；需要更窄时用 `class="!w-…"` 覆写，或在外层容器里裁切。

## Modal：容器内遮罩

modal 抽屉在最近的定位容器内覆盖内容（父元素需要 `relative`）。打开时从左侧滑入，遮罩只覆盖该容器；
点击遮罩、按 Escape 都会关闭。组件不会 Teleport 到 body、不会固定到视口，也不锁定页面滚动。
焦点移入抽屉并在内部循环，关闭后回到打开前的元素。

<div class="demo-row">
  <div class="relative flex h-[26rem] w-full overflow-hidden rounded-ds border border-ds-line bg-ds-bg">
    <div class="flex flex-1 flex-col items-start gap-3 p-6">
      <Button @click="modalOpen = true">打开 modal 抽屉</Button>
      <span class="text-sm text-ds-muted">遮罩只覆盖这个容器</span>
    </div>
    <NavigationDrawer v-model:value="modal" v-model:open="modalOpen" variant="modal" label="邮件">
      <NavigationDrawerHeading label="邮件" />
      <NavigationDrawerItem label="收件箱" value="inbox" :icon="inbox" :badge="24" />
      <NavigationDrawerItem label="发件箱" value="outbox" :icon="send" />
      <NavigationDrawerItem label="收藏" value="favorites" :icon="favorite" />
      <NavigationDrawerItem label="垃圾箱" value="trash" :icon="deleteIcon" />
      <NavigationDrawerDivider />
      <NavigationDrawerHeading label="标签" />
      <NavigationDrawerItem label="工作" value="work" :icon="folder" />
      <NavigationDrawerItem label="生活" value="life" :icon="folder" />
    </NavigationDrawer>
  </div>
</div>

当前选中值：{{ modal }}

```vue
<script setup lang="ts">
import { ref } from "vue";
import {
  Button,
  NavigationDrawer,
  NavigationDrawerDivider,
  NavigationDrawerHeading,
  NavigationDrawerItem,
} from "@sharpdotnut/dotsharp";
import favorite from "@iconify-icons/material-symbols/favorite-outline";
import folder from "@iconify-icons/material-symbols/folder-outline";
import inbox from "@iconify-icons/material-symbols/inbox-outline";
import send from "@iconify-icons/material-symbols/send-outline";
import trash from "@iconify-icons/material-symbols/delete-outline";

const open = ref(false);
const current = ref("inbox");
</script>

<template>
  <div
    class="relative flex h-[26rem] w-full overflow-hidden rounded-ds border border-ds-line bg-ds-bg"
  >
    <div class="flex flex-1 flex-col items-start gap-3 p-6">
      <Button @click="open = true">打开 modal 抽屉</Button>
      <span class="text-sm text-ds-muted">遮罩只覆盖这个容器</span>
    </div>

    <NavigationDrawer v-model:value="current" v-model:open="open" variant="modal" label="邮件">
      <NavigationDrawerHeading label="邮件" />
      <NavigationDrawerItem label="收件箱" value="inbox" :icon="inbox" :badge="24" />
      <NavigationDrawerItem label="发件箱" value="outbox" :icon="send" />
      <NavigationDrawerItem label="收藏" value="favorites" :icon="favorite" />
      <NavigationDrawerItem label="垃圾箱" value="trash" :icon="trash" />
      <NavigationDrawerDivider />
      <NavigationDrawerHeading label="标签" />
      <NavigationDrawerItem label="工作" value="work" :icon="folder" />
      <NavigationDrawerItem label="生活" value="life" :icon="folder" />
    </NavigationDrawer>
  </div>
</template>
```

modal 结构：遮罩 `absolute inset-0 z-40`（`--ds-scrim`，32% 黑），面板 `absolute inset-y-0 left-0 z-50`、
`role="dialog"`、`aria-modal="true"`，宽度 360px 并在窄屏收缩到容器宽度，只有尾侧（右侧）两角是 16px 圆角。
进入动画 250ms，退出 200ms。两者都锚定最近的定位容器，容器需要 `position: relative`（Tailwind 的 `relative`）；
没有定位父元素时会锚到更外层的定位祖先，因此务必给容器加 `relative`。

`label` 会同时写到 `<nav>` 与对话框的 `aria-label`；modal 下的其余透传属性落在对话框面板上，
standard 下则落在 `<nav>` 上。

## 选中值与索引

`NavigationDrawerItem` 省略 `value` 时用自己的数字索引（从 `0` 开始）作为标识；索引只统计 item 本身，
`NavigationDrawerHeading`、`NavigationDrawerDivider` 不参与编号。`v-model:value` 默认是 `0`，首项默认
选中。完整规则见[父子组件以及插槽统一范式](/guide/patterns#子项标识-value-或索引)。

<div class="demo-row">
  <div class="flex h-[22rem] w-full overflow-hidden rounded-ds border border-ds-line bg-ds-bg">
    <NavigationDrawer v-model:value="index" label="索引示例">
      <NavigationDrawerItem label="第一项" :icon="inbox" />
      <NavigationDrawerItem label="第二项" :icon="send" />
      <NavigationDrawerItem label="第三项" :icon="favorite" />
    </NavigationDrawer>
  </div>
</div>

当前选中索引：{{ index }}

```vue
<script setup lang="ts">
import { ref } from "vue";
import { NavigationDrawer, NavigationDrawerItem } from "@sharpdotnut/dotsharp";
import favorite from "@iconify-icons/material-symbols/favorite-outline";
import inbox from "@iconify-icons/material-symbols/inbox-outline";
import send from "@iconify-icons/material-symbols/send-outline";

const index = ref(0);
</script>

<template>
  <NavigationDrawer v-model:value="index" label="索引示例">
    <NavigationDrawerItem label="第一项" :icon="inbox" />
    <NavigationDrawerItem label="第二项" :icon="send" />
    <NavigationDrawerItem label="第三项" :icon="favorite" />
  </NavigationDrawer>
</template>
```

需要稳定的跨版本标识时显式传 `value`。点击已选中的项不会重复写模型。

## 单项内容

- `label`：纯文本；
- `icon`：与 `Icon` 的 `icon` 同源，尺寸固定 24px，渲染在文字之前；
- `badge`：行尾计数或短文本，跟随当前项的文字颜色；
- `href`：有值时根元素渲染成 `<a href>`，用于真实链接导航；
- `disabled`：禁用；按钮用原生 `disabled`，链接用 `aria-disabled="true"` + `tabindex="-1"`，都不再改写选中值；
- 默认插槽：**优先于 `label`**，适合自定义排版。

```vue
<NavigationDrawerItem label="收件箱" :icon="inbox" :badge="24" />
<NavigationDrawerItem label="发件箱" :icon="send" href="/outbox" />
<NavigationDrawerItem label="垃圾箱" :icon="deleteIcon" disabled />
<NavigationDrawerItem label="带插槽" :icon="folder">
  <span class="font-medium">自定义内容</span>
</NavigationDrawerItem>
```

选中行是 `--ds-tonal` 底 + `--ds-on-tonal` 文字（medium 字重），未选中行是透明底 + `--ds-muted` 文字，
悬停时换成 `--ds-surface-hover` 底与 `--ds-fg` 文字；图标与 `badge` 继承当前行的文字颜色。

长文字截断为省略号；没有 `icon` 时文字从行首开始，整行仍是 56px 高的可点击胶囊。

## 分组

`NavigationDrawerHeading` 是分组标题（默认 16px medium），`NavigationDrawerDivider` 是 1px 分隔线。
两者都只负责视觉分组，不参与选中状态。

```vue
<NavigationDrawerHeading label="邮件" />
<NavigationDrawerItem label="收件箱" :icon="inbox" />
<NavigationDrawerDivider />
<NavigationDrawerHeading label="标签" />
<NavigationDrawerItem label="工作" :icon="folder" />
```

## API

### NavigationDrawer

| 属性          | 类型                    | 默认值       | 说明                                             |
| ------------- | ----------------------- | ------------ | ------------------------------------------------ |
| variant       | `"standard" \| "modal"` | `"standard"` | `standard` 嵌入布局；`modal` 遮罩浮层            |
| label         | `string`                | —            | 无障碍名称，写入 `<nav>` 与 modal 对话框的 label |
| v-model:value | `string \| number`      | `0`          | 当前选中值，对应子项的 `value` 或索引            |
| v-model:open  | `boolean`               | `false`      | modal 是否打开；standard 忽略该模型              |

### NavigationDrawerItem

| 属性     | 类型                    | 默认值       | 说明                                                |
| -------- | ----------------------- | ------------ | --------------------------------------------------- |
| label    | `string`                | —            | 纯文本内容；存在默认插槽时被插槽覆盖                |
| icon     | `IconifyIcon \| string` | —            | 图标，尺寸 24px，渲染在文字/插槽之前                |
| badge    | `string \| number`      | —            | 行尾计数或短文本                                    |
| value    | `string \| number`      | 所在位置索引 | 子项标识                                            |
| href     | `string`                | —            | 有值时根元素渲染成 `<a>`，用于真实链接导航          |
| disabled | `boolean`               | `false`      | 禁用；按钮用原生 `disabled`，链接用 `aria-disabled` |

- 根元素是 `type="button"` 的 `button`（有 `href` 时是 `a`），选中项带 `aria-current="page"`。
- 默认插槽优先于 `label`；与 `icon` 同时使用时插槽内容排在图标之后。

### NavigationDrawerHeading

| 属性  | 类型     | 默认值 | 说明                                 |
| ----- | -------- | ------ | ------------------------------------ |
| label | `string` | —      | 纯文本内容；存在默认插槽时被插槽覆盖 |

### NavigationDrawerDivider

没有属性；根元素是 `<hr>`，其余属性透传。

### 可访问性

- `standard` 输出 `<nav>`；`modal` 输出 `role="dialog"` + `aria-modal="true"` 的面板，内部仍是 `<nav>`。
- modal 打开时焦点移入抽屉（优先选中项），Tab / Shift+Tab 在面板内循环，Escape 关闭，关闭后焦点回到打开前的元素；不会锁定页面滚动，也不会 Teleport 到容器外。
- 选中项用 `aria-current="page"` 表达当前位置，不要只依赖颜色。
- 每个抽屉都建议传 `label`，否则 landmark / dialog 没有可访问名称。
