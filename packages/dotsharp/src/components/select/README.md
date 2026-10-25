<script setup lang="ts">
import { ref } from "vue";
import { Option, Select } from "@sharpdotnut/dotsharp";
import explore from "@iconify-icons/material-symbols/explore";
import flight from "@iconify-icons/material-symbols/flight";
import luggage from "@iconify-icons/material-symbols/luggage";

const cabin = ref("economy");
const index = ref(0);
const cabinIcon = ref("business");
const empty = ref<string | number>("");
const disabledValue = ref("economy");
</script>

# Select 选择器

由 `Select` 与 `Option` 组合而成：`Select` 持有选中值（`v-model:value`），每个 `Option` 描述一个候选项。

- 收起时触发器显示选中项的 `label`，展开后从弹层里挑选。
- `label` 提供与 `Input` 一致的浮动标签：空值未聚焦时居中，聚焦、展开或有选中值时上浮到描边缺口。
- 触发器沿用 `Input` outlined 变体的几何：56px 高、4px 圆角、1px 描边、16px 正文，尾部 24px 箭头。
- 弹层按 Material 3 菜单绘制：`surface-container` 底色、elevation 2 阴影、4px 圆角、8px 上下内边距，选项行高 48px。
- `Option` 的标识默认为自身索引，也可以用 `value` 指定。
- 弹层渲染到 `body`，宽度跟随触发器，下方空间不足时向上展开，因此不会被父级的 `overflow: hidden` 裁掉。

## 子项约定

`Select` / `Option` 遵循[子项组件统一范式](/guide/patterns)：选中值由 `v-model:value` 持有，`Option` 用
`label`、`icon` 或默认插槽描述内容，标识取 `value` 或父组件注入的索引。下文只说明 `Select` 自己的弹层与交互。

## 基础用法

<div class="demo-row">
  <Select v-model:value="cabin" class="w-full max-w-xs">
    <Option label="经济舱" value="economy" />
    <Option label="超级经济舱" value="premium" />
    <Option label="商务舱" value="business" />
    <Option label="头等舱" value="first" />
  </Select>
</div>

当前选中值：{{ cabin }}

```vue
<script setup lang="ts">
import { ref } from "vue";
import { Option, Select } from "@sharpdotnut/dotsharp";

const cabin = ref("economy");
</script>

<template>
  <Select v-model:value="cabin" class="w-full max-w-xs">
    <Option label="经济舱" value="economy" />
    <Option label="超级经济舱" value="premium" />
    <Option label="商务舱" value="business" />
    <Option label="头等舱" value="first" />
  </Select>
</template>
```

`Select` 的根元素是行内块，宽度由外部决定；`class="w-full"` 之类的作用在根元素上，其余属性与事件透传给触发器按钮。

## 标签

`label` 渲染在触发器内部的浮动标签：空值且未聚焦时位于中间，聚焦、展开或有选中值时上浮到描边缺口，和
`Input` 的 `label` 行为一致。它同时是触发器的可访问名称。

<div class="demo-row">
  <Select v-model:value="cabin" label="舱位" class="w-full max-w-xs">
    <Option label="经济舱" value="economy" />
    <Option label="商务舱" value="business" />
  </Select>
  <Select v-model:value="empty" label="舱位" placeholder="请选择舱位" class="w-full max-w-xs">
    <Option label="经济舱" value="economy" />
    <Option label="商务舱" value="business" />
  </Select>
</div>

```vue
<script setup lang="ts">
import { ref } from "vue";
import { Option, Select } from "@sharpdotnut/dotsharp";

const cabin = ref("economy");
const empty = ref<string | number>("");
</script>

<template>
  <Select v-model:value="cabin" label="舱位">
    <Option label="经济舱" value="economy" />
    <Option label="商务舱" value="business" />
  </Select>
  <Select v-model:value="empty" label="舱位" placeholder="请选择舱位">
    <Option label="经济舱" value="economy" />
    <Option label="商务舱" value="business" />
  </Select>
</template>
```

传了 `label` 后，`placeholder` 只在标签上浮且没有选中值时出现（聚焦或展开空选择器），两者同时使用不会重叠。
省略 `label` 时没有浮动标签，`placeholder` 始终居中显示，与之前的用法一致。

