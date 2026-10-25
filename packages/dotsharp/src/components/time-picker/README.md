<script setup lang="ts">
import { ref } from "vue";
import { Button, TimePicker } from "@sharpdotnut/dotsharp";
import type { TimeValue } from "@sharpdotnut/dotsharp";

const morning = ref<TimeValue | null>({ hour: 7, minute: 0 });
const night = ref<TimeValue | null>({ hour: 20, minute: 0 });
const wide = ref<TimeValue | null>({ hour: 7, minute: 0 });
const modalOpen = ref(false);
const modalTime = ref<TimeValue | null>(null);
const precise = ref<TimeValue | null>({ hour: 7, minute: 5, second: 9 });

function show(value: TimeValue | null): string {
  if (!value) return "未选择";
  const clock = `${String(value.hour).padStart(2, "0")}:${String(value.minute).padStart(2, "0")}`;
  return value.second === undefined ? clock : `${clock}:${String(value.second).padStart(2, "0")}`;
}
</script>

# TimePicker 时间选择器

表盘本体，可以两种方式使用：

- **卡片**：不带 `modal` 时直接摆在界面上，是页面里的一块内容。
- **模态**：加 `modal` 并用 `v-model:open` 控制，组件自带遮罩、焦点陷阱、Escape 与滚动锁定。

`v-model` 绑定 `TimeValue | null`（`{ hour: 0–23, minute: 0–59, second?: 0–59 }`）。选择过程是分步的：
改值只更新草稿，`OK` 才写回 `v-model`；`Cancel` 丢弃草稿并关闭。`actions="false"` 时选完分钟立即提交、
不显示按钮。

时钟格式由 `format` 决定：`"12h"` 显示 AM/PM 列，`"24h"` 用内外两圈数字排下 0–23。省略时取当前语言的
默认值（`en` 是 12 小时制，中日是 24 小时制）。

## 直接编辑

顶部的小时 / 分钟（以及可选的秒）就是输入框：点进去全选，直接敲数字，满两位自动跳到下一段；
`↑` / `↓` 加减 1，回车提交。表盘与输入框编辑同一份草稿，不需要切换模式。

已经输入的时间始终是合法值：越界或被清空的文本在失焦时恢复成草稿里的值。

## 12 小时制

<div class="demo-row">
  <TimePicker v-model="morning" format="12h" />
</div>

当前值：{{ show(morning) }}

```vue
<script setup lang="ts">
import { ref } from "vue";
import { TimePicker } from "@sharpdotnut/dotsharp";
import type { TimeValue } from "@sharpdotnut/dotsharp";

const time = ref<TimeValue | null>({ hour: 7, minute: 0 });
</script>

<template>
  <TimePicker v-model="time" format="12h" />
</template>
```

## 24 小时制

24 小时制下，0–11 在外圈、12–23 在内圈（`00` 与 `12` 都在 12 点方向）。
拖动时指针跨过两圈之间的分界就会换圈：往外拖选 0–11，往内拖选 12–23。

<div class="demo-row">
  <TimePicker v-model="night" format="24h" />
</div>

当前值：{{ show(night) }}

```vue
<template>
  <TimePicker v-model="time" format="24h" />
</template>
```

## 横向布局

`layout="horizontal"` 把表盘放到右侧，宽屏或平板用它；默认的纵向布局适合手机。
横向时 AM/PM 是一整行，贴着左栏底部对齐。

<div class="demo-row">
  <TimePicker v-model="wide" format="12h" layout="horizontal" />
</div>

当前值：{{ show(wide) }}

```vue
<template>
  <TimePicker v-model="time" format="12h" layout="horizontal" />
</template>
```

## 秒

`seconds` 在小时与分钟后面加一个秒输入框，并让 `TimeValue` 带上 `second`。表盘仍然只选小时与分钟，
秒用键盘或上下键改。

<div class="demo-row">
  <TimePicker v-model="precise" format="24h" seconds />
</div>

当前值：{{ show(precise) }}

```vue
<template>
  <TimePicker v-model="time" format="24h" seconds />
</template>
```

## 模态

`modal` 让组件 Teleport 到 `body` 并铺一层遮罩；`open` 为 `v-model:open`。

<div class="demo-row">
  <Button @click="modalOpen = true">选择时间</Button>
  <TimePicker v-model="modalTime" v-model:open="modalOpen" modal />
</div>

当前值：{{ show(modalTime) }}

```vue
<script setup lang="ts">
import { ref } from "vue";
import { Button, TimePicker } from "@sharpdotnut/dotsharp";

const open = ref(false);
const time = ref(null);
</script>

<template>
  <Button @click="open = true">选择时间</Button>
  <TimePicker v-model="time" v-model:open="open" modal />
</template>
```

## 表盘与键盘

- 聚焦小时 / 分钟字段即切换表盘编辑的对象；选完小时自动跳到分钟。
- 在表盘上拖动指针即可连续选择；24 小时制按指针到圆心的距离实时决定内外圈。
- 表盘可获得焦点：左右/上下方向键加减 1，`PageUp` / `PageDown` 加减 5，`Home` / `End` 跳到首尾。

## 头部与操作

- `header="false"` 去掉小标题，嵌入弹出层时使用（`TimeInput` 就是这样做的）。
- `title` 换掉头部的小标题，默认是当前语言的「选择时间」。

## API

| 属性      | 类型                         | 默认值       | 说明                           |
| --------- | ---------------------------- | ------------ | ------------------------------ |
| `v-model` | `TimeValue \| null`          | `null`       | 选中的时间                     |
| `open`    | `boolean`                    | `false`      | 模态层的开关（`v-model:open`） |
| `modal`   | `boolean`                    | `false`      | 以模态层呈现                   |
| `format`  | `"12h" \| "24h"`             | 当前语言     | 时钟格式                       |
| `layout`  | `"vertical" \| "horizontal"` | `"vertical"` | 表盘在下方还是右侧             |
| `seconds` | `boolean`                    | `false`      | 是否显示秒输入                 |
| `title`   | `string`                     | 当前语言     | 头部小标题                     |
| `header`  | `boolean`                    | `true`       | 是否显示头部                   |
| `actions` | `boolean`                    | `true`       | 是否显示 Cancel / OK           |

事件：`confirm(value)` 在提交后触发（`actions="false"` 时选完分钟也会触发），`cancel` 在取消时触发。
