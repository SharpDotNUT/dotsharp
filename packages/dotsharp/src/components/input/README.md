<script setup lang="ts">
import { ref } from "vue";
import { Icon, Input } from "@sharpdotnut/dotsharp";
import expandMore from "@iconify-icons/material-symbols/expand-more";
import mic from "@iconify-icons/material-symbols/mic";
import search from "@iconify-icons/material-symbols/search";

const name = ref("");
const nickname = ref("");
const amount = ref("55");
const searchText = ref("");
const email = ref("user@gmail.com");
const password = ref("secret123");
const username = ref("aurora");
const note = ref("");
const filled = ref("晓雨");
const fruit = ref("黑");
const usernameValidator = (value: string | number) =>
  String(value).trim().length >= 2 ? false : "用户名至少 2 个字符";
const fruits = [
  "苹果",
  "杏",
  "香蕉",
  "黑莓",
  "蓝莓",
  "樱桃",
  "葡萄",
  "桃",
];
function suggestFruit(input: string): string[] {
  const keyword = input.trim().toLowerCase();
  if (!keyword) return fruits;
  return fruits.filter((item) => item.toLowerCase().includes(keyword));
}
</script>

# Input 文本框

`v-model` 双向绑定的单行输入框 / 多行文本框，默认是 **outlined** 样式：描边、浮动标签、可选的辅助文字与字数统计。

- 标签悬停（浮动）由 CSS 完成：聚焦或有内容时，标签上浮到描边缺口处，缺口由 `fieldset` / `legend` 切出，不需要给标签加背景色，因此在任何页面背景上都正确。
- `variant="filled"` 切换为浅色填充 + 底边的样式。
- `shape="pill"` 换成胶囊形搜索栏：无描边、浅色填充、40px 高、两端全圆角。
- 前置 / 尾部内容用 `#leading` / `#trailing` 插槽，也可以用 `leadingIcon` / `trailingIcon` 直接传图标数据。
- `type="password"` 自带明文切换，`clearable` 自带清除按钮；传 `validator` 后，不通过时描边、标签、辅助文字与尾部图标一起切到错误样式。

## 基础用法

<div class="demo-row">
  <Input v-model="name" label="用户名" description="必填" class="max-w-md" />
</div>

当前值：{{ name || '（空）' }}

```vue
<script setup lang="ts">
import { ref } from "vue";
import { Input } from "@sharpdotnut/dotsharp";

const name = ref("");
</script>

<template>
  <Input v-model="name" label="用户名" description="必填" />
</template>
```

`label` 会同时作为原生 `<label for>` 的名称。

## 标签与 placeholder

`label` 和 `placeholder` 可以同时使用，两者不会重叠：未聚焦的空状态下只显示居中的标签；标签上浮后才显示 `placeholder`，用户开始输入后它又随原生行为消失。

<div class="demo-row">
  <Input v-model="nickname" label="昵称" placeholder="例如 aurora" class="max-w-md" />
</div>

当前值：{{ nickname || '（空）' }}

```vue
<script setup lang="ts">
import { ref } from "vue";
import { Input } from "@sharpdotnut/dotsharp";

const nickname = ref("");
</script>

<template>
  <Input v-model="nickname" label="昵称" placeholder="例如 aurora" />
</template>
```

标签的上浮时机决定了 `placeholder` 何时出现：

| 情况                                         | 标签位置           | `placeholder`          |
| -------------------------------------------- | ------------------ | ---------------------- |
| outlined，默认                               | 聚焦或有内容时上浮 | 上浮后出现             |
| `floatLabel`、`textarea`、`variant="filled"` | 始终在顶部         | 空值时始终显示         |
| `shape="pill"`                               | 不渲染可见标签     | 始终显示（即搜索提示） |

标签未上浮时 DOM 上没有 `placeholder` 属性，可访问名称始终来自 `label`，不受影响。

## 字数统计

`maxlength` 会限制输入长度，并自动在辅助文字行的右侧显示 `当前 / 上限`。只想要计数、不限制长度时用 `showCount`。

