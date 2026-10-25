<script setup lang="ts">
import { ref } from "vue";
import { Button, IconButton, Tooltip } from "@sharpdotnut/dotsharp";
import deleteIcon from "@iconify-icons/material-symbols/delete-outline";
import infoIcon from "@iconify-icons/material-symbols/info-outline";

const controlled = ref(false);
const lastAction = ref("尚未触发");
</script>

# Tooltip 工具提示

悬停或键盘聚焦触发元素时出现的浮层，两种形态：

- `variant="plain"`（默认）：单行深色文字，只描述触发元素，不接收交互。
- `variant="rich"`：带标题、正文与可选操作的卡片，指针可以从触发元素移进浮层。

默认出现在触发元素上方（`placement="top"`），空间不足时自动翻到对面并贴住视口边缘。

## 基础用法

把触发元素放进默认插槽，`label` 是提示文字。出现有 500ms 的悬停延迟，键盘聚焦则立即出现。

<div class="demo-row">
  <Tooltip label="基础提示">
    <IconButton :icon="infoIcon" label="信息" />
  </Tooltip>
  <Tooltip label="删除这条记录">
    <IconButton :icon="deleteIcon" label="删除" />
  </Tooltip>
  <Tooltip label="悬停 500ms 后出现">
    <Button variant="tonal">悬停我</Button>
  </Tooltip>
</div>

```vue
<script setup lang="ts">
import { Button, IconButton, Tooltip } from "@sharpdotnut/dotsharp";
import deleteIcon from "@iconify-icons/material-symbols/delete-outline";
import infoIcon from "@iconify-icons/material-symbols/info-outline";
</script>

<template>
  <Tooltip label="基础提示">
    <IconButton :icon="infoIcon" label="信息" />
  </Tooltip>
  <Tooltip label="删除这条记录">
    <IconButton :icon="deleteIcon" label="删除" />
  </Tooltip>
  <Tooltip label="悬停 500ms 后出现">
    <Button variant="tonal">悬停我</Button>
  </Tooltip>
</template>
```

## 富工具提示（Rich）

`title` 是标题，`text` 是正文，`action-label` 生成底部的文字按钮；点击按钮会发出 `action` 事件并关闭提示。
正文与操作也可以分别用 `#content`、`#action` 插槽替换。

<div class="demo-row">
  <Tooltip
    variant="rich"
    title="富工具提示"
    text="富工具提示用于强调某个需要用户注意的元素或功能，可以包含更多说明。"
    action-label="查看详情"
    @action="lastAction = '已点击查看详情'"
  >
    <Button>富提示</Button>
  </Tooltip>
</div>

最近一次操作：{{ lastAction }}

```vue
<script setup lang="ts">
import { ref } from "vue";
import { Button, Tooltip } from "@sharpdotnut/dotsharp";

const lastAction = ref("尚未触发");
</script>

<template>
  <Tooltip
    variant="rich"
    title="富工具提示"
    text="富工具提示用于强调某个需要用户注意的元素或功能，可以包含更多说明。"
    action-label="查看详情"
    @action="lastAction = '已点击查看详情'"
  >
    <Button>富提示</Button>
  </Tooltip>
</template>
```

富提示宽度上限 320px，正文用 `--ds-text-muted`，标题与正文之间留 4px。指针移进卡片时保持展开，
移出后 120ms 才收起，因此在卡片里点操作不会因为穿过间隙而消失。

## 方位

`placement` 支持 `top` / `bottom` / `left` / `right`。首选方位放不下时会自动翻到对面，再贴住视口边缘。

<div class="demo-row">
  <Tooltip label="上方" placement="top">
    <Button variant="outlined">上方</Button>
  </Tooltip>
  <Tooltip label="下方" placement="bottom">
    <Button variant="outlined">下方</Button>
  </Tooltip>
  <Tooltip label="左侧" placement="left">
    <Button variant="outlined">左侧</Button>
  </Tooltip>
  <Tooltip label="右侧" placement="right">
    <Button variant="outlined">右侧</Button>
  </Tooltip>
</div>

