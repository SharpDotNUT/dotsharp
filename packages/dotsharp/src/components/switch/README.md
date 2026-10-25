<script setup lang="ts">
import { ref } from "vue";
import { Switch } from "@sharpdotnut/dotsharp";

const wifi = ref(true);
const airplane = ref(false);
</script>

# Switch 开关

`v-model` 绑定布尔值，原生 `<input type="checkbox" role="switch">` 保留在 DOM 中，只负责状态、键盘与表单语义。

## 基础用法

<div class="demo-row">
  <Switch v-model="wifi" label="Wi-Fi" />
  <Switch v-model="airplane" label="飞行模式" />
</div>

Wi-Fi：{{ wifi ? "开" : "关" }}

```vue
<script setup lang="ts">
import { ref } from "vue";
import { Switch } from "@sharpdotnut/dotsharp";

const wifi = ref(true);
</script>

<template>
  <Switch v-model="wifi" label="Wi-Fi" />
</template>
```

`label` 是纯文本；需要更自由的内容时改用默认插槽，插槽优先于 `label`。

## 禁用

<div class="demo-row">
  <Switch label="已禁用" disabled />
  <Switch label="已禁用且打开" :model-value="true" disabled />
</div>

```vue
<Switch label="已禁用" disabled />
<Switch label="已禁用且打开" :model-value="true" disabled />
```

## 尺寸与状态

轨道固定 52 × 32px，滑块在未选中时是 16px 的圆点、选中后放大为 24px 并显示勾选图标；
状态切换用 200ms 的 `transition-all`。

## 表单校验

`validator` 接收当前值，返回 `false` 表示通过；返回 `true` 或错误文案表示不通过。默认在切换与失焦时各校验一次，用 `validateOn` 调整；也暴露 `validate()` / `clearValidate()`。完整约定见[表单指南](/guide/form)。

## API

| 属性       | 类型                                         | 默认值              | 说明                                          |
| ---------- | -------------------------------------------- | ------------------- | --------------------------------------------- |
| v-model    | `boolean`                                    | `false`             | 是否打开                                      |
| label      | `string`                                     | —                   | 右侧文本；存在默认插槽时被插槽覆盖            |
| disabled   | `boolean`                                    | `false`             | 禁用：不可点击、不可聚焦                      |
| validator  | `(value) => boolean \| string`               | —                   | 验证函数：`false` 通过，`true` / 字符串不通过 |
| validateOn | `"input" \| "blur" \| ("input" \| "blur")[]` | `["input", "blur"]` | 自动校验时机；传 `[]` 关闭自动校验            |

- 根元素是 `div`（纵向排列，错误文案在下方），内部是原生 `label`；`class` / `style` 落在根元素上，其余属性与事件透传给原生 `<input>`，
  因此 `name`、`value`、`aria-label`、`id` 等可以直接使用。
- 默认插槽用作文本内容，优先于 `label`。

### 可访问性

原生 checkbox 带 `role="switch"`，读屏会读作开关，并按原生行为用空格切换。
焦点环画在轨道上，焦点顺序与点击区域都不受视觉滑块影响。
