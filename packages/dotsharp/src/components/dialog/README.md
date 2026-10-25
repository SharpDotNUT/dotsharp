<script setup lang="ts">
import { ref } from "vue";
import { Button, Dialog, Input } from "@sharpdotnut/dotsharp";
import progressActivity from "@iconify-icons/material-symbols/progress-activity";

const basic = ref(false);
const reset = ref(false);
const location = ref(false);
const persistent = ref(false);
const editor = ref(false);

const eventName = ref("");
const fromDate = ref("");
const fromTime = ref("");
const toDate = ref("");
const toTime = ref("");
</script>

# Dialog 对话框

用于打断当前操作、展示需要确认的信息。`Dialog` 有两种变体：

- `basic`（默认）：视口居中的模态卡片，用于确认、提示和简短表单。
- `fullscreen`：铺满视口的全屏对话框，用于移动端的多步骤表单等需要完整空间的任务。

`v-model:open` 控制显示；组件 Teleport 到 `body`，用一个原生的 `<dialog>` 元素承载面板——打开时调用
`showModal()`，由浏览器提供置顶图层（top layer）、焦点陷阱与背景不可交互，组件自己不再实现焦点管理；
同时锁定页面滚动。
关闭方式由操作按钮、关闭按钮（全屏变体）、遮罩点击与 Escape 组成，后两者受 `dismissible` 控制。

## 基础对话框

标题用 `title`，正文用默认插槽，操作按钮放到 `actions` 插槽。操作按钮用 `variant="text"` 的
`Button`，与正文形成层级。

<div class="demo-row">
  <Button @click="basic = true">打开基础对话框</Button>
  <Dialog v-model:open="basic" title="Basic dialog title">
    A dialog is a modal window that appears in front of app content to provide critical
    information or ask for a decision.
    <template #actions>
      <Button variant="text" @click="basic = false">Text button</Button>
      <Button variant="text" @click="basic = false">Text button</Button>
    </template>
  </Dialog>
</div>

```vue
<script setup lang="ts">
import { ref } from "vue";
import { Button, Dialog } from "@sharpdotnut/dotsharp";

const open = ref(false);
</script>

<template>
  <Button @click="open = true">打开基础对话框</Button>

  <Dialog v-model:open="open" title="Basic dialog title">
    A dialog is a modal window that appears in front of app content to provide critical information
    or ask for a decision.
    <template #actions>
      <Button variant="text" @click="open = false">Text button</Button>
      <Button variant="text" @click="open = false">Text button</Button>
    </template>
  </Dialog>
</template>
```

`actions` 是右对齐的弹性行；需要左对齐的次要操作（例如「了解更多」）时，给它加 `class="mr-auto"`。

## 图标与居中标题

`icon` 与 `Icon` 的 `icon` 同源，渲染在标题上方并让标题居中；正文仍然左对齐。
`icon` 插槽优先于 `icon` 属性，用来放加载指示器等自定义内容。

<div class="demo-row">
  <Button @click="reset = true">打开带图标的对话框</Button>
  <Dialog v-model:open="reset" title="Reset settings?" :icon="progressActivity">
    This will reset your app preferences back to their default settings. The following accounts
    will also be signed out:
    <hr class="my-4 border-0 border-t border-ds-line" />
    <ul class="space-y-3 text-ds-fg">
      <li class="flex items-center gap-3">
        <span class="flex size-8 items-center justify-center rounded-full bg-ds-primary-strong/10 text-xs font-medium text-ds-primary-strong">
          LV
        </span>
        leevillanuevanotes@google.com
      </li>
      <li class="flex items-center gap-3">
        <span class="flex size-8 items-center justify-center rounded-full bg-ds-primary-strong/10 text-xs font-medium text-ds-primary-strong">
          AA
        </span>
        alloalejandro@google.com
      </li>
      <li class="flex items-center gap-3">
        <span class="flex size-8 items-center justify-center rounded-full bg-ds-primary-strong/10 text-xs font-medium text-ds-primary-strong">
          OL
        </span>
        oliortega@google.com
      </li>
    </ul>
    <hr class="my-4 border-0 border-t border-ds-line" />
    <template #actions>
      <Button variant="text">Cancel</Button>
      <Button variant="text" @click="reset = false">Accept</Button>
    </template>
  </Dialog>
