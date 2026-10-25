<script setup lang="ts">
import { ref } from "vue";
import { Icon, Input } from "@sharpdotnut/dotsharp";
import expandMore from "@iconify-icons/material-symbols/expand-more";
import mic from "@iconify-icons/material-symbols/mic";
import search from "@iconify-icons/material-symbols/search";

const name = ref("");
const amount = ref("55");
const searchText = ref("");
const email = ref("user@gmail.com");
const password = ref("secret123");
const username = ref("aurora");
const note = ref("");
const filled = ref("Aurora");
</script>

# Input 文本框

`v-model` 双向绑定的单行输入框 / 多行文本框，默认是 Material Design 3 的 **outlined** 样式：描边、浮动标签、可选的辅助文字与字数统计。

- 标签悬停（浮动）由 CSS 完成：聚焦或有内容时，标签上浮到描边缺口处，缺口由 `fieldset` / `legend` 切出，不需要给标签加背景色，因此在任何页面背景上都正确。
- `variant="filled"` 切换为浅色填充 + 底边的样式。
- `shape="pill"` 换成胶囊形搜索栏：无描边、浅色填充、40px 高、两端全圆角。
- 前置 / 尾部内容用 `#leading` / `#trailing` 插槽，也可以用 `leadingIcon` / `trailingIcon` 直接传图标数据。
- `type="password"` 自带明文切换，`clearable` 自带清除按钮，`state` 自带成功 / 错误图标。

## 基础用法

<div class="demo-row">
  <Input v-model="name" label="Username" description="*required" class="max-w-md" />
</div>

当前值：{{ name || '（空）' }}

```vue
<script setup lang="ts">
import { ref } from "vue";
import { Input } from "@sharpdotnut/dotsharp";

const name = ref("");
</script>

<template>
  <Input v-model="name" label="Username" description="*required" />
</template>
```

`label` 会同时作为原生 `<label for>` 的名称；已经用 `label` 时不要再传 `placeholder`，否则两者会在未聚焦的空状态下重叠。

## 字数统计

`maxlength` 会限制输入长度，并自动在辅助文字行的右侧显示 `当前 / 上限`。只想要计数、不限制长度时用 `showCount`。

<div class="demo-row">
  <Input v-model="amount" label="Amount" :maxlength="100" class="max-w-md" />
</div>

```vue
<script setup lang="ts">
import { ref } from "vue";
import { Input } from "@sharpdotnut/dotsharp";

const amount = ref("55");
</script>

<template>
  <Input v-model="amount" label="Amount" :maxlength="100" />
</template>
```

## 前置与尾部内容

`#leading` 和 `#trailing` 接受任意内容：图标、图片、按钮、下拉箭头，或完全自定义的排版。

<div class="demo-row">
  <Input v-model="searchText" label="Search" :leading-icon="search" :trailing-icon="mic" class="max-w-md" />
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
  <Input v-model="searchText" label="Search" :leading-icon="search" :trailing-icon="mic" />
</template>
```

插槽优先于同名图标属性，适合放图片或交互控件：

<div class="demo-row">
  <Input v-model="email" label="Email" class="max-w-md">
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
<template>
  <Input v-model="email" label="Email">
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
  <Input v-model="password" type="password" label="Password" clearable class="max-w-md" />
</div>

```vue
<script setup lang="ts">
import { ref } from "vue";
import { Input } from "@sharpdotnut/dotsharp";

const password = ref("secret123");
</script>

<template>
  <Input v-model="password" type="password" label="Password" clearable />
</template>
```

`type` 直通原生 `input`：`text`、`email`、`number`、`search`、`tel`、`url` 等都能用；`number` 下模型读到的仍是字符串。

## 校验状态

`state` 影响描边（聚焦时同色加粗）、浮动标签、辅助文字，并在尾部自动渲染状态图标：`success` 用 `check-circle`，`error` 用 `error`。

<div class="demo-row">
  <Input v-model="username" label="Username" state="error" error-message="用户名已被占用" class="max-w-md" />
  <Input v-model="email" label="Email" state="success" description="邮箱可用" class="max-w-md" />
</div>

```vue
<script setup lang="ts">
import { ref } from "vue";
import { Input } from "@sharpdotnut/dotsharp";

const username = ref("aurora");
const email = ref("user@gmail.com");
</script>

<template>
  <Input v-model="username" label="Username" state="error" error-message="用户名已被占用" />
  <Input v-model="email" label="Email" state="success" description="邮箱可用" />
