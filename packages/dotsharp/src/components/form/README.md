<script setup lang="ts">
import { ref } from "vue";
import {
  Button,
  Checkbox,
  Form,
  FormItem,
  Input,
  Option,
  Radio,
  RadioGroup,
  Select,
} from "@sharpdotnut/dotsharp";

const name = ref("");
const email = ref("");
const password = ref("");
const plan = ref("basic");
const channel = ref("");
const agree = ref(false);
const note = ref("");
const result = ref("尚未提交");

const basicRef = ref<{ validate: () => boolean } | null>(null);
const emailRef = ref<{ validate: () => boolean } | null>(null);
const manualResult = ref("");

const nameValidator = (value: string | number) =>
  String(value).trim().length >= 2 ? false : "用户名至少 2 个字符";
const emailValidator = (value: string | number) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value)) ? false : "邮箱格式不正确";
const planValidator = (value: string | number) => (value ? false : "请选择套餐");
const passwordValidator = (value: string | number) =>
  String(value).length >= 8 ? false : "密码至少 8 个字符";
const channelValidator = (value: string | number) => (value ? false : "请选择通知方式");
const agreeValidator = (value: boolean) => (value ? false : "请先阅读并同意条款");
const noteValidator = (value: string | number) =>
  String(value).length <= 20 ? false : "备注最多 20 个字符";

function onSubmit(valid: boolean): void {
  result.value = valid ? "校验通过，可以提交" : "还有字段没有通过校验";
}

function validateForm(): void {
  const valid = basicRef.value?.validate() ?? true;
  manualResult.value = valid ? "整张表单通过" : "整张表单未通过";
}

function validateEmail(): void {
  const valid = emailRef.value?.validate() ?? true;
  manualResult.value = valid ? "邮箱字段通过" : "邮箱字段未通过";
}

function clearAll(): void {
  basicRef.value?.clearValidate();
  manualResult.value = "";
}
</script>

# Form 表单

`Form` 把一组输入控件包成一张表，负责整体校验与提交；`FormItem` 提供字段标签、必填标记与说明文字。
字段自己的校验逻辑写在控件上：给 `Input`、`Select`、`Checkbox` 等组件传 `validator`。

- 验证函数返回 `false` 表示**通过**；返回 `true` 或字符串表示**不通过**（字符串就是错误文案）。
- 默认在失焦（`blur`）和用户改变值（`input`）时各校验一次，可以用 `validateOn` 改。
- 控件与 `Form` 都暴露 `validate()` / `clearValidate()`，可以手动触发。
- `Form` 监听原生提交：提交时校验全部字段，并把结果通过 `submit` 事件传出来。

## 基础用法

<div class="demo-row">
  <Form class="max-w-md" @submit="onSubmit">
    <FormItem label="用户名" required>
      <Input v-model="name" :validator="nameValidator" placeholder="至少 2 个字符" />
    </FormItem>
    <FormItem label="邮箱" required>
      <Input v-model="email" type="email" :validator="emailValidator" />
    </FormItem>
    <Button type="submit">提交</Button>
  </Form>
</div>

提交结果：{{ result }}

```vue
<script setup lang="ts">
import { ref } from "vue";
import { Button, Form, FormItem, Input } from "@sharpdotnut/dotsharp";

const name = ref("");
const email = ref("");
const result = ref("");

const nameValidator = (value: string | number) =>
  String(value).trim().length >= 2 ? false : "用户名至少 2 个字符";
const emailValidator = (value: string | number) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value)) ? false : "邮箱格式不正确";

function onSubmit(valid: boolean): void {
  result.value = valid ? "校验通过，可以提交" : "还有字段没有通过校验";
}
</script>

<template>
  <Form class="max-w-md" @submit="onSubmit">
    <FormItem label="用户名" required>
      <Input v-model="name" :validator="nameValidator" placeholder="至少 2 个字符" />
    </FormItem>
    <FormItem label="邮箱" required>
      <Input v-model="email" type="email" :validator="emailValidator" />
    </FormItem>
    <Button type="submit">提交</Button>
  </Form>
</template>
```

`Button type="submit"` 触发的是原生 `form` 提交。`Form` 会阻止页面刷新，先校验全部字段，再触发 `submit`
事件并带上整体结果。

