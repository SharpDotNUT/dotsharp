<script setup lang="ts">
import { ref } from "vue";
import { Tab, Tabs } from "@sharpdotnut/dotsharp";
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
- `Tab` 的文字用 `label`，图标用 `icon`（直接传图标数据），其它自定义内容用默认插槽。
- 键盘遵循 ARIA tabs 模式：roving tabindex，方向键 / `Home` / `End` 在标签间移动焦点。

## 子项约定

`Tabs` / `Tab` 遵循[父子组件以及插槽统一范式](/guide/patterns)：选中值由 `v-model:value` 持有，`Tab` 用
`label`、`icon` 或默认插槽描述内容，标识取 `value` 或父组件注入的索引。下文只说明 `Tabs` 自己的排版与交互。

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
  <Tabs v-model:value="index" class="w-full max-w-md">
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
  <Tabs v-model:value="index">
    <Tab label="第一步" />
    <Tab label="第二步" />
    <Tab label="第三步" />
  </Tabs>
</template>
```

索引由 `Tabs` 按最终渲染顺序注入，规则见[父子组件以及插槽统一范式](/guide/patterns#子项标识-value-或索引)。

## 内容：label、icon 与插槽

三种写法可以组合：

- `label`：纯文本；
- `icon`：与 `Icon` 的 `icon` 同源，直接给图标数据，渲染在文字之前（尺寸 `1.25em`，跟随字号）；
- 默认插槽：其它自定义内容，**优先于 `label`**——插槽与 `label` 同时存在时 `label` 不参与渲染。

<div class="demo-row">
  <Tabs v-model:value="content" class="w-full max-w-md">
    <Tab label="航班" value="flights" :icon="flight" />
    <Tab label="行程" value="trips" :icon="luggage" />
    <Tab label="探索" value="explore" :icon="explore" />
  </Tabs>
</div>

当前选中值：{{ content }}

```vue
<script setup lang="ts">
import { ref } from "vue";
import { Tab, Tabs } from "@sharpdotnut/dotsharp";
import explore from "@iconify-icons/material-symbols/explore";
import flight from "@iconify-icons/material-symbols/flight";
import luggage from "@iconify-icons/material-symbols/luggage";

const content = ref("flights");
</script>

<template>
  <Tabs v-model:value="content">
    <Tab label="航班" value="flights" :icon="flight" />
    <Tab label="行程" value="trips" :icon="luggage" />
    <Tab label="探索" value="explore" :icon="explore" />
  </Tabs>
</template>
```

插槽适合徽标、角标等自由排版；图标仍由 `icon` 提供，插槽内容排在图标之后：

```vue
<Tab label="这行文字会被插槽覆盖" :icon="flight" value="custom">
  <span class="font-medium">插槽内容</span>
</Tab>
<Tab label="只用 label 时就是一行文字" value="label" />
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

## 键盘操作与禁用

按 ARIA tabs 模式实现 roving tabindex：整组只有一个标签是 `tabindex="0"`，其余为 `-1`。

- `←` / `→`：在标签之间移动焦点，首尾循环；RTL 方向自动对调。
- `Home` / `End`：跳到第一个 / 最后一个可用标签。
- 焦点移动默认**不**切换选中项，按回车 / 空格才激活。

`autoActivate` 打开后，焦点移动即切换选中项：

<div class="demo-row">
  <Tabs v-model:value="tab" auto-activate class="w-full max-w-md">
    <Tab label="概览" value="overview" />
    <Tab label="规格" value="specs" />
    <Tab label="评价" value="reviews" disabled />
  </Tabs>
</div>

```vue
<Tabs v-model:value="tab" auto-activate>
  <Tab label="概览" value="overview" />
  <Tab label="规格" value="specs" />
  <Tab label="评价" value="reviews" disabled />
</Tabs>
```

禁用的标签保留在渲染顺序里，但不可聚焦、不参与方向键移动，点击也不会改写选中值。

## API

### Tabs

| 属性          | 类型               | 默认值  | 说明                                                    |
| ------------- | ------------------ | ------- | ------------------------------------------------------- |
| v-model:value | `string \| number` | `0`     | 当前选中值，对应子项的 `value` 或索引                   |
| variant       | `boolean`          | `false` | 为 `true` 时使用单行排版与整条下划线标识                |
| autoActivate  | `boolean`          | `false` | 键盘移动焦点时是否立即切换选中项；默认需回车 / 空格激活 |

根元素是 `role="tablist"` 的 `div`，其余属性与事件透传到该元素。

### Tab

| 属性     | 类型                    | 默认值       | 说明                                              |
| -------- | ----------------------- | ------------ | ------------------------------------------------- |
| label    | `string`                | —            | 纯文本内容；存在默认插槽时被插槽覆盖              |
| icon     | `IconifyIcon \| string` | —            | 图标，渲染在文字/插槽之前，尺寸 `1.25em` 跟随字号 |
| value    | `string \| number`      | 所在位置索引 | 子项标识                                          |
| disabled | `boolean`               | `false`      | 禁用：不可聚焦、不参与方向键移动、点击不切换      |

- 默认插槽：标签内容，优先于 `label`；与 `icon` 同时使用时插槽内容排在图标之后。
- 需要不受 `1.25em` 限制的图标时，改用插槽放 `<Icon :icon="…" :size="…" />`。
- 根元素是 `role="tab"` 的 `button`，带 `aria-selected`，其余属性与事件透传到该按钮。
- 点击已选中的标签不会重复写模型，也不会触发 `update:value`。

### 可访问性

`Tabs` 输出 `role="tablist"`，`Tab` 输出 `role="tab"` 并同步 `aria-selected`；标签是原生 `button`，可聚焦、可用回车/空格激活，焦点样式走 `outline-ds-focus`。
键盘用 roving tabindex：只有当前焦点标签是 `tabindex="0"`，方向键在 `[role="tab"]:not([disabled])` 之间移动并循环，
`Home` / `End` 跳到两端，`Tab` 键仍按文档顺序离开整组。面板（`role="tabpanel"`）不在本组件内，由使用方自行组织。