</template>
```

`errorMessage` 只在 `state="error"` 时替换 `description`；`error` 状态同时输出 `aria-invalid`，辅助文字通过 `aria-describedby` 关联到控件。

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
  <Input v-model="filled" variant="filled" label="Name" description="filled 变体" class="max-w-md" />
</div>

```vue
<script setup lang="ts">
import { ref } from "vue";
import { Input } from "@sharpdotnut/dotsharp";

const filled = ref("Aurora");
</script>

<template>
  <Input v-model="filled" variant="filled" label="Name" description="filled 变体" />
</template>
```

`filled` 的标签固定在填充区顶部，聚焦时底边加粗，不使用 `fieldset` 缺口。

## 胶囊搜索栏

`shape="pill"` 换成材质 3 的搜索栏：去掉描边、改用 `--ds-surface-hover` 填充、高度 40px、两端全圆角；聚焦与校验状态用 `ring` 表示，不改变盒子尺寸。多行（`textarea`）时忽略该属性。

<div class="demo-row">
  <Input v-model="searchText" shape="pill" type="search" placeholder="Search" class="max-w-md" />
  <Input v-model="filled" shape="pill" state="error" placeholder="Error" class="max-w-md" />
</div>

```vue
<script setup lang="ts">
import { ref } from "vue";
import { Input } from "@sharpdotnut/dotsharp";

const searchText = ref("");
</script>

<template>
  <Input v-model="searchText" shape="pill" type="search" placeholder="Search" />
  <Input v-model="searchText" shape="pill" state="error" placeholder="Error" />
</template>
```

- 胶囊形没有标签缺口：`label` 不渲染成可见标签，只作为 `aria-label` 提供给读屏，视觉提示交给 `placeholder`。
- 胶囊形下 `variant` 不生效（既不画描边，也不加底边）。

## API

### 属性

| 属性         | 类型                                | 默认值       | 说明                                              |
| ------------ | ----------------------------------- | ------------ | ------------------------------------------------- |
| v-model      | `string \| number`                  | `""`         | 绑定值                                            |
| variant      | `"outlined" \| "filled"`            | `"outlined"` | 容器样式                                          |
| shape        | `"default" \| "pill"`               | `"default"`  | 容器形状；`pill` 为 40px 胶囊形搜索栏（多行忽略） |
| label        | `string`                            | —            | 浮动标签，同时作为控件的可访问名称                |
| type         | `string`                            | `"text"`     | 原生 `input` 类型                                 |
| state        | `"default" \| "success" \| "error"` | `"default"`  | 校验状态，影响描边、标签、辅助文字与状态图标      |
| disabled     | `boolean`                           | `false`      | 禁用                                              |
| readonly     | `boolean`                           | `false`      | 只读                                              |
| textarea     | `boolean`                           | `false`      | 渲染为多行 `<textarea>`                           |
| rows         | `number`                            | `3`          | `textarea` 的初始行数                             |
| clearable    | `boolean`                           | `false`      | 有内容时显示清除按钮                              |
| revealable   | `boolean`                           | `true`       | `type="password"` 时显示明文切换按钮              |
| leadingIcon  | `IconifyIcon \| string`             | —            | 前置图标；`#leading` 插槽优先                     |
| trailingIcon | `IconifyIcon \| string`             | —            | 尾部图标；`#trailing` 插槽优先                    |
| description  | `string`                            | —            | 辅助文字                                          |
| errorMessage | `string`                            | —            | `state="error"` 时替换辅助文字                    |
| maxlength    | `number`                            | —            | 最大长度，同时自动开启字数统计                    |
| showCount    | `boolean`                           | `false`      | 只显示字数统计、不限制长度                        |

### 插槽

| 插槽       | 说明                                                             |
| ---------- | ---------------------------------------------------------------- |
| `leading`  | 输入框前置内容，固定 `1.5rem` 宽并居中，通常是图标或头像图片     |
| `trailing` | 输入框尾部内容，宽度自适应，可放图标、图片、下拉箭头或自定义按钮 |

### 事件

| 事件                | 说明                                       |
| ------------------- | ------------------------------------------ |
| `update:modelValue` | 输入值变化                                 |
| `clear`             | 点击清除按钮，模型已被重置为 `""` 之后触发 |

### 可访问性

- `label` 通过 `for` 关联控件；`state="error"` 时控件带 `aria-invalid`。
- 辅助文字 / 错误信息会被控件的 `aria-describedby` 引用。
- 清除与明文切换是原生 `button`，带 `aria-label`；明文切换同时维护 `aria-pressed`。
- 根元素是 `div`：`class` / `style` 作用在根元素上，其余属性与事件（`id`、`name`、`autocomplete`、`inputmode`、`@blur` 等）透传给内部 `input` / `textarea`。
