<script setup lang="ts">
import { ref } from "vue";
import { ButtonGroup, ButtonGroupItem } from "@sharpdotnut/dotsharp";
import editIcon from "@iconify-icons/material-symbols/edit";
import shareIcon from "@iconify-icons/material-symbols/share";
import deleteIcon from "@iconify-icons/material-symbols/delete";
import filterIcon from "@iconify-icons/material-symbols/filter-list";

const clicked = ref("");
const sort = ref<string | undefined>("relevance");
const prices = ref<Array<string | number>>(["$$"]);
const connected = ref("list");
</script>

# ButtonGroup 按钮组

由 `ButtonGroup` 与 `ButtonGroupItem` 组合而成。同一组按钮共享层级与尺寸，但有两种用途：

- **纯按钮组**：省略 `selection`，子项只是排在一起的普通按钮（工具条、操作组）。
- **可选按钮组**：`selection="single"` 或 `"multiple"`，组持有选中值（`v-model:value`），
  选中的子项显示勾选图标，键盘与读屏通过 `aria-pressed` 得到切换按钮语义。

## 纯按钮组

<div class="demo-row">
  <ButtonGroup>
    <ButtonGroupItem label="编辑" :icon="editIcon" @click="clicked = '编辑'" />
    <ButtonGroupItem label="分享" :icon="shareIcon" @click="clicked = '分享'" />
    <ButtonGroupItem label="删除" :icon="deleteIcon" @click="clicked = '删除'" />
  </ButtonGroup>
</div>

最后点击：{{ clicked || "—" }}

```vue
<script setup lang="ts">
import { ref } from "vue";
import { ButtonGroup, ButtonGroupItem } from "@sharpdotnut/dotsharp";
import editIcon from "@iconify-icons/material-symbols/edit";
import shareIcon from "@iconify-icons/material-symbols/share";
import deleteIcon from "@iconify-icons/material-symbols/delete";

const clicked = ref("");
</script>

<template>
  <ButtonGroup>
    <ButtonGroupItem label="编辑" :icon="editIcon" @click="clicked = '编辑'" />
    <ButtonGroupItem label="分享" :icon="shareIcon" @click="clicked = '分享'" />
    <ButtonGroupItem label="删除" :icon="deleteIcon" @click="clicked = '删除'" />
  </ButtonGroup>
</template>
```

没有 `selection` 时不会写 `aria-pressed`，点击也不会改写 `v-model:value`；子项的点击事件按原生按钮冒泡。

## 单选

`selection="single"` 时同一时刻最多选中一项。与 `SegmentedButtons` 不同，**再次点击已选中的子项会取消选中**
（按钮组是筛选语义，不强制保留一项）。取消后模型值是 `undefined`。

<div class="demo-row">
  <ButtonGroup v-model:value="sort" selection="single">
    <ButtonGroupItem label="相关度" value="relevance" />
    <ButtonGroupItem label="距离" value="distance" />
  </ButtonGroup>
</div>

当前选中：{{ sort ?? "未选中" }}

```vue
<script setup lang="ts">
import { ref } from "vue";
import { ButtonGroup, ButtonGroupItem } from "@sharpdotnut/dotsharp";

const sort = ref<string | undefined>("relevance");
</script>

<template>
  <ButtonGroup v-model:value="sort" selection="single">
    <ButtonGroupItem label="相关度" value="relevance" />
    <ButtonGroupItem label="距离" value="distance" />
  </ButtonGroup>
</template>
```

## 多选

`selection="multiple"` 时模型是标识数组，点击子项切换它自己的选中态。

<div class="demo-row">
  <ButtonGroup v-model:value="prices" selection="multiple">
    <ButtonGroupItem label="$" value="$" />
    <ButtonGroupItem label="$$" value="$$" />
    <ButtonGroupItem label="$$$" value="$$$" />
    <ButtonGroupItem label="$$$$" value="$$$$" />
  </ButtonGroup>
</div>

当前选中：{{ prices.length ? prices.join("、") : "无" }}

```vue
<script setup lang="ts">
import { ref } from "vue";
import { ButtonGroup, ButtonGroupItem } from "@sharpdotnut/dotsharp";

const prices = ref<Array<string | number>>(["$$"]);
</script>

<template>
  <ButtonGroup v-model:value="prices" selection="multiple">
    <ButtonGroupItem label="$" value="$" />
    <ButtonGroupItem label="$$" value="$$" />
    <ButtonGroupItem label="$$$" value="$$$" />
    <ButtonGroupItem label="$$$$" value="$$$$" />
  </ButtonGroup>
</template>
```

## 形状

`shape="standard"`（默认）保持子项之间的空隙，未选中的子项是完整胶囊；`shape="connected"` 用 2px 间隙把子项连成一条，
未选中时只有两端保留大圆角，中间子项收成 4px 圆角。

