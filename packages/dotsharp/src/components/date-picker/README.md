<script setup lang="ts">
import { ref } from "vue";
import { Button, DatePicker } from "@sharpdotnut/dotsharp";

const date = ref<Date | null>(new Date(2025, 7, 17));
const calendarOpen = ref(false);
const calendarDate = ref<Date | null>(null);
const inputOpen = ref(false);
const inputDate = ref<Date | null>(null);

function show(value: Date | null): string {
  if (!value) return "未选择";
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(
    value.getDate(),
  ).padStart(2, "0")}`;
}
</script>

# DatePicker 日期选择器

日历本体，可以三种方式使用：

- **卡片**：不带 `modal` 时直接摆在界面上，是页面里的一块内容。
- **模态**：加 `modal` 并用 `v-model:open` 控制，组件自带遮罩、焦点陷阱、Escape 与滚动锁定。
- **输入**：`mode="input"` 把日历换成日期输入框；头部右侧的按钮在两者之间切换。

选择过程有两步：点日期只更新草稿，`OK` 才写回 `v-model`；`Cancel` 丢弃草稿并关闭。
`actions="false"` 时点击日期立即提交、不显示按钮。

## 卡片

<div class="demo-row">
  <DatePicker v-model="date" />
</div>

当前值：{{ show(date) }}

```vue
<script setup lang="ts">
import { ref } from "vue";
import { DatePicker } from "@sharpdotnut/dotsharp";

const date = ref<Date | null>(new Date(2025, 7, 17));
</script>

<template>
  <DatePicker v-model="date" />
</template>
```

## 模态

`modal` 让组件 Teleport 到 `body` 并铺一层遮罩；`open` 为 `v-model:open`。

<div class="demo-row">
  <Button @click="calendarOpen = true">选择日期</Button>
  <DatePicker v-model="calendarDate" v-model:open="calendarOpen" modal />
</div>

当前值：{{ show(calendarDate) }}

```vue
<script setup lang="ts">
import { ref } from "vue";
import { Button, DatePicker } from "@sharpdotnut/dotsharp";

const open = ref(false);
const date = ref<Date | null>(null);
</script>

<template>
  <Button @click="open = true">选择日期</Button>
  <DatePicker v-model="date" v-model:open="open" modal />
</template>
```

## 输入模式

`mode="input"` 打开时显示日期输入框，而不是日历；头部按钮可以在日历与输入之间来回切换。

<div class="demo-row">
  <Button @click="inputOpen = true">输入日期</Button>
  <DatePicker v-model="inputDate" v-model:open="inputOpen" modal mode="input" />
</div>

当前值：{{ show(inputDate) }}

```vue
<template>
  <DatePicker v-model="date" v-model:open="open" modal mode="input" />
</template>
```

输入框按当前语言接受数字日期（英文 `MM/DD/YYYY`，中日 `YYYY/MM/DD`），失焦或按 `OK` 时解析；
无法解析的输入会被标红并阻止提交。

## 头部与操作

- `header="false"` 去掉「小标题 + 大号日期 + 模式切换」，嵌入弹出层时使用（`DateInput` 就是这样做的）。
- `title` 换掉头部的小标题，默认是当前语言的「选择日期」。

## 视图

头部左侧的「月份 年份」按钮循环切换 日历 → 月份列表 → 年份网格；两侧箭头在三种视图里
分别移动一个月、一年、十二年。今天有描边圆圈，已选日期是实心圆。

## 键盘

日历使用 `role="grid"`，日期格子是 `gridcell` 且维护 roving tabindex：

- 方向键逐日 / 逐周移动，`PageUp` / `PageDown` 逐月；
- `Home` / `End` 跳到本周的第一天 / 最后一天；
- `Enter` / `Space` 选中当前格子。

## API

| 属性      | 类型                    | 默认值       | 说明                           |
| --------- | ----------------------- | ------------ | ------------------------------ |
| `v-model` | `Date \| null`          | `null`       | 选中的日期                     |
| `open`    | `boolean`               | `false`      | 模态层的开关（`v-model:open`） |
| `modal`   | `boolean`               | `false`      | 以模态层呈现                   |
| `mode`    | `"calendar" \| "input"` | `"calendar"` | 正文初始模式                   |
| `title`   | `string`                | 当前语言     | 头部小标题                     |
| `header`  | `boolean`               | `true`       | 是否显示头部                   |
| `actions` | `boolean`               | `true`       | 是否显示 Cancel / OK           |

事件：`confirm(value)` 在提交后触发（`actions="false"` 时点击日期也会触发），`cancel` 在取消时触发。
