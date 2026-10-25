<script setup lang="ts">
import { ref } from "vue";
import { Button, Dialog, Input } from "@sharpdotnut/dotsharp";
import progressActivity from "@iconify-icons/material-symbols/progress-activity";

const minimal = ref(false);
const iconDemo = ref(false);
const flowDemo = ref(false);
const confirmDemo = ref(false);
const longDemo = ref(false);
const persistent = ref(false);
const terms = ref(false);
const editor = ref(false);
const unlabeled = ref(false);

const accepted = ref<null | boolean>(null);
const eventName = ref("");
const fromDate = ref("");
const fromTime = ref("");

function decide(value: boolean): void {
  accepted.value = value;
  flowDemo.value = false;
}
</script>

# Dialog 对话框

`Dialog` 打断当前流程、要求用户做决定或填写少量信息。组件只有一个 `<dialog>` 宿主和一个面板，
面板本体是 [`Card`](/components/card)：圆角、表面色、标题行与底部操作栏都沿用卡片的规则，
`Dialog` 只负责模态语义、进出场动画和插槽到卡片的映射。

- `basic`（默认）—— 视口居中的卡片，最大宽度 560px，用于确认、提示、简短表单。
- `fullscreen` —— 铺满视口，顶部栏固定、正文独立滚动，用于需要完整空间的编辑流程。

`v-model:open` 是唯一的显示状态来源。组件 Teleport 到 `body`，用原生 `<dialog>` +
`showModal()` 拿到置顶图层、焦点陷阱和「背景不可交互」；打开期间同时锁定 `body` 滚动。
关闭由底部操作按钮、全屏变体的关闭按钮、遮罩点击与 Escape 触发，后两者受 `dismissible` 控制。

## 最小用法

`title` 给标题，默认插槽是正文，底部操作放在 `footer-right`。

<div class="demo-row">
  <Button @click="minimal = true">打开对话框</Button>
  <Dialog v-model:open="minimal" title="Basic dialog title">
    A dialog is a modal window that appears in front of app content to provide critical information
    or ask for a decision.
    <template #footer-right>
      <Button variant="text" @click="minimal = false">Cancel</Button>
      <Button variant="text" @click="minimal = false">Accept</Button>
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
  <Button @click="open = true">打开对话框</Button>

  <Dialog v-model:open="open" title="Basic dialog title">
    A dialog is a modal window that appears in front of app content to provide critical information
    or ask for a decision.

    <template #footer-right>
      <Button variant="text" @click="open = false">Cancel</Button>
      <Button variant="text" @click="open = false">Accept</Button>
    </template>
  </Dialog>
</template>
```

## 插槽落在面板的哪里

| 插槽           | 变体         | 位置                                         |
| -------------- | ------------ | -------------------------------------------- |
| `default`      | 全部         | 正文；空间不足时只有它滚动，标题与操作栏固定 |
| `icon`         | `basic`      | 标题上方、水平居中；优先于 `icon` 属性       |
| `footer-left`  | `basic`      | 底部左端，第一行                             |
| `footer-right` | `basic`      | 底部右端；放不下时整组折到第二行             |
| `title-right`  | `fullscreen` | 顶部栏行尾，与标题同一行                     |

标题本身由 `title` 属性提供：`basic` 渲染 24px 标题，`fullscreen` 渲染 20px 并在左侧带关闭按钮
（关闭按钮占用卡片的 `title-left` 槽位）。`basic` 不渲染关闭按钮——它靠底部操作和遮罩/Escape 退出。

## 带图标与居中标题

`icon` 与 [`Icon`](/components/icon) 的 `icon` 同源，渲染在标题上方，同时把标题改为居中；正文仍然左对齐。
需要加载指示器、头像这类自定义内容时用 `icon` 插槽，它优先于 `icon` 属性。

<div class="demo-row">
  <Button @click="iconDemo = true">打开带图标的对话框</Button>
  <Dialog v-model:open="iconDemo" title="Reset settings?" :icon="progressActivity">
    This will reset your app preferences back to their default settings. The following accounts will
    also be signed out:
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
    </ul>
    <hr class="my-4 border-0 border-t border-ds-line" />
    <template #footer-right>
      <Button variant="text" @click="iconDemo = false">Cancel</Button>
      <Button variant="text" @click="iconDemo = false">Accept</Button>
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

    <template #icon>
      <!-- 自定义内容，例如 <Icon :icon="progressActivity" class="animate-spin" /> -->
    </template>

    <template #footer-right>
      <Button variant="text" @click="open = false">Cancel</Button>
      <Button variant="text" @click="open = false">Accept</Button>
    </template>
  </Dialog>
</template>
```

