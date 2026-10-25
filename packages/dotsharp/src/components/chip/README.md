<script setup lang="ts">
import { reactive, ref } from "vue";
import { Chip } from "@sharpdotnut/dotsharp";
import wifiIcon from "@iconify-icons/material-symbols/wifi";
import favoriteIcon from "@iconify-icons/material-symbols/favorite";

const filters = reactive([
  { label: "有 Wi-Fi", selected: true },
  { label: "可携带宠物", selected: false },
  { label: "含早餐", selected: false },
]);

const favoritesOnly = ref(false);
const enabled = ref(false);

function selectedCount(): number {
  return filters.filter((filter) => filter.selected).length;
}
</script>

# Chip 纸片

可切换的过滤纸片：`v-model:selected` 控制选中状态，点击整枚纸片即可切换。
未选中时是描边样式，选中后填充 `--ds-primary` 并在前面显示勾选图标。

## 基础用法

<div class="demo-row">
  <Chip v-for="filter in filters" :key="filter.label" v-model:selected="filter.selected" :label="filter.label" />
</div>

已选 {{ selectedCount() }} 项

```vue
<script setup lang="ts">
import { reactive } from "vue";
import { Chip } from "@sharpdotnut/dotsharp";

const filters = reactive([
  { label: "有 Wi-Fi", selected: true },
  { label: "可携带宠物", selected: false },
  { label: "含早餐", selected: false },
]);
</script>

<template>
  <Chip
    v-for="filter in filters"
    :key="filter.label"
    v-model:selected="filter.selected"
    :label="filter.label"
  />
</template>
```

## 前置图标

未选中时用 `icon` 给纸片加一个前置图标；选中后图标位置换成勾选图标。

<div class="demo-row">
  <Chip v-model:selected="favoritesOnly" label="收藏" :icon="favoriteIcon" />
  <Chip v-model:selected="enabled" label="Wi-Fi" :icon="wifiIcon" />
</div>

```vue
<script setup lang="ts">
import { ref } from "vue";
import { Chip } from "@sharpdotnut/dotsharp";
import favoriteIcon from "@iconify-icons/material-symbols/favorite";

const favoritesOnly = ref(false);
</script>

<template>
  <Chip v-model:selected="favoritesOnly" label="收藏" :icon="favoriteIcon" />
</template>
```

## 禁用

<div class="demo-row">
  <Chip label="已禁用" disabled />
  <Chip label="已选中" :selected="true" disabled />
</div>

```vue
<Chip label="已禁用" disabled />
<Chip label="已选中" :selected="true" disabled />
```

禁用的纸片保留 `aria-pressed`，但不可点击、不可聚焦。

## API

| 属性             | 类型                    | 默认值  | 说明                                 |
| ---------------- | ----------------------- | ------- | ------------------------------------ |
| v-model:selected | `boolean`               | `false` | 是否选中                             |
| label            | `string`                | —       | 纯文本内容；存在默认插槽时被插槽覆盖 |
| icon             | `IconifyIcon \| string` | —       | 未选中时的前置图标，尺寸 `1.25em`    |
| disabled         | `boolean`               | `false` | 禁用：不可点击、不可聚焦             |

- 根元素是 `button`，带 `aria-pressed`；其余属性与事件透传到该按钮。
- 点击会切换 `v-model:selected`，不做任何额外的选中策略（多选由使用方自行管理）。
- 默认插槽优先于 `label`，适合放徽标或混合内容。

### 可访问性

纸片是原生 `button`，用 `aria-pressed` 表达选中状态，读屏会读作“已按下 / 未按下”的切换按钮。
键盘用空格或回车切换，焦点样式走 `outline-ds-focus`。