</div>

```vue
<script setup lang="ts">
import { ref } from "vue";
import { Button, Dialog } from "@sharpdotnut/dotsharp";
import progressActivity from "@iconify-icons/material-symbols/progress-activity";

const open = ref(false);
</script>

<template>
  <Dialog v-model:open="open" title="Reset settings?" :icon="progressActivity">
    正文……

    <template #actions>
      <Button variant="text">Cancel</Button>
      <Button variant="text" @click="open = false">Accept</Button>
    </template>
  </Dialog>
</template>
```

## 左对齐操作

三个操作按钮时，把次要操作推到行首，主操作留在行尾：

<div class="demo-row">
  <Button @click="location = true">打开位置服务对话框</Button>
  <Dialog v-model:open="location" title="Use location service?">
    Let this service help other apps determine your location. This means sharing anonymous
    location data, even when no apps are running.
    <template #actions>
      <Button variant="text" class="mr-auto">Learn more</Button>
      <Button variant="text" @click="location = false">Disagree</Button>
      <Button variant="text" @click="location = false">Agree</Button>
    </template>
  </Dialog>
</div>

```vue
<Dialog v-model:open="open" title="Use location service?">
  正文……

  <template #actions>
    <Button variant="text" class="mr-auto">Learn more</Button>
    <Button variant="text" @click="open = false">Disagree</Button>
    <Button variant="text" @click="open = false">Agree</Button>
  </template>
</Dialog>
```

## 全屏对话框

`variant="fullscreen"` 铺满视口：顶部栏固定，包含关闭按钮、`title` 与行尾的 `actions` 插槽；
正文在剩余空间内独立滚动，适合需要边输入边确认的表单。进入与退出都从底部滑入滑出。

<div class="demo-row">
  <Button @click="editor = true">打开全屏对话框</Button>
  <Dialog v-model:open="editor" variant="fullscreen" title="Full-screen dialog title">
    <div class="mx-auto flex max-w-xl flex-col gap-4">
      <Input v-model="eventName" placeholder="Event name" />
      <div class="grid grid-cols-2 gap-4">
        <Input v-model="fromDate" placeholder="From date" />
        <Input v-model="fromTime" placeholder="From time" />
      </div>
      <div class="grid grid-cols-2 gap-4">
        <Input v-model="toDate" placeholder="To date" />
        <Input v-model="toTime" placeholder="To time" />
      </div>
    </div>
    <template #actions>
      <Button variant="text" @click="editor = false">Save</Button>
    </template>
  </Dialog>
</div>

```vue
<script setup lang="ts">
import { ref } from "vue";
import { Button, Dialog, Input } from "@sharpdotnut/dotsharp";

const open = ref(false);
const eventName = ref("");
</script>

<template>
  <Dialog v-model:open="open" variant="fullscreen" title="Full-screen dialog title">
    <div class="mx-auto flex max-w-xl flex-col gap-4">
      <Input v-model="eventName" placeholder="Event name" />
    </div>

    <template #actions>
      <Button variant="text" @click="open = false">Save</Button>
    </template>
  </Dialog>
</template>
```

全屏变体的 `actions` 渲染在顶部栏行尾；`icon` 与 `icon` 插槽只对 `basic` 生效。关闭按钮的图标固定为 `close`，无障碍名称由 `close-label` 提供（默认 `Close`）。

## 关闭行为

默认 `dismissible` 为 `true`：点击遮罩、按 Escape 都会关闭对话框。置为 `false` 后这两种方式都失效，
对话框只能由操作按钮关闭——用于必须做出决定或未保存的编辑。Escape 走原生 `cancel` 事件，组件始终拦截它，
先播完面板离场动画再真正关闭 `<dialog>`。

<div class="demo-row">
  <Button @click="persistent = true">打开不可取消的对话框</Button>
  <Dialog v-model:open="persistent" title="Save changes?" :dismissible="false">
    You have unsaved changes. Choose an action to continue.
    <template #actions>
      <Button variant="text" @click="persistent = false">Discard</Button>
      <Button variant="text" @click="persistent = false">Save</Button>
    </template>
  </Dialog>