## 底部操作：主操作在右

`footer-right` 是右对齐的一组操作，主操作放末尾，次要操作用 `variant="text"` 压低视觉重量。

<div class="demo-row">
  <Button @click="confirmDemo = true">打开删除确认</Button>
  <Dialog v-model:open="confirmDemo" title="删除这个文件夹？">
    删除后「设计稿-2026」里的 32 个文件会一并移除，且无法从回收站恢复。
    <template #footer-right>
      <Button variant="text" @click="confirmDemo = false">取消</Button>
      <Button @click="confirmDemo = false">删除</Button>
    </template>
  </Dialog>
</div>

状态：{{ confirmDemo ? "已打开" : "已关闭" }}

```vue
<Dialog v-model:open="open" title="删除这个文件夹？">
  删除后「设计稿-2026」里的 32 个文件会一并移除，且无法从回收站恢复。

  <template #footer-right>
    <Button variant="text" @click="open = false">取消</Button>
    <Button @click="open = false">删除</Button>
  </template>
</Dialog>
```

## 底部操作：左右分组

需要「了解更多」这类和决定无关的入口时，把它放进 `footer-left`，不要靠 `class="mr-auto"` 之类的技巧排版。

<div class="demo-row">
  <Button @click="flowDemo = true">打开位置服务对话框</Button>
  <Dialog v-model:open="flowDemo" title="Use location service?">
    Let this service help other apps determine your location. This means sharing anonymous location
    data, even when no apps are running.
    <template #footer-left>
      <Button variant="text" @click="accepted = null">Learn more</Button>
    </template>
    <template #footer-right>
      <Button variant="text" @click="decide(false)">Disagree</Button>
      <Button variant="text" @click="decide(true)">Agree</Button>
    </template>
  </Dialog>
</div>

选择结果：{{ accepted === null ? "未决定" : accepted ? "已同意" : "已拒绝" }}

```vue
<Dialog v-model:open="open" title="Use location service?">
  正文……

  <template #footer-left>
    <Button variant="text">Learn more</Button>
  </template>
  <template #footer-right>
    <Button variant="text" @click="open = false">Disagree</Button>
    <Button variant="text" @click="open = false">Agree</Button>
  </template>
</Dialog>
```

### 放不下时折成两行

底部是 `flex-wrap` 容器：两组操作都放得下时同一行左右分开；放不下时右组整组折到第二行并保持右对齐，
左组留在第一行左端。面板最宽 560px（视口更窄时再减去 48px 内边距），所以按钮一多就会看到折行。

<div class="demo-row">
  <Button @click="longDemo = true">打开多操作对话框</Button>
  <Dialog v-model:open="longDemo" title="权限请求">
    这个应用希望在使用期间访问你的位置、相机与通知。
    <template #footer-left>
      <Button variant="text" @click="longDemo = false">了解更多</Button>
    </template>
    <template #footer-right>
      <Button variant="text" @click="longDemo = false">暂不开启</Button>
      <Button variant="text" @click="longDemo = false">稍后提醒我</Button>
      <Button variant="text" @click="longDemo = false">仅此次允许</Button>
      <Button variant="text" @click="longDemo = false">始终允许</Button>
    </template>
  </Dialog>