## 完整示例

把常见字段放进同一张表单：文本框、密码、下拉、单选组、多行文本与复选框。提交时会一次性校验所有字段，
所有错误状态同时显示；`submit` 的 `valid` 表示整张表单是否通过。

<div class="demo-row">
  <Form class="max-w-md" @submit="onSubmit">
    <FormItem label="用户名" required>
      <Input v-model="name" :validator="nameValidator" placeholder="至少 2 个字符" />
    </FormItem>
    <FormItem label="邮箱" required>
      <Input v-model="email" type="email" :validator="emailValidator" placeholder="name@example.com" />
    </FormItem>
    <FormItem label="密码" required>
      <Input v-model="password" type="password" :validator="passwordValidator" placeholder="至少 8 个字符" />
    </FormItem>
    <FormItem label="套餐" required>
      <Select v-model:value="plan" :validator="planValidator" placeholder="请选择套餐">
        <Option label="基础版" value="basic" />
        <Option label="专业版" value="pro" />
        <Option label="团队版" value="team" />
      </Select>
    </FormItem>
    <FormItem label="通知方式" required>
      <RadioGroup v-model:value="channel" :validator="channelValidator">
        <Radio label="邮件" value="email" />
        <Radio label="短信" value="sms" />
        <Radio label="电话" value="phone" />
      </RadioGroup>
    </FormItem>
    <FormItem label="备注" description="最多 20 个字符">
      <Input v-model="note" textarea :rows="2" :validator="noteValidator" />
    </FormItem>
    <FormItem label="条款">
      <Checkbox v-model="agree" label="我已阅读并同意服务条款" :validator="agreeValidator" />
    </FormItem>
    <Button type="submit">提交</Button>
  </Form>
</div>

提交结果：{{ result }}

```vue
<script setup lang="ts">
import { ref } from "vue";
import {
  Button,
  Checkbox,
  Form,
  FormItem,
  Input,
  Option,
  Radio,
  RadioGroup,
  Select,
} from "@sharpdotnut/dotsharp";

const name = ref("");
const email = ref("");
const password = ref("");
const plan = ref("basic");
const channel = ref("");
const agree = ref(false);
const note = ref("");
const result = ref("");

const nameValidator = (value: string | number) =>
  String(value).trim().length >= 2 ? false : "用户名至少 2 个字符";
const emailValidator = (value: string | number) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value)) ? false : "邮箱格式不正确";
const passwordValidator = (value: string | number) =>
  String(value).length >= 8 ? false : "密码至少 8 个字符";
const planValidator = (value: string | number) => (value ? false : "请选择套餐");
const channelValidator = (value: string | number) => (value ? false : "请选择通知方式");
const noteValidator = (value: string | number) =>
  String(value).length <= 20 ? false : "备注最多 20 个字符";
const agreeValidator = (value: boolean) => (value ? false : "请先阅读并同意条款");

function onSubmit(valid: boolean): void {
  result.value = valid ? "校验通过，可以提交" : "还有字段没有通过校验";
}
</script>

<template>
  <Form @submit="onSubmit">
    <FormItem label="用户名" required>
      <Input v-model="name" :validator="nameValidator" placeholder="至少 2 个字符" />
    </FormItem>
    <FormItem label="邮箱" required>
      <Input v-model="email" type="email" :validator="emailValidator" />
    </FormItem>
    <FormItem label="密码" required>
      <Input v-model="password" type="password" :validator="passwordValidator" />
    </FormItem>
    <FormItem label="套餐" required>
      <Select v-model:value="plan" :validator="planValidator">
        <Option label="基础版" value="basic" />
        <Option label="专业版" value="pro" />
        <Option label="团队版" value="team" />
      </Select>
    </FormItem>
    <FormItem label="通知方式" required>
      <RadioGroup v-model:value="channel" :validator="channelValidator">
        <Radio label="邮件" value="email" />
        <Radio label="短信" value="sms" />
        <Radio label="电话" value="phone" />
      </RadioGroup>
    </FormItem>
    <FormItem label="备注" description="最多 20 个字符">
      <Input v-model="note" textarea :rows="2" :validator="noteValidator" />
    </FormItem>
    <FormItem label="条款">
      <Checkbox v-model="agree" label="我已阅读并同意服务条款" :validator="agreeValidator" />
    </FormItem>
    <Button type="submit">提交</Button>
  </Form>
</template>
```