<div class="demo-row">
  <Input v-model="amount" label="金额" :maxlength="100" class="max-w-md" />
</div>

```vue
<script setup lang="ts">
import { ref } from "vue";
import { Input } from "@sharpdotnut/dotsharp";

const amount = ref("55");
</script>

<template>
  <Input v-model="amount" label="金额" :maxlength="100" />
</template>
```

## 前置与尾部内容

`#leading` 和 `#trailing` 接受任意内容：图标、图片、按钮、下拉箭头，或完全自定义的排版。

<div class="demo-row">
  <Input v-model="searchText" label="搜索" :leading-icon="search" :trailing-icon="mic" class="max-w-md" />
</div>

```vue
<script setup lang="ts">
import { ref } from "vue";
import { Input } from "@sharpdotnut/dotsharp";
import mic from "@iconify-icons/material-symbols/mic";
import search from "@iconify-icons/material-symbols/search";

const searchText = ref("");
</script>

<template>
  <Input v-model="searchText" label="搜索" :leading-icon="search" :trailing-icon="mic" />
</template>
```

插槽优先于同名图标属性，适合放图片或交互控件：

<div class="demo-row">
  <Input v-model="email" label="邮箱" class="max-w-md">
    <template #trailing>
      <button
        type="button"
        class="inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded-full text-ds-muted transition-colors hover:bg-ds-fg/10 hover:text-ds-fg"
        aria-label="选择邮箱"
      >
        <Icon :icon="expandMore" />
      </button>
    </template>
  </Input>
</div>

```vue
<script setup lang="ts">
import { ref } from "vue";
import { Icon, Input } from "@sharpdotnut/dotsharp";
import expandMore from "@iconify-icons/material-symbols/expand-more";

const email = ref("user@gmail.com");
</script>

<template>
  <Input v-model="email" label="邮箱">
    <template #trailing>
      <button type="button" aria-label="选择邮箱">
        <Icon :icon="expandMore" />
      </button>
    </template>
  </Input>
</template>
```

- 前置内容固定占 `1.5rem` 宽并居中，浮动标签据此对齐描边缺口；放图片时用 `class="h-6 w-6 rounded-full"` 之类的尺寸。
- 尾部内容宽度自适应，不参与标签排版，可以放心放长文本或按钮。
- 图标建议继续用 `Icon`（见 [Icon 图标](/components/icon)），直接传 `@iconify-icons/material-symbols` 的图标数据。

## 清除与密码可见性

`clearable` 在有内容时显示清除按钮，点击后把模型设为 `""`、回焦输入框并触发 `clear` 事件。`type="password"` 默认带明文切换按钮；`revealable="false"` 可关闭。

<div class="demo-row">
  <Input v-model="password" type="password" label="密码" clearable class="max-w-md" />
</div>

```vue
<script setup lang="ts">
import { ref } from "vue";
import { Input } from "@sharpdotnut/dotsharp";

const password = ref("secret123");
</script>

<template>
  <Input v-model="password" type="password" label="密码" clearable />
</template>
```

`type` 直通原生 `input`：`text`、`email`、`number`、`search`、`tel`、`url` 等都能用；`number` 下模型读到的仍是字符串。

## 自动完成

`autocomplete` 是原生属性名，因此候选函数用 **`suggest`**：它接收当前输入文本，同步返回候选文本数组，渲染为与 `Select` / `Menu` 同一套规格的弹层（`elevated` 底色、4px 圆角、阴影、48px 行高）。

<div class="demo-row">
  <Input v-model="fruit" label="水果" :suggest="suggestFruit" clearable class="max-w-md" />
</div>

当前值：{{ fruit || '（空）' }}

```vue
<script setup lang="ts">
import { ref } from "vue";
import { Input } from "@sharpdotnut/dotsharp";

const fruit = ref("黑");
const fruits = ["苹果", "杏", "香蕉", "黑莓", "蓝莓", "樱桃", "葡萄", "桃"];

function suggestFruit(input: string): string[] {
  const keyword = input.trim().toLowerCase();
  if (!keyword) return fruits;
  return fruits.filter((item) => item.toLowerCase().includes(keyword));
}
</script>

<template>
  <Input v-model="fruit" label="水果" :suggest="suggestFruit" clearable />
</template>
```