</div>

```vue
<Dialog v-model:open="open" title="权限请求">
  正文……

  <template #footer-left>
    <Button variant="text">了解更多</Button>
  </template>
  <template #footer-right>
    <Button variant="text">暂不开启</Button>
    <Button variant="text">稍后提醒我</Button>
    <Button variant="text">仅此次允许</Button>
    <Button variant="text">始终允许</Button>
  </template>
</Dialog>
```

## 全屏对话框

`variant="fullscreen"` 铺满视口：顶部栏固定（关闭按钮 + 标题 + `title-right`），正文在剩余空间内独立滚动，
进入、退出都从底部滑入滑出。适合分步表单、边看边改的编辑页。

<div class="demo-row">
  <Button @click="editor = true">打开全屏对话框</Button>
  <Dialog v-model:open="editor" variant="fullscreen" title="Full-screen dialog title">
    <div class="mx-auto flex max-w-xl flex-col gap-4">
      <Input v-model="eventName" label="Event name" />
      <div class="grid grid-cols-2 gap-4">
        <Input v-model="fromDate" label="From date" />
        <Input v-model="fromTime" label="From time" />
      </div>
    </div>
    <template #title-right>
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
      <Input v-model="eventName" label="Event name" />
    </div>

    <template #title-right>
      <Button variant="text" @click="open = false">Save</Button>
    </template>
  </Dialog>
</template>
```

关闭按钮固定使用 `close` 图标，无障碍名称由 `close-label` 提供（默认 `Close`）。

## 关闭行为

`dismissible` 默认为 `true`：点击遮罩、按 Escape 都会关闭。置为 `false` 后两种方式都失效，
对话框只能由操作按钮关闭——用于必须选择、或存在未保存修改的场景。

Escape 走原生 `cancel` 事件，组件始终拦截它：先播完面板的离场动画，再真正 `close()` 原生对话框，
所以动画不会被截断。

<div class="demo-row">
  <Button @click="persistent = true">打开不可取消的对话框</Button>
  <Dialog v-model:open="persistent" title="Save changes?" :dismissible="false">
    You have unsaved changes. Choose an action to continue.
    <template #footer-right>
      <Button variant="text" @click="persistent = false">Discard</Button>
      <Button variant="text" @click="persistent = false">Save</Button>
    </template>
  </Dialog>
</div>

```vue
<Dialog v-model:open="open" title="Save changes?" :dismissible="false">
  You have unsaved changes. Choose an action to continue.

  <template #footer-right>
    <Button variant="text" @click="open = false">Discard</Button>
    <Button variant="text" @click="open = false">Save</Button>
  </template>
</Dialog>
```

## 长内容

正文区域受面板最大高度约束（`100dvh - 3rem`），超出时在正文里滚动，标题与底部操作栏保持固定。
底部操作栏不会随之滚走，因此不需要把按钮放进正文。

<div class="demo-row">
  <Button @click="terms = true">打开长内容对话框</Button>
  <Dialog v-model:open="terms" title="服务条款">
    <p v-for="index in 30" :key="index" class="mb-3">
      第 {{ index }} 条：滚动正文，标题与底部操作保持不动。
    </p>
    <template #footer-right>
      <Button variant="text" @click="terms = false">关闭</Button>
    </template>
  </Dialog>
</div>

```vue
<Dialog v-model:open="open" title="服务条款">
  <p v-for="index in 30" :key="index" class="mb-3">第 {{ index }} 条……</p>

  <template #footer-right>
    <Button variant="text" @click="open = false">关闭</Button>
  </template>