简单表单里需要标签时，优先用这个 `label`，不必再包一层 `FormItem`；判断标准见
[表单指南 · 什么时候不用 FormItem](/guide/form#什么时候不用-formitem)。

## 标识：value 与索引

`Option` 省略 `value` 时用自己的数字索引（从 `0` 开始）作为标识，`v-model:value` 默认是 `0`，因此首个选项默认选中。

<div class="demo-row">
  <Select v-model:value="index" class="w-full max-w-xs">
    <Option label="按价格排序" />
    <Option label="按时长排序" />
    <Option label="按起飞时间排序" />
  </Select>
</div>

当前选中索引：{{ index }}

```vue
<Select v-model:value="index">
  <Option label="按价格排序" />
  <Option label="按时长排序" />
  <Option label="按起飞时间排序" />
</Select>
```

索引由 `Select` 按最终渲染顺序注入，规则见[统一范式](/guide/patterns#子项标识-value-或索引)。

## 内容：label、icon 与插槽

- `label`：选项文本，同时是收起态触发器显示的文字；
- `icon`：与 `Icon` 的 `icon` 同源，直接给图标数据，渲染在文字之前（尺寸 `1.5em`，即 24dp）；
- 默认插槽：选项行内的自定义内容，**优先于 `label`**。

<div class="demo-row">
  <Select v-model:value="cabinIcon" class="w-full max-w-xs">
    <Option label="经济舱" value="economy" :icon="flight" />
    <Option label="商务舱" value="business" :icon="luggage" />
    <Option label="探索套餐" value="explore" :icon="explore" />
  </Select>
</div>

```vue
<Select v-model:value="cabin">
  <Option label="经济舱" value="economy" :icon="flight" />
  <Option label="商务舱" value="business" :icon="luggage" />
</Select>
```

插槽只改变选项行的渲染，**不改变触发器显示的文字**：触发器只读 `label`。所以用了插槽时 `label` 仍然必须提供，
否则选中该项后触发器会退回 `placeholder`（或空）。

```vue
<Option label="往返" value="round" :icon="flight">
  <span class="font-medium">往返</span>
  <span class="ml-auto text-xs text-ds-muted">含 2 段航程</span>
</Option>
```

## 占位文字与禁用

`placeholder` 在没有可显示的选中项文本时出现（例如选中项没有 `label`，或选项列表为空）。没设置 `label`
时它始终显示；设置了 `label` 时只在标签上浮后出现，见[标签](#标签)。`disabled` 让触发器不可操作：

<div class="demo-row">
  <Select v-model:value="empty" placeholder="请选择舱位" class="w-full max-w-xs">
    <Option label="经济舱" value="economy" />
    <Option label="商务舱" value="business" />
  </Select>

  <Select v-model:value="disabledValue" disabled class="w-full max-w-xs">
    <Option label="经济舱" value="economy" />
    <Option label="商务舱" value="business" />
  </Select>
</div>

```vue
<Select v-model:value="empty" placeholder="请选择舱位">
  <Option label="经济舱" value="economy" />
  <Option label="商务舱" value="business" />
</Select>

<Select v-model:value="cabin" disabled>…</Select>
```

单个选项可以用 `disabled` 禁用：它仍然渲染，但不可点击、不参与键盘移动，`aria-disabled` 为 `true`。

```vue
<Select v-model:value="cabin">
  <Option label="经济舱" value="economy" />
  <Option label="商务舱（售罄）" value="business" disabled />
</Select>
```

## 弹层定位

- 弹层用 `Teleport` 渲染到 `body`，`position: fixed`，宽度等于触发器宽度。
- 下方剩余空间放不下且上方更宽裕时改为向上展开；最高 `320px`，超出时弹层内部滚动。
- 打开期间窗口滚动、缩放会重新定位；点击弹层与触发器之外的区域关闭。
- 触发器保持在焦点上，高亮项通过 `aria-activedescendant` 播报，选项本身不需要获得焦点。

## 键盘操作

| 按键              | 收起态 | 展开后                      |
| ----------------- | ------ | --------------------------- |
| `Enter` / `Space` | 展开   | 选中高亮项并关闭            |
| `↓` / `↑`         | 展开   | 移动到下一个 / 上一个可用项 |
| `Home` / `End`    | —      | 跳到第一个 / 最后一个可用项 |
| `Esc`             | —      | 关闭，不改写选中值          |
| `Tab`             | —      | 关闭并正常离开              |

## 表单校验

`validator` 接收当前选中值，返回 `false` 表示通过；返回 `true` 或错误文案表示不通过。默认在改变选择与失焦时各校验一次，用 `validateOn` 调整；控件还暴露 `validate()` / `clearValidate()`。完整约定见[表单指南](/guide/form)。

## API

### Select

| 属性          | 类型                                         | 默认值              | 说明                                          |
| ------------- | -------------------------------------------- | ------------------- | --------------------------------------------- |
| v-model:value | `string \| number`                           | `0`                 | 当前选中值，对应子项的 `value` 或索引         |
| label         | `string`                                     | —                   | 浮动标签；空值未聚焦时居中，其余时候上浮      |
| placeholder   | `string`                                     | `""`                | 没有可显示的选中项文本时显示的文字            |
| disabled      | `boolean`                                    | false               | 禁用触发器：不可展开、不可用键盘打开          |
| validator     | `(value) => boolean \| string`               | —                   | 验证函数：`false` 通过，`true` / 字符串不通过 |
| validateOn    | `"input" \| "blur" \| ("input" \| "blur")[]` | `["input", "blur"]` | 自动校验时机；传 `[]` 关闭自动校验            |

- 根元素是 `div`（`relative inline-flex flex-col`），`class` / `style` 落在这里，其余属性与事件透传给触发器按钮。
- 传 `label` 时通过 `<label for>` 关联触发器，标签即按钮的可访问名称；不传时回退到 `FormItem` 的标签。
- 触发器是 `role="combobox"` 的 `button`，带 `aria-haspopup="listbox"`、`aria-expanded`、`aria-controls`，
  展开时同步 `aria-activedescendant`。

### Option

| 属性     | 类型                    | 默认值       | 说明                                     |
| -------- | ----------------------- | ------------ | ---------------------------------------- |
| label    | `string`                | —            | 选项文本；同时用于收起态触发器显示       |
| icon     | `IconifyIcon \| string` | —            | 图标，渲染在文字/插槽之前，尺寸 `1.25em` |
| value    | `string \| number`      | 所在位置索引 | 子项标识                                 |
| disabled | `boolean`               | `false`      | 禁用：不可点击、不参与键盘移动           |

- 默认插槽：选项行内容，优先于 `label`；`label` 仍需提供，否则触发器无文字可显示。
- 根元素是 `role="option"` 的 `div`，带 `aria-selected`，选中项显示对勾并着色。
- 点击已选中的选项也会关闭弹层，但不会触发 `update:value`。