- 聚焦或输入时打开，函数返回空数组、`Escape`、`Tab` 或点击外部时收起；用代码改 `v-model` 不会弹出候选栏。
- 键盘遵循 ARIA combobox 模式：`↓` / `↑` 移动高亮、`Enter` 采用高亮项、`Escape` 收起；没有高亮项时 `Enter` 仍按原生行为提交。
- 选中后模型被替换为候选文本，并触发 `select` 事件；候选栏宽度与输入框一致，视口下方空间不足时向上展开。
- 只对单行文本框生效（`textarea` 忽略）；`disabled` / `readonly` 下不弹出。原生 `autocomplete` 属性仍照常透传给 `<input>`。

## 多行文本

`textarea` 渲染为 `<textarea>`，`rows` 控制初始行数，`maxlength` / `showCount` / `clearable` 等行为保持一致。多行时标签总是浮在描边缺口上。

<div class="demo-row">
  <Input
    v-model="note"
    textarea
    label="备注"
    :rows="3"
    :maxlength="120"
    description="最多 120 个字符"
    class="max-w-md"
  />
</div>

```vue
<script setup lang="ts">
import { ref } from "vue";
import { Input } from "@sharpdotnut/dotsharp";

const note = ref("");
</script>

<template>
  <Input
    v-model="note"
    textarea
    label="备注"
    :rows="3"
    :maxlength="120"
    description="最多 120 个字符"
  />
</template>
```

## Filled 变体

<div class="demo-row">
  <Input v-model="filled" variant="filled" label="名称" description="filled 变体" class="max-w-md" />
</div>

```vue
<script setup lang="ts">
import { ref } from "vue";
import { Input } from "@sharpdotnut/dotsharp";

const filled = ref("晓雨");
</script>

<template>
  <Input v-model="filled" variant="filled" label="名称" description="filled 变体" />
</template>
```

`filled` 的标签固定在填充区顶部，聚焦时底边加粗，不使用 `fieldset` 缺口。

## 胶囊搜索栏

`shape="pill"` 换成胶囊形搜索栏：去掉描边、改用 `--ds-surface-hover` 填充、高度 40px、两端全圆角；聚焦与校验不通过用 `ring` 表示，不改变盒子尺寸。多行（`textarea`）时忽略该属性。

<div class="demo-row">
  <Input v-model="searchText" shape="pill" type="search" placeholder="搜索" class="max-w-md" />
</div>

```vue
<script setup lang="ts">
import { ref } from "vue";
import { Input } from "@sharpdotnut/dotsharp";

const searchText = ref("");
</script>

<template>
  <Input v-model="searchText" shape="pill" type="search" placeholder="搜索" />
</template>
```

- 胶囊形没有标签缺口：`label` 不渲染成可见标签，只作为 `aria-label` 提供给读屏，视觉提示交给 `placeholder`。
- 胶囊形下 `variant` 不生效（既不画描边，也不加底边）。

## 表单校验

`validator` 接收当前值，返回 `false` 表示通过；返回 `true` 或错误文案表示不通过。默认在输入与失焦时各校验一次，用 `validateOn` 调整；控件还暴露 `validate()` / `clearValidate()`。

<div class="demo-row">
  <Input v-model="username" label="用户名" :validator="usernameValidator" class="max-w-md" />
</div>

```vue
<script setup lang="ts">
import { ref } from "vue";
import { Input } from "@sharpdotnut/dotsharp";

const username = ref("aurora");
const usernameValidator = (value: string | number) =>
  String(value).trim().length >= 2 ? false : "用户名至少 2 个字符";
</script>

<template>
  <Input v-model="username" label="用户名" :validator="usernameValidator" />
</template>
```