<div class="demo-row">
  <ButtonGroup v-model:value="connected" selection="single" shape="connected">
    <ButtonGroupItem label="列表" value="list" :icon="filterIcon" />
    <ButtonGroupItem label="网格" value="grid" />
    <ButtonGroupItem label="时间线" value="timeline" />
  </ButtonGroup>
</div>

```vue
<script setup lang="ts">
import { ref } from "vue";
import { ButtonGroup, ButtonGroupItem } from "@sharpdotnut/dotsharp";
import filterIcon from "@iconify-icons/material-symbols/filter-list";

const connected = ref("list");
</script>

<template>
  <ButtonGroup v-model:value="connected" selection="single" shape="connected">
    <ButtonGroupItem label="列表" value="list" :icon="filterIcon" />
    <ButtonGroupItem label="网格" value="grid" />
    <ButtonGroupItem label="时间线" value="timeline" />
  </ButtonGroup>
</template>
```

选中态在两种形状下都改用同一个圆角令牌（`--ds-radius`，8px），比完整胶囊更小：

| 形状                | 未选中               | 选中                |
| ------------------- | -------------------- | ------------------- |
| `standard`          | 完整胶囊             | 四角收成 8px 圆角   |
| `connected`（首项） | 左端大圆角、右端 4px | 四角统一为 8px 圆角 |
| `connected`（中间） | 四角 4px             | 四角统一为 8px 圆角 |
| `connected`（末项） | 左端 4px、右端大圆角 | 四角统一为 8px 圆角 |

`connected` 的选中项不再跟随所在端点保留大圆角，因此不会出现「一端全圆、一端小圆」的不对称。

## 层级与尺寸

`ButtonGroup` 的 `variant` / `size` 是子项默认值，子项自己的同名属性优先。子项使用与 `Button` 完全相同的
层级类名与尺寸映射。

<div class="demo-row">
  <ButtonGroup variant="outlined" size="sm">
    <ButtonGroupItem label="小号" />
    <ButtonGroupItem label="描边" />
    <ButtonGroupItem label="禁用" disabled />
  </ButtonGroup>
</div>

```vue
<ButtonGroup variant="outlined" size="sm">
  <ButtonGroupItem label="小号" />
  <ButtonGroupItem label="描边" />
  <ButtonGroupItem label="禁用" disabled />
</ButtonGroup>
```

## 标识：value 与索引

省略 `value` 时，子项用声明顺序的索引（从 `0` 开始）作为标识；`selection` 存在时也可以用索引初始化模型。

```vue
<script setup lang="ts">
import { ref } from "vue";

const picked = ref(1);
</script>

<template>
  <ButtonGroup v-model:value="picked" selection="single">
    <ButtonGroupItem label="第一步" />
    <ButtonGroupItem label="第二步" />
    <ButtonGroupItem label="第三步" />
  </ButtonGroup>
</template>
```

## API

### ButtonGroup

| 属性          | 类型                                       | 默认值       | 说明                                              |
| ------------- | ------------------------------------------ | ------------ | ------------------------------------------------- |
| v-model:value | `string \| number \| (string \| number)[]` | —            | 单选传单个值，多选传数组；省略 `selection` 时忽略 |
| selection     | `"single" \| "multiple"`                   | —            | 选择模式；省略即纯按钮组                          |
| shape         | `"standard" \| "connected"`                | `"standard"` | 子项之间是留空隙还是连成一条                      |
| variant       | `ButtonVariant`                            | `"tonal"`    | 子项默认层级                                      |
| size          | `"sm" \| "md" \| "lg"`                     | `"md"`       | 子项默认尺寸                                      |

根元素是 `role="group"` 的 `div`，其余属性与事件透传到该元素。

### ButtonGroupItem

| 属性     | 类型                    | 默认值       | 说明                                   |
| -------- | ----------------------- | ------------ | -------------------------------------- |
| label    | `string`                | —            | 纯文本内容；存在默认插槽时被插槽覆盖   |
| icon     | `IconifyIcon \| string` | —            | 未选中时的前置图标；选中后换成勾选图标 |
| value    | `string \| number`      | 所在位置索引 | 子项标识                               |
| variant  | `ButtonVariant`         | 父组的值     | 覆盖父组层级                           |
| size     | `"sm" \| "md" \| "lg"`  | 父组的值     | 覆盖父组尺寸                           |
| disabled | `boolean`               | `false`      | 禁用：不可点击，也不改写模型           |

- 根元素是原生 `button`，其余属性与事件透传到该按钮。
- 选中态使用 `aria-pressed="true"`；纯按钮组不输出该属性。

### 可访问性

组根元素是 `role="group"`，可选模式下每个子项是带 `aria-pressed` 的原生 `button`，读屏会把整组理解为一组切换按钮。
键盘沿用浏览器原生 Tab 顺序（每个子项都能单独 Tab 到），不使用 roving tabindex——按钮组不是单一控件。
