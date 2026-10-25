<script setup lang="ts">
import { ref } from "vue";
import { TimeInput } from "@sharpdotnut/dotsharp";
import type { TimeValue } from "@sharpdotnut/dotsharp";

const time = ref<TimeValue | null>({ hour: 7, minute: 0 });
const picked = ref<TimeValue | null>(null);
const modalTime = ref<TimeValue | null>({ hour: 20, minute: 15 });
const plain = ref<TimeValue | null>({ hour: 9, minute: 30 });
const precise = ref<TimeValue | null>({ hour: 20, minute: 15, second: 30 });

function show(value: TimeValue | null): string {
  if (!value) return "未选择";
  const clock = `${String(value.hour).padStart(2, "0")}:${String(value.minute).padStart(2, "0")}`;
  return value.second === undefined ? clock : `${clock}:${String(value.second).padStart(2, "0")}`;
}
</script>

# TimeInput 时间输入框

把 `Input` 的时间模式与时钟按钮合在一起：直接输入时刻，或点右侧时钟按钮打开选择器。

- `v-model` 绑定 `TimeValue | null`；输入框里的文本按 `format` 显示（`07:00 AM` 或 `20:00`）。
- 失焦或回车时解析输入；非法时刻标红并显示错误，合法时刻写回模型。
- `format` 省略时取当前语言的默认时钟格式；`picker="false"` 去掉时钟按钮，只剩输入。
- `seconds` 打开秒：文本变成 `20:15:30` / `8:15:30 PM`，选择器里多一个秒字段。
- 标签始终浮动在描边上方，空值时占位提示（`hh:mm`）仍完整可见。
- 选择器默认是贴着输入框的弹出层；`modal` 改成模态对话框，`layout` 决定选择器的排布。

## 基础用法

<div class="demo-row">
  <TimeInput v-model="time" class="w-full max-w-sm" />
</div>

当前值：{{ show(time) }}

```vue
<script setup lang="ts">
import { ref } from "vue";
import { TimeInput } from "@sharpdotnut/dotsharp";
import type { TimeValue } from "@sharpdotnut/dotsharp";

const time = ref<TimeValue | null>({ hour: 7, minute: 0 });
</script>

<template>
  <TimeInput v-model="time" />
</template>
```

输入接受 `20:00`、`7:5`、`7:05 PM` 这类写法，分隔符可以是 `:`、`：` 或 `.`。
24 小时制拒绝 AM/PM 与大于 23 的小时；12 小时制的小时必须是 1–12，省略 AM/PM 时按上午处理。

## 弹出层选择

默认点时钟按钮打开贴住输入框的表盘，按 `Cancel` / `OK` 提交或丢弃。

<div class="demo-row">
  <TimeInput v-model="picked" format="24h" label="时间" class="w-full max-w-sm" />
</div>

当前值：{{ show(picked) }}

```vue
<template>
  <TimeInput v-model="picked" format="24h" />
</template>
```

## 模态选择器

`modal` 把表盘换成模态对话框，适合窄屏或需要打断当前流程的场景。

<div class="demo-row">
  <TimeInput v-model="modalTime" modal label="时间" class="w-full max-w-sm" />
</div>

当前值：{{ show(modalTime) }}

```vue
<template>
  <TimeInput v-model="time" modal />
</template>
```

## 横向选择器

`layout="horizontal"` 让模态 / 弹出层里的表盘排在字段右侧。

<div class="demo-row">
  <TimeInput v-model="plain" layout="horizontal" format="12h" class="w-full max-w-sm" />
</div>

当前值：{{ show(plain) }}

```vue
<template>
  <TimeInput v-model="time" layout="horizontal" format="12h" />
</template>
```

## 秒

`seconds` 让字段与文本都带上秒，解析时也接受第三段。

<div class="demo-row">
  <TimeInput v-model="precise" seconds format="24h" class="w-full max-w-sm" />
</div>

当前值：{{ show(precise) }}

```vue
<template>
  <TimeInput v-model="time" seconds format="24h" />
</template>
```

## 纯输入

`picker="false"` 去掉时钟按钮，只保留可输入的时间字段。

<div class="demo-row">
  <TimeInput v-model="plain" :picker="false" class="w-full max-w-sm" />
</div>

```vue
<template>
  <TimeInput v-model="time" :picker="false" />
</template>
```

## 表单校验

`validator` 接收当前值（`TimeValue | null`），返回 `false` 表示通过；返回 `true` 或错误文案表示不通过。默认在失焦与选择时间后校验，用 `validateOn` 调整；也暴露 `validate()` / `clearValidate()`。输入无法解析时仍然按内部解析错误显示，优先于验证函数。完整约定见[表单指南](/guide/form)。

## API

| 属性          | 类型                                              | 默认值              | 说明                                          |
| ------------- | ------------------------------------------------- | ------------------- | --------------------------------------------- |
| `v-model`     | `TimeValue \| null`                               | `null`              | 选中的时间                                    |
| `label`       | `string`                                          | 当前语言的「时间」  | 浮动标签                                      |
| `format`      | `"12h" \| "24h"`                                  | 当前语言            | 时钟格式                                      |
| `variant`     | `"outlined" \| "filled"`                          | `"outlined"`        | 容器样式，与 `Input` 一致                     |
| `disabled`    | `boolean`                                         | `false`             | 禁用                                          |
| `readonly`    | `boolean`                                         | `false`             | 只读                                          |
| `description` | `string`                                          | 时钟格式提示        | 字段下方的辅助文字                            |
| `picker`      | `boolean`                                         | `true`              | 是否显示时钟按钮                              |
| `modal`       | `boolean`                                         | `false`             | 选择器以模态对话框打开                        |
| `seconds`     | `boolean`                                         | `false`             | 是否显示秒                                    |
| `layout`      | `"vertical" \| "horizontal"`                      | `"vertical"`        | 选择器的排布                                  |
| `title`       | `string`                                          | 当前语言            | 模态选择器的标题                              |
| `validator`   | `(value: TimeValue \| null) => boolean \| string` | —                   | 验证函数：`false` 通过，`true` / 字符串不通过 |
| `validateOn`  | `"input" \| "blur" \| ("input" \| "blur")[]`      | `["input", "blur"]` | 自动校验时机；传 `[]` 关闭自动校验            |