不通过时描边、标签、辅助文字与尾部错误图标一起切到错误样式，错误文案优先使用验证函数返回的字符串。放在 `Form` / `FormItem` 里时，`Form.validate()` 会一起校验；完整约定见[表单指南](/guide/form)。

## API

### 属性

| 属性         | 类型                                         | 默认值              | 说明                                              |
| ------------ | -------------------------------------------- | ------------------- | ------------------------------------------------- |
| v-model      | `string \| number`                           | `""`                | 绑定值                                            |
| variant      | `"outlined" \| "filled"`                     | `"outlined"`        | 容器样式                                          |
| shape        | `"default" \| "pill"`                        | `"default"`         | 容器形状；`pill` 为 40px 胶囊形搜索栏（多行忽略） |
| label        | `string`                                     | —                   | 浮动标签，同时作为控件的可访问名称                |
| placeholder  | `string`                                     | —                   | 原生属性；与 `label` 同用时只在标签上浮后显示     |
| floatLabel   | `boolean`                                    | `false`             | 标签始终上浮；默认仅在聚焦或有内容时上浮          |
| type         | `string`                                     | `"text"`            | 原生 `input` 类型                                 |
| disabled     | `boolean`                                    | `false`             | 禁用                                              |
| readonly     | `boolean`                                    | `false`             | 只读                                              |
| textarea     | `boolean`                                    | `false`             | 渲染为多行 `<textarea>`                           |
| rows         | `number`                                     | `3`                 | `textarea` 的初始行数                             |
| clearable    | `boolean`                                    | `false`             | 有内容时显示清除按钮                              |
| revealable   | `boolean`                                    | `true`              | `type="password"` 时显示明文切换按钮              |
| leadingIcon  | `IconifyIcon \| string`                      | —                   | 前置图标；`#leading` 插槽优先                     |
| trailingIcon | `IconifyIcon \| string`                      | —                   | 尾部图标；`#trailing` 插槽优先                    |
| description  | `string`                                     | —                   | 辅助文字                                          |
| validator    | `(value) => boolean \| string`               | —                   | 验证函数：`false` 通过，`true` / 字符串不通过     |
| validateOn   | `"input" \| "blur" \| ("input" \| "blur")[]` | `["input", "blur"]` | 自动校验时机；传 `[]` 关闭自动校验                |
| maxlength    | `number`                                     | —                   | 最大长度，同时自动开启字数统计                    |
| showCount    | `boolean`                                    | `false`             | 只显示字数统计、不限制长度                        |
| suggest      | `(input: string) => string[]`                | —                   | 自动完成候选函数；返回空数组时收起候选栏          |

### 插槽

| 插槽       | 说明                                                             |
| ---------- | ---------------------------------------------------------------- |
| `leading`  | 输入框前置内容，固定 `1.5rem` 宽并居中，通常是图标或头像图片     |
| `trailing` | 输入框尾部内容，宽度自适应，可放图标、图片、下拉箭头或自定义按钮 |

### 事件

| 事件                | 说明                                         |
| ------------------- | -------------------------------------------- |
| `update:modelValue` | 输入值变化                                   |
| `clear`             | 点击清除按钮，模型已被重置为 `""` 之后触发   |
| `select`            | 从自动完成候选栏选中一项，模型已更新之后触发 |

### 可访问性

- `label` 通过 `for` 关联控件；校验不通过时控件带 `aria-invalid`。
- 辅助文字 / 错误信息会被控件的 `aria-describedby` 引用。
- 清除与明文切换是原生 `button`，带 `aria-label`；明文切换同时维护 `aria-pressed`。
- 提供 `suggest` 时控件是 `role="combobox"` + `aria-autocomplete="list"`，通过 `aria-expanded` / `aria-controls` / `aria-activedescendant` 关联候选栏（`role="listbox"` 与 `role="option"`）。
- 根元素是 `div`：`class` / `style` 作用在根元素上，其余属性与事件（`id`、`name`、`autocomplete`、`inputmode`、`@blur` 等）透传给内部 `input` / `textarea`。