</Dialog>
```

## 无标题对话框

没有 `title` 就没有 `aria-labelledby`，此时必须在组件上直接传 `aria-label`——它会落到 `<dialog>` 上，
读屏仍然能读出对话框的名字。同时标题行不会渲染，正文贴着面板顶部。

<div class="demo-row">
  <Button @click="unlabeled = true">打开无标题对话框</Button>
  <Dialog v-model:open="unlabeled" aria-label="Quick actions">
    <div class="flex flex-col gap-2">
      <Button variant="text" @click="unlabeled = false">Duplicate</Button>
      <Button variant="text" @click="unlabeled = false">Move to…</Button>
      <Button variant="text" @click="unlabeled = false">Delete</Button>
    </div>
  </Dialog>
</div>

```vue
<Dialog v-model:open="open" aria-label="Quick actions">
  <div class="flex flex-col gap-2">
    <Button variant="text">Duplicate</Button>
    <Button variant="text">Move to…</Button>
    <Button variant="text">Delete</Button>
  </div>
</Dialog>
```

## API

### Dialog

| 属性           | 类型                      | 默认值    | 说明                                       |
| -------------- | ------------------------- | --------- | ------------------------------------------ |
| `v-model:open` | `boolean`                 | `false`   | 是否显示                                   |
| `title`        | `string`                  | —         | 标题，同时作为对话框的无障碍名称           |
| `variant`      | `"basic" \| "fullscreen"` | `"basic"` | `basic` 居中卡片；`fullscreen` 铺满视口    |
| `icon`         | `IconifyIcon \| string`   | —         | 标题上方的图标，仅 `basic`；存在时标题居中 |
| `dismissible`  | `boolean`                 | `true`    | 是否允许点击遮罩 / Escape 关闭             |
| `close-label`  | `string`                  | `"Close"` | 全屏变体关闭按钮的 `aria-label`            |

### 插槽

| 名称           | 变体         | 说明                                |
| -------------- | ------------ | ----------------------------------- |
| `default`      | 全部         | 正文，独立滚动                      |
| `icon`         | `basic`      | 标题上方的自定义图标，优先于 `icon` |
| `footer-left`  | `basic`      | 底部左端的次要操作                  |
| `footer-right` | `basic`      | 底部右端的主操作；放不下时整组折行  |
| `title-right`  | `fullscreen` | 顶部栏行尾的操作                    |

### 可访问性

- 原生 `<dialog>` + `showModal()` 负责模态语义：内容进入浏览器置顶图层，背景不可交互，焦点被限制在对话框内，
  关闭后自动回到触发元素；组件不自己实现焦点陷阱。
- 有 `title` 时通过 `aria-labelledby` 关联标题；没有 `title` 时请自己传 `aria-label`。
- `aria-*`、事件等未列出的属性透传到 `<dialog>`；只有 `class` 与 `style` 属于内部面板。
- Escape 触发原生 `cancel`，受 `dismissible` 控制；遮罩点击只在 `basic` 变体生效。
- 打开期间锁定 `body` 滚动；多个对话框叠加时，只在最后一个关闭后恢复。

### 结构

- Teleport 到 `body`，输出一个常驻的 `<dialog>` 宿主（`m-0 h-full max-h-none w-full max-w-none border-0 bg-transparent p-0`，
  类名 `ds-dialog__root`），面板在它内部绝对定位。
- 遮罩是原生 `::backdrop`：`basic` 用 `backdrop:bg-ds-scrim`（`--ds-scrim`，32% 黑），`fullscreen` 透明。
- 面板是 `Card`（`variant="surface"`、`level="1"`，类名 `ds-dialog`）：`basic` 用 `padded="false"` 加 24px 内边距，
  最大宽度 560px、`rounded-ds-xl`、`shadow-xl`；`fullscreen` 用卡片默认内边距铺满视口。
- 进出场：`basic` 200ms 淡入并从 95% 放大，退出 150ms；`fullscreen` 250ms 从底部滑入，200ms 滑出。
- `class` 与 `style` 透传到面板，可以覆盖外观，但不要改 `position` 与 `inset`；也不要再改宽度，
  宽度由变体与视口共同决定。