```vue
<Tooltip label="上方" placement="top">
  <Button variant="outlined">上方</Button>
</Tooltip>
<Tooltip label="下方" placement="bottom">
  <Button variant="outlined">下方</Button>
</Tooltip>
<Tooltip label="左侧" placement="left">
  <Button variant="outlined">左侧</Button>
</Tooltip>
<Tooltip label="右侧" placement="right">
  <Button variant="outlined">右侧</Button>
</Tooltip>
```

## 受控展开

`v-model:open` 可以读写展开状态。悬停、聚焦、Escape 与操作按钮都会同步写回，因此可以直接据此做埋点或联动。

<div class="demo-row">
  <Tooltip label="由按钮控制" v-model:open="controlled">
    <Button variant="tonal">受控提示</Button>
  </Tooltip>
  <Button variant="outlined" @click="controlled = !controlled">
    {{ controlled ? "收起" : "展开" }}
  </Button>
</div>

```vue
<script setup lang="ts">
import { ref } from "vue";
import { Button, Tooltip } from "@sharpdotnut/dotsharp";

const controlled = ref(false);
</script>

<template>
  <Tooltip label="由按钮控制" v-model:open="controlled">
    <Button variant="tonal">受控提示</Button>
  </Tooltip>
  <Button variant="outlined" @click="controlled = !controlled">
    {{ controlled ? "收起" : "展开" }}
  </Button>
</template>
```

## 禁用

`disabled` 时悬停与聚焦都不再展开；展开过程中禁用会立即收起。

<div class="demo-row">
  <Tooltip label="不会出现" disabled>
    <Button variant="outlined">已禁用</Button>
  </Tooltip>
</div>

```vue
<Tooltip label="不会出现" disabled>
  <Button variant="outlined">已禁用</Button>
</Tooltip>
```

## API

| 属性         | 类型                                     | 默认值    | 说明                                    |
| ------------ | ---------------------------------------- | --------- | --------------------------------------- |
| v-model:open | `boolean`                                | `false`   | 展开状态；悬停、聚焦与 Escape 会写回    |
| variant      | `"plain" \| "rich"`                      | `"plain"` | 纯文字提示 / 带标题与操作的卡片         |
| label        | `string`                                 | —         | `plain` 的文字                          |
| title        | `string`                                 | —         | `rich` 的标题                           |
| text         | `string`                                 | —         | `rich` 的正文；`#content` 插槽优先      |
| action-label | `string`                                 | —         | `rich` 底部操作文字；`#action` 插槽优先 |
| placement    | `"top" \| "bottom" \| "left" \| "right"` | `"top"`   | 首选方位，放不下时翻面                  |
| disabled     | `boolean`                                | `false`   | 禁用所有展开方式                        |
| show-delay   | `number`                                 | `500`     | 悬停出现延迟（毫秒），聚焦不受影响      |

| 插槽    | 说明                                |
| ------- | ----------------------------------- |
| default | 触发元素，任意可聚焦内容            |
| content | 替换 `plain` 的文字或 `rich` 的正文 |
| action  | 替换 `rich` 底部的操作按钮          |

| 事件   | 参数 | 说明                         |
| ------ | ---- | ---------------------------- |
| action | —    | 点击 `rich` 的操作按钮时触发 |

- 其余属性与事件透传到包裹触发元素的根 `span`；根元素固定 `inline-flex`。
- 浮层用 fixed 定位并紧跟在触发元素之后渲染，因此 `Tab` 可以从触发元素进入富提示的操作按钮；
  窗口滚动、缩放时重新测量。
- `plain` 变体把文字通过 `aria-describedby` 关联到单个触发元素（多个元素时退回根元素）；`rich` 变体的面板是
  `role="dialog"`，标题用 `aria-labelledby` 关联。

### 可访问性

- `plain` 提示是纯描述，不接收焦点与指针；按 `Escape` 收起，键盘用户不会被困在提示里。
- `rich` 提示里可以放按钮：提示紧跟触发元素渲染，`Tab` 可进入面板；焦点移入面板时保持展开，按 `Escape`
  或在面板内点击操作后关闭，焦点回到触发的第一个可聚焦元素。
- 图标按钮必须始终提供 `label`，不要把唯一的说明只写进 Tooltip —— 触摸与读屏用户不一定能看到它。
