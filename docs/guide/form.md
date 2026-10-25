<script setup lang="ts">
import { ref } from "vue";
import { Button, Form, FormItem, Input } from "@sharpdotnut/dotsharp";

const email = ref("");
const message = ref("");

const emailValidator = (value: string | number) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value)) ? false : "邮箱格式不正确";

const formRef = ref<{ validate: () => boolean } | null>(null);

function validateForm(): void {
  const valid = formRef.value?.validate() ?? true;
  message.value = valid ? "全部字段通过" : "仍有字段未通过";
}

function clearForm(): void {
  formRef.value?.clearValidate();
  message.value = "";
}
</script>

# 表单

表单由两层组成：

- `Form` 包住整张表，负责提交与整体校验；
- `FormItem` 包住一个字段，负责标签、必填标记与说明文字。

字段本身的校验由控件负责：给 `Input`、`Select`、`Checkbox` 等组件传 `validator`，它们就会显示自己的
错误状态与错误文案。这样控件在单独使用时也能校验，不必依赖 `Form`。

```vue
<script setup lang="ts">
import { ref } from "vue";
import { Button, Form, FormItem, Input } from "@sharpdotnut/dotsharp";

const email = ref("");
const emailValidator = (value: string | number) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value)) ? false : "邮箱格式不正确";
</script>

<template>
  <Form @submit="(valid) => console.log(valid)">
    <FormItem label="邮箱" required>
      <Input v-model="email" type="email" :validator="emailValidator" />
    </FormItem>
    <Button type="submit">提交</Button>
  </Form>
</template>
```

## 验证函数

所有支持校验的控件接收同一个 `validator`：参数是当前值，返回值有三种含义。

| 返回值   | 含义                     | 外观                                       |
| -------- | ------------------------ | ------------------------------------------ |
| `false`  | 通过                     | 样式不变（本库没有“正确 / 成功”样式）      |
| `true`   | 不通过，但不带文案       | 显示错误状态，例如红色描边、`aria-invalid` |
| `string` | 不通过，字符串是错误提示 | 显示错误状态与这段文字                     |

**注意：`false` 才是通过，`true` 是不通过。** 这与一些常见组件库相反，写验证函数时请以此为准。

```ts
// 通过：返回 false
const required = (value: string | number) => (String(value).trim() ? false : "请填写");

// 不通过、不带文案：返回 true
const adult = (value: string | number) => (Number(value) >= 18 ? false : true);

// 不通过、带文案：返回字符串
const email = (value: string | number) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value)) ? false : "邮箱格式不正确";
```

验证函数是同步的。它抛出的异常按不通过处理，异常信息会当作错误文案，避免错误被静默吞掉。

## 触发时机

默认在两种时机校验：

- `input`：用户改变值时（输入、选择、拖动、开关切换）；
- `blur`：控件失焦时。

用 `validateOn` 收窄，传单个值或数组：

```vue
<!-- 只在失焦时自动校验 -->
<Input v-model="email" :validator="emailValidator" validate-on="blur" />
```

传空数组可以关闭全部自动校验，改为只由手动调用或表单提交触发：

```vue
<Input v-model="email" :validator="emailValidator" :validate-on="[]" />
```

## 手动校验

控件与 `Form` 都暴露两个方法：

| 方法            | 签名            | 说明                   |
| --------------- | --------------- | ---------------------- |
| `validate`      | `() => boolean` | 立即校验，返回是否通过 |
| `clearValidate` | `() => void`    | 清空校验结果，不修改值 |

<div class="demo-row">
  <Form ref="formRef" class="max-w-md">
    <FormItem label="邮箱">
      <Input v-model="email" type="email" :validator="emailValidator" :validate-on="[]" />
    </FormItem>
  </Form>
  <div class="flex flex-col gap-2">
    <Button variant="outlined" @click="validateForm">校验整张表单</Button>
    <Button variant="text" @click="clearForm">清空校验结果</Button>
  </div>
</div>

{{ message }}

