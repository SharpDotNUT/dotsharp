<script setup lang="ts">
import { ref } from "vue";
import { OptInputs } from "@sharpdotnut/dotsharp";

const code = ref("");
const completed = ref("");
const letters = ref("");
const freeText = ref("");
const masked = ref("");
const noPaste = ref("");
</script>

# OptInputs 分组输入框

把 `length` 个方形输入格并排组合成一个字段，适合验证码、PIN 码、卡号分段等场景。

- `v-model` 是各格从左到右拼接后的字符串；空位不会保留，值始终是连续的前缀。
- `accept` 决定允许的字符：`numeric`（数字，默认）、`alpha`（英文字母）、`any`（任意单一字符）。
- `mask` 打开掩码，屏幕上用圆点代替字符，模型里仍是原始值。
- 粘贴默认开启：剪贴板内容会先按 `accept` 过滤，再从当前格开始填入；`allow-paste="false"` 直接阻止粘贴。
- 所有格子填满时触发 `complete`，携带完整字符串；删掉一格再补满会再次触发。

## 基础用法

<div class="demo-row">
  <OptInputs v-model="code" label="验证码" @complete="completed = $event" />
</div>

当前值：{{ code || '（空）' }}　完成事件：{{ completed || '（未触发）' }}

```vue
<script setup lang="ts">
import { ref } from "vue";
import { OptInputs } from "@sharpdotnut/dotsharp";

const code = ref("");
const completed = ref("");
</script>

<template>
  <OptInputs v-model="code" label="验证码" @complete="completed = $event" />
</template>
```

## 字母与任意字符

`accept="alpha"` 只接受 `A–Z` / `a–z`；`accept="any"` 接受任意单一字符（含空格、符号与 emoji）。

<div class="demo-row">
  <OptInputs v-model="letters" accept="alpha" :length="4" label="邀请码" />
  <OptInputs v-model="freeText" accept="any" :length="3" label="任意字符" />
</div>

```vue
<script setup lang="ts">
import { ref } from "vue";
import { OptInputs } from "@sharpdotnut/dotsharp";

const letters = ref("");
const freeText = ref("");
</script>

<template>
  <OptInputs v-model="letters" accept="alpha" :length="4" label="邀请码" />
  <OptInputs v-model="freeText" accept="any" :length="3" label="任意字符" />
</template>
```

## 掩码显示

`mask` 让每一格显示为圆点，适用于 PIN 码；粘贴、过滤与 `complete` 行为不变。

<div class="demo-row">
  <OptInputs v-model="masked" mask :length="4" label="PIN" @complete="completed = $event" />
</div>

```vue
<script setup lang="ts">
import { ref } from "vue";
import { OptInputs } from "@sharpdotnut/dotsharp";

const masked = ref("");
</script>

<template>
  <OptInputs v-model="masked" mask :length="4" label="PIN" />
</template>
```

## 禁用粘贴

`allow-paste` 默认为 `true`。设为 `false` 后，粘贴事件被阻止，只能逐格输入。

<div class="demo-row">
  <OptInputs v-model="noPaste" :allow-paste="false" :length="4" label="禁止粘贴" />
</div>

```vue
<script setup lang="ts">
import { ref } from "vue";
import { OptInputs } from "@sharpdotnut/dotsharp";

const noPaste = ref("");
</script>

<template>
  <OptInputs v-model="noPaste" :allow-paste="false" :length="4" label="禁止粘贴" />
</template>
```

## 键盘与焦点

- 输入后自动跳到下一格；退格删除当前格并前移，当前格为空时退回上一格。
- `←` / `→` / `Home` / `End` 在格子之间移动焦点；聚焦时自动全选当前格，直接输入即替换。
- 点击空格子时会跳到第一个空位，保证值始终连续，不会留下空洞。

## API

### 属性

| 属性       | 类型                            | 默认值      | 说明                                           |
| ---------- | ------------------------------- | ----------- | ---------------------------------------------- |
| v-model    | `string`                        | `""`        | 各格从左到右拼接的值；外部写入同样会过滤并截断 |
| length     | `number`                        | `6`         | 输入格数量                                     |
| accept     | `"numeric" \| "alpha" \| "any"` | `"numeric"` | 允许的字符集                                   |
| mask       | `boolean`                       | `false`     | 掩码显示，输入内容以圆点呈现                   |
| allowPaste | `boolean`                       | `true`      | 是否允许剪贴板粘贴；关闭后粘贴被阻止           |
| disabled   | `boolean`                       | `false`     | 禁用整组输入                                   |
| label      | `string`                        | —           | 分组标签，同时作为每一格的可访问名称           |

### 事件

| 事件                | 参数     | 说明                             |
| ------------------- | -------- | -------------------------------- |
| `update:modelValue` | `string` | 值变化                           |
| `complete`          | `string` | 所有格子填满时触发，参数为完整值 |

### 可访问性

- 根元素是 `role="group"`，`label` 通过 `aria-labelledby` 关联。
- 每一格都是原生 `<input>`，带 `aria-label`（如 `验证码, character 1 of 6`）；`accept="numeric"` 时带 `inputmode="numeric"`。
- 掩码使用原生 `type="password"`，读屏与浏览器行为与密码框一致。