</div>

```vue
<Dialog v-model:open="open" title="Save changes?" :dismissible="false">
  You have unsaved changes. Choose an action to continue.

  <template #actions>
    <Button variant="text" @click="open = false">Discard</Button>
    <Button variant="text" @click="open = false">Save</Button>
  </template>
</Dialog>
```

## 长内容

正文区域有最大高度，超出时在卡片内滚动；标题与操作按钮保持固定。
`basic` 卡片的最大高度是 `100dvh - 3rem`，宽度上限 560px、左右各留 24px。

```vue
<Dialog v-model:open="open" title="服务条款">
  <p v-for="index in 20" :key="index" class="mb-3">第 {{ index }} 条……</p>

  <template #actions>
    <Button variant="text" @click="open = false">关闭</Button>
  </template>
</Dialog>
```

## API

### Dialog

| 属性         | 类型                      | 默认值    | 说明                                       |
| ------------ | ------------------------- | --------- | ------------------------------------------ |
| v-model:open | `boolean`                 | `false`   | 是否显示                                   |
| title        | `string`                  | —         | 标题，同时作为对话框的无障碍名称           |
| variant      | `"basic" \| "fullscreen"` | `"basic"` | `basic` 居中卡片；`fullscreen` 铺满视口    |
| icon         | `IconifyIcon \| string`   | —         | 标题上方的图标，仅 `basic`；存在时标题居中 |
| dismissible  | `boolean`                 | `true`    | 是否允许点击遮罩 / Escape 关闭             |
| close-label  | `string`                  | `"Close"` | 全屏对话框关闭按钮的 `aria-label`          |

### 插槽

| 名称    | 变体    | 说明                                                          |
| ------- | ------- | ------------------------------------------------------------- |
| default | 全部    | 正文内容                                                      |
| actions | 全部    | 操作按钮；`basic` 在卡片底部右对齐，`fullscreen` 在顶部栏行尾 |
| icon    | `basic` | 标题上方的自定义图标，优先于 `icon` 属性                      |

### 可访问性

- 原生 `<dialog>` + `showModal()` 提供模态语义：内容进入浏览器置顶图层，背景不可交互，焦点被限制在对话框内，
  关闭后自动回到触发元素；组件不再自己实现焦点陷阱。
- `title` 存在时通过 `aria-labelledby` 关联标题；没有标题时请在组件上自行传 `aria-label`——它会落到
  `<dialog>` 上，对话框因此仍有可读名称。
- `aria-*` 与事件等其它未列出的属性都透传到 `<dialog>`；只有 `class` 与 `style` 属于内部面板。
- Escape 触发原生 `cancel`，受 `dismissible` 控制；遮罩点击只在 `basic` 变体生效。
- 打开期间锁定 `body` 滚动，多个对话框叠加时只在最后一个关闭后恢复。

### 结构

- 组件 Teleport 到 `body`，输出一个常驻的 `<dialog>` 宿主（`m-0 h-full max-h-none w-full max-w-none border-0 bg-transparent p-0`），
  面板在它内部绝对定位。
- 遮罩不再是独立元素，而是原生 `::backdrop`：`basic` 用 `backdrop:bg-ds-scrim`（`--ds-scrim`，32% 黑），
  `fullscreen` 用 `backdrop:bg-transparent`。
- `basic` 面板：`m-auto` 居中，最大宽度 560px，圆角 28px（`rounded-ds-xl`），内边距 24px；
  背景 `bg-ds-surface`，阴影 `shadow-xl`。进入 200ms 淡入并从 95% 放大，退出 150ms。
- `fullscreen` 面板：`h-full w-full`，顶部栏高 64px；进入 250ms 从底部滑入，退出 200ms 滑出。
- 关闭 `<dialog>` 会等到面板离场动画结束（`after-leave`）才发生，动画不会被截断。
- `class` 与 `style` 透传到面板，可以覆盖外观，但不要改 `position` 与 `inset`。
