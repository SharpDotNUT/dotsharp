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

## API

### RadioGroup

| 属性          | 类型               | 默认值  | 说明                                   |
| ------------- | ------------------ | ------- | -------------------------------------- |
| v-model:value | `string \| number` | `0`     | 当前选中值，对应子项的 `value` 或索引  |
| name          | `string`           | 自动    | 原生 radio 的 `name`；省略时生成唯一值 |
| disabled      | `boolean`          | `false` | 禁用整组                               |

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
互斥、键盘与读屏语义。组没有内置标签：需要可读名称时给 `RadioGroup` 传 `aria-label` 或 `aria-labelledby`。