## 验证函数

所有支持校验的控件都接收同一个 `validator`：参数是当前值，返回值只有三种含义。

| 返回值   | 含义                     | 外观                                        |
| -------- | ------------------------ | ------------------------------------------- |
| `false`  | 通过                     | 不改变样式（本库没有“正确”样式）            |
| `true`   | 不通过，但没有文案       | 显示错误状态，例如红色描边 / `aria-invalid` |
| `string` | 不通过，字符串是错误提示 | 显示错误状态与这段文字                      |

注意：`false` 才是通过，`true` 是不通过，与一些常见库相反。

```ts
const username = (value: string | number) => (String(value).trim() ? false : "请输入用户名");

const age = (value: string | number) => (Number(value) >= 18 ? false : true); // 不通过，不显示文案
```

`validator` 是同步函数；抛出的异常按不通过处理，异常信息会作为错误文案。

## 触发时机

默认 `validateOn` 是 `["input", "blur"]`：输入时校验一次、失焦时再校验一次。可以只留一个时机：

```vue
<Input v-model="email" :validator="emailValidator" validate-on="blur" />
```

也可以完全关闭自动校验，只响应手动 `validate()` / 表单提交：

```vue
<Input v-model="email" :validator="emailValidator" :validate-on="[]" />
```

| 值      | 说明                                   |
| ------- | -------------------------------------- |
| `input` | 用户改变值时（输入、选择、拖动、切换） |
| `blur`  | 控件失焦时                             |

## 手动校验

控件和 `Form` 都暴露 `validate()`：立即校验并返回是否通过，错误状态照常显示。`clearValidate()` 只清空
状态，不修改值。

<div class="demo-row">
  <Form ref="basicRef" class="max-w-md">
    <FormItem label="昵称">
      <Input v-model="name" :validator="nameValidator" :validate-on="[]" />
    </FormItem>
    <FormItem label="邮箱">
      <Input ref="emailRef" v-model="email" :validator="emailValidator" :validate-on="[]" />
    </FormItem>
  </Form>
  <div class="flex flex-col gap-2">
    <Button variant="outlined" @click="validateForm">校验整张表单</Button>
    <Button variant="outlined" @click="validateEmail">只校验邮箱</Button>
    <Button variant="text" @click="clearAll">清空校验结果</Button>
  </div>
</div>

{{ manualResult }}

```vue
<script setup lang="ts">
import { ref } from "vue";
import { Button, Form, FormItem, Input } from "@sharpdotnut/dotsharp";

const formRef = ref<{ validate: () => boolean } | null>(null);
const emailRef = ref<{ validate: () => boolean } | null>(null);

function validateForm(): void {
  formRef.value?.validate();
}

function validateEmail(): void {
  emailRef.value?.validate();
}
</script>

<template>
  <Form ref="formRef">
    <FormItem label="昵称">
      <Input v-model="name" :validator="nameValidator" :validate-on="[]" />
    </FormItem>
    <FormItem label="邮箱">
      <Input ref="emailRef" v-model="email" :validator="emailValidator" :validate-on="[]" />
    </FormItem>
  </Form>
</template>
```

`Form.validate()` 会依次调用所有已接入验证函数的字段，即使中途有字段不通过也会继续，保证每个字段的
错误状态都被更新；返回 `true` 表示全部通过。

## 其它控件

`Select`、`Checkbox`、`Switch`、`RadioGroup`、`Slider`、`RangeSlider`、`OptInputs`、`DateInput`、
`TimeInput` 与 `Input` 使用同一套 `validator` / `validateOn`。

<div class="demo-row">
  <Form class="max-w-md" @submit="onSubmit">
    <FormItem label="套餐" required>
      <Select v-model:value="plan" :validator="planValidator" placeholder="请选择">
        <Option label="基础版" value="basic" />
        <Option label="专业版" value="pro" />
        <Option label="团队版" value="team" />
      </Select>
    </FormItem>
    <FormItem label="备注">
      <Input v-model="note" textarea :rows="2" :validator="noteValidator" />
    </FormItem>
    <FormItem label="条款">
      <Checkbox v-model="agree" label="我已阅读并同意服务条款" :validator="agreeValidator" />
    </FormItem>
    <Button type="submit">提交</Button>
  </Form>
