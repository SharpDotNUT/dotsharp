<script setup lang="ts">
import { ref } from "vue";
import { Radio, RadioGroup } from "@sharpdotnut/dotsharp";

const size = ref("md");
const index = ref(0);
const plan = ref("free");
</script>

# Radio 单选按钮

由 `RadioGroup` 与 `Radio` 组合而成：`RadioGroup` 持有选中值（`v-model:value`），每个 `Radio` 描述一个选项。
同组选项共享一个原生 `name`，所以浏览器自己负责互斥与方向键切换。

- `Radio` 的标识默认为自身索引，也可以用 `value` 指定。
- `RadioGroup` 的 `v-model:value` 默认是 `0`，因此首个选项默认选中。
- 选项文本用 `label`，其它内容用默认插槽。

## 基础用法

<div class="demo-row">
  <RadioGroup v-model:value="size">
    <Radio value="sm" label="小" />
    <Radio value="md" label="中" />
    <Radio value="lg" label="大" />
  </RadioGroup>
</div>

当前选中值：{{ size }}

```vue
<script setup lang="ts">
import { ref } from "vue";
import { Radio, RadioGroup } from "@sharpdotnut/dotsharp";

const size = ref("md");
</script>

<template>
  <RadioGroup v-model:value="size">
    <Radio value="sm" label="小" />
    <Radio value="md" label="中" />
    <Radio value="lg" label="大" />
  </RadioGroup>
</template>
```

## 标识：value 与索引

省略 `value` 时，选项用声明顺序的索引（从 `0` 开始）作为标识。

<div class="demo-row">
  <RadioGroup v-model:value="index">
    <Radio label="免费" />
    <Radio label="专业" />
    <Radio label="团队" />
  </RadioGroup>
</div>

当前选中索引：{{ index }}

```vue
<script setup lang="ts">
import { ref } from "vue";
import { Radio, RadioGroup } from "@sharpdotnut/dotsharp";

const index = ref(0);
</script>

<template>
  <RadioGroup v-model:value="index">
    <Radio label="免费" />
    <Radio label="专业" />
    <Radio label="团队" />
  </RadioGroup>
</template>
```

## 禁用

`RadioGroup` 的 `disabled` 作用于整组；`Radio` 的 `disabled` 只禁用单个选项。

<div class="demo-row">
  <RadioGroup v-model:value="plan">
    <Radio value="free" label="免费" />
    <Radio value="team" label="团队（暂不可用）" disabled />
  </RadioGroup>
</div>

<div class="demo-row">
  <RadioGroup v-model:value="plan" disabled>
    <Radio value="free" label="免费" />
    <Radio value="pro" label="专业" />
  </RadioGroup>
</div>

```vue
<RadioGroup v-model:value="plan">
  <Radio value="free" label="免费" />
  <Radio value="team" label="团队（暂不可用）" disabled />
</RadioGroup>

<RadioGroup v-model:value="plan" disabled>
  <Radio value="free" label="免费" />
  <Radio value="pro" label="专业" />
</RadioGroup>
```

## 键盘操作

同组 radio 共享 `name`，浏览器原生行为即可用：

- `Tab` 进入组内当前选中项（没有选中项时进入第一个可用项）；
- `↑` / `↓` / `←` / `→` 在可用选项之间移动并立即选中。

组件不拦截这些按键，也没有自定义 roving tabindex。

## 表单校验

`RadioGroup` 接收 `validator`：参数是当前选中值，返回 `false` 表示通过；返回 `true` 或错误文案表示不通过。默认在改变选择与失焦时各校验一次，用 `validateOn` 调整；也暴露 `validate()` / `clearValidate()`。完整约定见[表单指南](/guide/form)。

## API

### RadioGroup

| 属性          | 类型                                         | 默认值              | 说明                                          |
| ------------- | -------------------------------------------- | ------------------- | --------------------------------------------- |
| v-model:value | `string \| number`                           | `0`                 | 当前选中值，对应子项的 `value` 或索引         |
| name          | `string`                                     | 自动                | 原生 radio 的 `name`；省略时生成唯一值        |
| disabled      | `boolean`                                    | `false`             | 禁用整组                                      |
| validator     | `(value) => boolean \| string`               | —                   | 验证函数：`false` 通过，`true` / 字符串不通过 |
| validateOn    | `"input" \| "blur" \| ("input" \| "blur")[]` | `["input", "blur"]` | 自动校验时机；传 `[]` 关闭自动校验            |

根元素是 `role="radiogroup"` 的 `div`，其余属性与事件透传到该元素。

### Radio

| 属性     | 类型               | 默认值       | 说明                 |
| -------- | ------------------ | ------------ | -------------------- |
| label    | `string`           | —            | 纯文本内容；插槽优先 |
| value    | `string \| number` | 所在位置索引 | 选项标识             |
| disabled | `boolean`          | `false`      | 禁用单个选项         |

- 根元素是 `label`，`class` / `style` 落在它上面；其余属性与事件透传给原生 `<input>`。
- 视觉圆圈 20px，四周有 40px 的悬停状态层。

### 可访问性

`RadioGroup` 输出 `role="radiogroup"`，组内是原生 `input[type="radio"]`，共享 `name` 后浏览器负责
互斥、键盘与读屏语义。组没有内置标签：放在 `FormItem` 里时用表单项的标签作为可访问名称，
单独使用时给 `RadioGroup` 传 `aria-label` 或 `aria-labelledby`。
