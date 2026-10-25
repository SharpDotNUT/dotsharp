<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import { Checkbox } from "@sharpdotnut/dotsharp";

const accepted = ref(true);
const subscribed = ref(false);

const channels = reactive([
  { label: "邮件", checked: true },
  { label: "短信", checked: false },
  { label: "推送", checked: false },
]);

const all = computed({
  get: () => channels.every((channel) => channel.checked),
  set: (value: boolean) => channels.forEach((channel) => (channel.checked = value)),
});

const mixed = computed(
  () => channels.some((channel) => channel.checked) && !channels.every((channel) => channel.checked),
);
</script>

# Checkbox 复选框

`v-model` 绑定布尔值，原生 `<input type="checkbox">` 保留在 DOM 中，只负责状态、键盘与表单语义，
视觉部分由组件绘制。

## 基础用法

<div class="demo-row">
  <Checkbox v-model="accepted" label="我接受服务条款" />
  <Checkbox v-model="subscribed" label="订阅更新" />
</div>

```vue
<script setup lang="ts">
import { ref } from "vue";
import { Checkbox } from "@sharpdotnut/dotsharp";

const accepted = ref(true);
const subscribed = ref(false);
</script>

<template>
  <Checkbox v-model="accepted" label="我接受服务条款" />
  <Checkbox v-model="subscribed" label="订阅更新" />
</template>
```

`label` 是纯文本；需要更自由的内容（链接、徽标）时改用默认插槽，插槽优先于 `label`。

## 不确定状态

`indeterminate` 显示横线，用于“部分选中”。它只影响显示：用户点击后原生 checkbox 会先变成未选中的
`false` 或选中的 `true`，由你决定何时清除 `indeterminate`。

<div class="demo-row">
  <Checkbox v-model="all" :indeterminate="mixed" label="全部通知" />
</div>

<div class="demo-row">
  <Checkbox v-for="channel in channels" :key="channel.label" v-model="channel.checked" :label="channel.label" />
</div>

```vue
<script setup lang="ts">
import { computed, reactive } from "vue";
import { Checkbox } from "@sharpdotnut/dotsharp";

const channels = reactive([
  { label: "邮件", checked: true },
  { label: "短信", checked: false },
  { label: "推送", checked: false },
]);

const all = computed({
  get: () => channels.every((channel) => channel.checked),
  set: (value: boolean) => channels.forEach((channel) => (channel.checked = value)),
});

const mixed = computed(
  () =>
    channels.some((channel) => channel.checked) && !channels.every((channel) => channel.checked),
);
</script>

<template>
  <Checkbox v-model="all" :indeterminate="mixed" label="全部通知" />
  <Checkbox
    v-for="channel in channels"
    :key="channel.label"
    v-model="channel.checked"
    :label="channel.label"
  />
</template>
```

## 禁用

<div class="demo-row">
  <Checkbox label="已禁用" disabled />
  <Checkbox label="已禁用且选中" :model-value="true" disabled />
</div>

```vue
<Checkbox label="已禁用" disabled />
<Checkbox label="已禁用且选中" :model-value="true" disabled />
```

## API

| 属性          | 类型      | 默认值  | 说明                               |
| ------------- | --------- | ------- | ---------------------------------- |
| v-model       | `boolean` | `false` | 是否选中                           |
| label         | `string`  | —       | 右侧文本；存在默认插槽时被插槽覆盖 |
| indeterminate | `boolean` | `false` | 不确定状态，显示横线               |
| disabled      | `boolean` | `false` | 禁用：不可点击、不可聚焦           |

- 根元素是 `label`，`class` / `style` 落在它上面；其余属性与事件透传给原生 `<input>`，
  因此 `name`、`value`、`aria-label`、`id` 等可以直接使用。
- 视觉盒子 18px，四周有 40px 的悬停状态层，点按目标因此比盒子更大。
- 默认插槽用作文本内容，优先于 `label`。

### 可访问性

原生 checkbox 自带键盘空格切换与表单语义；`indeterminate` 通过原生 `input.indeterminate` 设置，
读屏会读作“混合”。悬停 / 焦点状态层不改变点击区域与焦点顺序。
