<script setup lang="ts">
import { ref } from "vue";
import { Icon, Tab, Tabs } from "@sharpdotnut/dotsharp";
import explore from "@iconify-icons/material-symbols/explore";
import flight from "@iconify-icons/material-symbols/flight";
import luggage from "@iconify-icons/material-symbols/luggage";

const tab = ref("overview");
const index = ref(0);
const content = ref("flights");
const variantTab = ref("overview");
</script>

# Tabs 标签页

由 `Tabs` 与 `Tab` 组合而成：`Tabs` 持有选中值（`v-model:value`），每个 `Tab` 描述一个标签项。

- 所有 `Tab` 平分 `Tabs` 的宽度，与文字长短无关。
- `Tab` 的标识默认为自身索引，也可以用 `value` 指定。
- `Tab` 的文字用 `label`，需要图标等自定义内容时改用默认插槽。

## 基础用法

<div class="demo-row">
  <Tabs v-model:value="tab" class="w-full max-w-md">
    <Tab label="概览" value="overview" />
    <Tab label="规格" value="specs" />
  </Tabs>
</div>

当前选中值：{{ tab }}

```vue
<script setup lang="ts">
import { ref } from "vue";
import { Tab, Tabs } from "@sharpdotnut/dotsharp";

const tab = ref("overview");
</script>

<template>
  <Tabs v-model:value="tab">
    <Tab label="概览" value="overview" />
    <Tab label="规格" value="specs" />
  </Tabs>
</template>
```

## 标识：value 与索引

`Tab` 省略 `value` 时用自己的数字索引（从 `0` 开始）作为标识。`Tabs` 的 `v-model:value` 默认是 `0`，所以首个标签默认选中。

<div class="demo-row">
  <Tabs v-model:value="index" variant class="w-full max-w-md">
    <Tab label="第一步" />
    <Tab label="第二步" />
    <Tab label="第三步" />
  </Tabs>
</div>

当前选中索引：{{ index }}

```vue
<script setup lang="ts">
import { ref } from "vue";
import { Tab, Tabs } from "@sharpdotnut/dotsharp";

const index = ref(0);
</script>

<template>
  <Tabs v-model:value="index" variant>
    <Tab label="第一步" />
    <Tab label="第二步" />
    <Tab label="第三步" />
  </Tabs>
</template>
```

索引由 `Tabs` 按声明顺序注入，只统计 `Tab` 子项本身；`v-if` 增删、`v-for` 循环都按最终渲染顺序重新编号。需要跨版本稳定的标识时显式传 `value`。

## 内容：label 与插槽

`label` 写纯文本；需要图标、徽标等自定义内容时用默认插槽。**插槽优先于 `label`**，两者同时存在时 `label` 不参与渲染。

<div class="demo-row">
  <Tabs v-model:value="content" class="w-full max-w-md">
    <Tab value="flights">
      <Icon :icon="flight" :size="20" />
      <span>航班</span>
    </Tab>
    <Tab value="trips">
      <Icon :icon="luggage" :size="20" />
      <span>行程</span>
    </Tab>
    <Tab value="explore">
      <Icon :icon="explore" :size="20" />
      <span>探索</span>
    </Tab>
  </Tabs>
</div>

当前选中值：{{ content }}

```vue
<script setup lang="ts">
import { Icon } from "@sharpdotnut/dotsharp";
import explore from "@iconify-icons/material-symbols/explore";
import flight from "@iconify-icons/material-symbols/flight";
import luggage from "@iconify-icons/material-symbols/luggage";
</script>

<template>
  <Tabs v-model:value="content">
    <Tab value="flights">
      <Icon :icon="flight" :size="20" />
      <span>航班</span>
    </Tab>
    <Tab value="trips">
      <Icon :icon="luggage" :size="20" />
      <span>行程</span>
    </Tab>
    <Tab value="explore">
      <Icon :icon="explore" :size="20" />
      <span>探索</span>
    </Tab>
  </Tabs>
</template>
```

只写 `label` 时内容为单行文字；插槽内容与标签文字一起放入插槽即可，布局（纵向或单行）由 `Tabs` 决定：

```vue
<Tab label="这行文字会被插槽覆盖" value="custom">
  <span class="font-medium">插槽内容</span>
</Tab>
<Tab label="没有插槽时用 label" value="label" />
```

## 变体样式

`variant` 为 `true` 时切换为单行排版，标识也从居中的短胶囊换成整条贴合 `Tab` 宽度的下划线，适合纯文字的分段标签。

<div class="demo-row">
  <Tabs v-model:value="variantTab" variant class="w-full max-w-md">
    <Tab label="概览" value="overview" />
    <Tab label="规格" value="specs" />
  </Tabs>
</div>

```vue
<Tabs v-model:value="variantTab" variant>
  <Tab label="概览" value="overview" />
  <Tab label="规格" value="specs" />
</Tabs>
```

## 指示条与切换动画

标识是一条由 `Tabs` 统一渲染的指示条，随选中项移动：

- 默认：居中的短胶囊，宽度有上限且始终窄于 `Tab`，下半部分被列表下边框裁掉，只剩圆头横条。
- `variant`：贴合 `Tab` 宽度的整条下划线。

切换时指示条水平平移、宽度一并补间（200ms，纯 CSS `transition`），不会瞬间跳变；首次渲染不播放动画，也不会在挂载时滑入。

## 统一范式

`Tabs` / `Tab` 确立了本库「子项组件」的统一写法，后续同类组件（`Select` / `Option`、`Steps` / `Step` 等）沿用同一套约定：

- 父组件用 `defineModel` 暴露选中值，消费方写 `v-model:value`；未绑定模型时首个子项默认选中。
- 子组件用 `label` 承载纯文本，用默认插槽承载自定义内容；**插槽优先，`label` 兜底**。
- 子组件用 **`value`** 声明标识；省略时按声明顺序取 **数字索引**（`0` 起），索引由父组件注入，使用方无需关心。
- 选中值类型为 `string | number`。需要稳定的跨版本标识时显式传 `value`，纯展示顺序的场合用索引即可。

## API

### Tabs

| 属性          | 类型               | 默认值  | 说明                                     |
| ------------- | ------------------ | ------- | ---------------------------------------- |
| v-model:value | `string \| number` | `0`     | 当前选中值，对应子项的 `value` 或索引    |
| variant       | `boolean`          | `false` | 为 `true` 时使用单行排版与整条下划线标识 |

根元素是 `role="tablist"` 的 `div`，其余属性与事件透传到该元素。

### Tab

| 属性  | 类型               | 默认值       | 说明                                 |
| ----- | ------------------ | ------------ | ------------------------------------ |
| label | `string`           | —            | 纯文本内容；存在默认插槽时被插槽覆盖 |
| value | `string \| number` | 所在位置索引 | 子项标识                             |

- 默认插槽：标签内容，优先于 `label`。
- 根元素是 `role="tab"` 的 `button`，带 `aria-selected`，其余属性与事件透传到该按钮。
- 点击已选中的标签不会重复写模型，也不会触发 `update:value`。

### 可访问性

`Tabs` 输出 `role="tablist"`，`Tab` 输出 `role="tab"` 并同步 `aria-selected`；标签是原生 `button`，可聚焦、可用回车/空格激活，焦点样式走 `outline-ds-focus`。面板（`role="tabpanel"`）不在本组件内，由使用方自行组织。