```vue
<script setup lang="ts">
import { ref } from "vue";
import { Button, Form, FormItem, Input } from "@sharpdotnut/dotsharp";

const formRef = ref<{ validate: () => boolean } | null>(null);

function validateForm(): void {
  formRef.value?.validate(); // true = 全部通过
}

function clearForm(): void {
  formRef.value?.clearValidate();
}
</script>

<template>
  <Form ref="formRef">
    <FormItem label="邮箱">
      <Input v-model="email" type="email" :validator="emailValidator" :validate-on="[]" />
    </FormItem>
    <Button @click="validateForm">校验</Button>
  </Form>
</template>
```

`Form.validate()` 会跑完所有字段再返回，保证每个字段的错误状态都被更新。单个控件也可以单独调用：

```ts
const inputRef = ref<{ validate: () => boolean } | null>(null);
inputRef.value?.validate();
```

## 提交

`Form` 监听原生提交事件并阻止页面刷新：先校验全部字段，再触发 `submit`，参数 `valid` 表示整体结果。

```vue
<Form @submit="(valid) => (valid ? save() : null)">
  ...
  <Button type="submit">提交</Button>
</Form>
```

即使字段设置了 `:validate-on="[]"`，提交时也会校验；`submit` 只负责把结果交给你，不会自动拦截业务逻辑。

## FormItem

`FormItem` 负责字段排版：

- `label`：字段标签；
- `required`：标签末尾的必填标记，仅视觉提示（同时在支持的控件上输出 `aria-required`）；
- `description`：字段下方的说明文字。

是否必填、校验规则都由控件的 `validator` 决定，`required` 不参与校验。控件没有自己的 `label` 时，
`FormItem` 的标签会通过 `aria-labelledby` 成为控件的可访问名称。

```vue
<FormItem label="用户名" required description="2–20 个字符">
  <Input v-model="name" :validator="nameValidator" />
</FormItem>
```

## 什么时候不用 FormItem

`FormItem` 不是必需的。如果表单很简单、只有自带 `label` 的控件（`Input`、`Select`），并且不需要必填标记和
字段说明，直接用控件自己的 `label` 更好：

```vue
<Form @submit="onSubmit">
  <Input v-model="email" label="邮箱" :validator="emailValidator" />
  <Select v-model:value="plan" label="套餐" :validator="planValidator">
    <Option label="基础版" value="basic" />
    <Option label="专业版" value="pro" />
  </Select>
  <Button type="submit">提交</Button>
</Form>
```

控件自己的标签会与控件关联成可访问名称，`validator`、`Form` 的整体校验、`validate()` / `clearValidate()`
都不受影响，只是少了一层包裹。

需要下面这些能力时再用 `FormItem`：

- 标签末尾的必填标记（`required`）；
- 字段下方的说明文字（`description`）；
- 控件本身没有 `label`（`Checkbox`、`RadioGroup`、`Slider` 等）：这时 `FormItem` 的标签既负责排版，也作为
  控件的可访问名称。

同一个字段不要同时给 `FormItem` 和控件写标签，会渲染出两份。

## 支持的控件

以下控件都使用同一套 `validator` / `validateOn` / `validate()` / `clearValidate()`：

| 控件                       | 验证函数收到的值    |
| -------------------------- | ------------------- |
| `Input`（含多行 textarea） | `string \| number`  |
| `Select`                   | `string \| number`  |
| `Checkbox` / `Switch`      | `boolean`           |
| `RadioGroup`               | `string \| number`  |
| `Slider`                   | `number`            |
| `RangeSlider`              | `[number, number]`  |
| `OptInputs`                | `string`            |
| `DateInput`                | `Date \| null`      |
| `TimeInput`                | `TimeValue \| null` |

错误文案由控件自己渲染在字段下方，`FormItem` 不会重复显示。控件只有“常规”和“不通过”两种状态，
全部由验证函数驱动，没有独立的 success / error 属性；不通过时文案优先使用验证函数返回的字符串。

完整字段组合见 [Form 表单 · 完整示例](/components/form#完整示例)。

完整属性与示例见 [Form 表单](/components/form)。