</div>

```vue
<script setup lang="ts">
import { ref } from "vue";
import { Button, Checkbox, Form, FormItem, Input, Option, Select } from "@sharpdotnut/dotsharp";

const plan = ref("basic");
const note = ref("");
const agree = ref(false);

const planValidator = (value: string | number) => (value ? false : "请选择套餐");
const agreeValidator = (value: boolean) => (value ? false : "请先阅读并同意条款");
const noteValidator = (value: string | number) =>
  String(value).length <= 20 ? false : "备注最多 20 个字符";
</script>

<template>
  <Form @submit="onSubmit">
    <FormItem label="套餐" required>
      <Select v-model:value="plan" :validator="planValidator">
        <Option label="基础版" value="basic" />
        <Option label="专业版" value="pro" />
      </Select>
    </FormItem>
    <FormItem label="备注">
      <Input v-model="note" textarea :validator="noteValidator" />
    </FormItem>
    <FormItem label="条款">
      <Checkbox v-model="agree" label="我已阅读并同意服务条款" :validator="agreeValidator" />
    </FormItem>
    <Button type="submit">提交</Button>
  </Form>
</template>
```

单选组用 `RadioGroup`：

```vue
<FormItem label="通知方式" required>
  <RadioGroup v-model:value="channel" :validator="(value) => (value ? false : '请选择通知方式')">
    <Radio label="邮件" value="email" />
    <Radio label="短信" value="sms" />
  </RadioGroup>
</FormItem>
```

## 设计规则

- `FormItem` 的 `label`、`required`、`description` 只负责排版与提示；是否必填由验证函数决定，`required`
  只是视觉标记（并补充 `aria-required`）。
- 控件自己的 `label` 与 `FormItem` 的 `label` 二选一：`FormItem` 的标签在没有控件标签时会作为控件的
  可访问名称（通过 `aria-labelledby`）。
- 控件只有“常规”和“不通过”两种状态，全部由 `validator` 驱动，没有单独的 success / error 状态属性。
  验证函数返回 `true` 时只有错误状态、没有文字；想要提示文案就返回字符串。
- 简单表单、只有 `Input` / `Select` 这类自带 `label` 的控件、也不需要必填标记与说明文字时，直接用控件自己的
  `label`，不必再包 `FormItem`；判断标准见[表单指南 · 什么时候不用 FormItem](/guide/form#什么时候不用-formitem)。

## API

### Form

| 插槽    | 说明                 |
| ------- | -------------------- |
| default | 表单内容（字段组合） |

`Form` 的根元素是 `<form novalidate>`，默认 `flex flex-col gap-4`；`class` / `style` 与其余属性都落在它上面。

#### 暴露

| 方法            | 签名            | 说明                             |
| --------------- | --------------- | -------------------------------- |
| `validate`      | `() => boolean` | 校验全部字段，返回整体是否通过   |
| `clearValidate` | `() => void`    | 清空全部字段的校验结果，不修改值 |

### FormItem

| 属性        | 类型      | 默认值  | 说明                                 |
| ----------- | --------- | ------- | ------------------------------------ |
| label       | `string`  | —       | 字段标签                             |
| required    | `boolean` | `false` | 在标签末尾显示必填标记（仅视觉提示） |
| description | `string`  | —       | 字段下方的辅助说明                   |

### 事件

| 事件     | 说明                                                    |
| -------- | ------------------------------------------------------- |
| `submit` | 原生提交被拦截后触发，参数 `valid` 表示全部字段是否通过 |

### 可访问性

- `Form` 渲染 `<form novalidate>`，不会触发浏览器的原生气泡校验。
- `FormItem` 的 `label` 通过 `aria-labelledby` 关联到内部控件（控件没有自己的标签时）。
- 校验不通过时控件带 `aria-invalid`，错误文案通过 `aria-describedby` 关联。
- `FormItem.required` 会同时输出 `aria-required`。
