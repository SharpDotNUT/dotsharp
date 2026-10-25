<script setup lang="ts">
import { ref } from "vue";
import { DateInput } from "@sharpdotnut/dotsharp";

const date = ref<Date | null>(new Date(2025, 7, 17));
const picked = ref<Date | null>(null);
const modalDate = ref<Date | null>(null);

function show(value: Date | null): string {
  if (!value) return "未选择";
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(
    value.getDate(),
  ).padStart(2, "0")}`;
}
</script>

# DateInput 日期输入框

把 `Input` 的日期模式与日历按钮合在一起：直接输入数字日期，或点右侧日历按钮打开选择器。

- `v-model` 绑定 `Date | null`；输入框里始终按当前语言的顺序显示（英文 `MM/DD/YYYY`，中日 `YYYY/MM/DD`）。
- 失焦或回车时解析输入；非法日期标红并显示错误，合法日期写回模型。
- `picker="false"` 去掉日历按钮，只剩输入。
- 标签始终浮动在描边上方，空值时占位提示（`mm/dd/yyyy`）仍完整可见。
- 选择器默认是贴着输入框的弹出层；`modal` 改成模态对话框。
- `description` 默认显示数字顺序提示，可以换成自己的说明。

## 基础用法

<div class="demo-row">
  <DateInput v-model="date" class="w-full max-w-sm" />
</div>

当前值：{{ show(date) }}

```vue
<script setup lang="ts">
import { ref } from "vue";
import { DateInput } from "@sharpdotnut/dotsharp";

const date = ref<Date | null>(new Date(2025, 7, 17));
</script>

<template>
  <DateInput v-model="date" />
</template>
```

输入框接受 `/`、`-`、`.` 或空格作分隔符，例如 `08/17/2025`、`2025-8-17`；
年份需要写满四位，`2 月 30 日` 这类不存在的日期会被拒绝。

## 弹出层选择

默认 `picker` 打开贴住输入框的日历弹出层，按 `Cancel` / `OK` 提交或丢弃。

<div class="demo-row">
  <DateInput v-model="picked" label="日期" class="w-full max-w-sm" />
</div>

当前值：{{ show(picked) }}

```vue
<template>
  <DateInput v-model="picked" label="日期" />
</template>
```

## 模态选择器

`modal` 把日历换成模态对话框，适合窄屏或需要打断当前流程的场景。

<div class="demo-row">
  <DateInput v-model="modalDate" modal label="日期" class="w-full max-w-sm" />
</div>

当前值：{{ show(modalDate) }}

```vue
<template>
  <DateInput v-model="modalDate" modal label="日期" />
</template>
```

## 样式

`variant` 与 `Input` 一致（`outlined` / `filled`）；`state`、`errorMessage`、`disabled`、`readonly` 也直接透传给
内部的 `Input`，内部解析失败时组件会自行切到 error。

<div class="demo-row">
  <DateInput v-model="date" variant="filled" label="填充样式" class="w-full max-w-sm" />
  <DateInput :model-value="null" label="禁用" disabled class="w-full max-w-sm" />
</div>

## API

| 属性           | 类型                                | 默认值         | 说明                         |
| -------------- | ----------------------------------- | -------------- | ---------------------------- |
| `v-model`      | `Date \| null`                      | `null`         | 选中日期                     |
| `label`        | `string`                            | 当前语言的日期 | 浮动标签                     |
| `variant`      | `"outlined" \| "filled"`            | `"outlined"`   | 容器样式                     |
| `state`        | `"default" \| "success" \| "error"` | `"default"`    | 外部校验状态                 |
| `disabled`     | `boolean`                           | `false`        | 禁用                         |
| `readonly`     | `boolean`                           | `false`        | 只读                         |
| `description`  | `string`                            | 数字顺序提示   | 辅助文字                     |
| `errorMessage` | `string`                            | —              | `state="error"` 时的错误信息 |
| `picker`       | `boolean`                           | `true`         | 是否显示日历按钮             |
| `modal`        | `boolean`                           | `false`        | 选择器以模态对话框打开       |
| `pickerMode`   | `"calendar" \| "input"`             | `"calendar"`   | 模态选择器的初始模式         |
| `title`        | `string`                            | 当前语言       | 模态选择器的标题             |
