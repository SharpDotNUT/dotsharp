<script setup lang="ts">
import { ref } from "vue";
import { SplitButton, MenuItem } from "@sharpdotnut/dotsharp";
import editIcon from "@iconify-icons/material-symbols/edit";
import saveIcon from "@iconify-icons/material-symbols/save";

const action = ref("—");
const selected = ref("—");
const outlined = ref("—");
</script>

# SplitButton 分裂按钮

分裂按钮把「当前操作」和「同类操作的其它选择」放在同一个胶囊里：左半段是普通的按钮，右半段带下拉箭头，
点开一个 `Menu`。它由 `SplitButton`、`Menu` 与 `MenuItem` 组合，菜单项写在默认插槽里。

## 基础用法

<div class="demo-row">
  <SplitButton
    label="保存"
    :icon="saveIcon"
    menu-label="更多保存方式"
    @click="action = '保存'"
    @select="selected = String($event)"
  >
    <MenuItem label="另存为" value="另存为" />
    <MenuItem label="保存副本" value="保存副本" />
    <MenuItem label="导出为 PDF" value="导出为 PDF" />
  </SplitButton>
</div>

主操作：{{ action }}；菜单选择：{{ selected }}

```vue
<script setup lang="ts">
import { SplitButton, MenuItem } from "@sharpdotnut/dotsharp";
import saveIcon from "@iconify-icons/material-symbols/save";
</script>

<template>
  <SplitButton label="保存" :icon="saveIcon" menu-label="更多保存方式">
    <MenuItem label="另存为" value="另存为" />
    <MenuItem label="保存副本" value="保存副本" />
    <MenuItem label="导出为 PDF" value="导出为 PDF" />
  </SplitButton>
</template>
```

- `@click` 只来自左半段（右半段会阻止冒泡），`@select` 携带被点菜单项的 `value`。
- 两段共享容器：底色、文字色、边框与阴影都画在根元素上，中间那条分隔线用 `currentColor` 的 30% 透明度，
  所以明暗主题与所有层级都自动适配。

## 层级

`variant` 与 `Button` 完全一致：`elevated`、`filled`（默认）、`tonal`、`outlined`、`text`。

<div class="demo-row">
  <SplitButton label="编辑" :icon="editIcon" menu-label="更多编辑操作" variant="filled">
    <MenuItem label="重命名" value="重命名" />
  </SplitButton>
  <SplitButton
    label="编辑"
    :icon="editIcon"
    menu-label="更多编辑操作"
    variant="outlined"
    @select="outlined = String($event)"
  >
    <MenuItem label="重命名" value="重命名" />
    <MenuItem label="移动到…" value="移动到…" />
  </SplitButton>
  <SplitButton label="编辑" :icon="editIcon" menu-label="更多编辑操作" variant="text">
    <MenuItem label="重命名" value="重命名" />
  </SplitButton>
</div>

```vue
<script setup lang="ts">
import { ref } from "vue";
import { SplitButton, MenuItem } from "@sharpdotnut/dotsharp";
import editIcon from "@iconify-icons/material-symbols/edit";

const outlined = ref("—");
</script>

<template>
  <SplitButton label="编辑" :icon="editIcon" menu-label="更多编辑操作" variant="filled">
    <MenuItem label="重命名" value="重命名" />
  </SplitButton>
  <SplitButton
    label="编辑"
    :icon="editIcon"
    menu-label="更多编辑操作"
    variant="outlined"
    @select="outlined = String($event)"
  >
    <MenuItem label="重命名" value="重命名" />
    <MenuItem label="移动到…" value="移动到…" />
  </SplitButton>
  <SplitButton label="编辑" :icon="editIcon" menu-label="更多编辑操作" variant="text">
    <MenuItem label="重命名" value="重命名" />
  </SplitButton>
</template>
```

## 尺寸与禁用

`size` 与 `Button` 一致（`sm` / `md` / `lg`）。`disabled` 同时禁用两段；`menuDisabled` 只禁用尾部分段，
主操作仍然可用。

<div class="demo-row">
  <SplitButton label="保存" size="sm" menu-label="更多保存方式">
    <MenuItem label="另存为" value="另存为" />
  </SplitButton>
  <SplitButton label="保存" menu-label="更多保存方式" menu-disabled>
    <MenuItem label="另存为" value="另存为" />
  </SplitButton>
  <SplitButton label="保存" menu-label="更多保存方式" disabled>
    <MenuItem label="另存为" value="另存为" />
  </SplitButton>
</div>

```vue
<SplitButton label="保存" size="sm" menu-label="更多保存方式">
  <MenuItem label="另存为" value="另存为" />
</SplitButton>
<SplitButton label="保存" menu-label="更多保存方式" menu-disabled>
  <MenuItem label="另存为" value="另存为" />
</SplitButton>
<SplitButton label="保存" menu-label="更多保存方式" disabled>
  <MenuItem label="另存为" value="另存为" />
</SplitButton>
```

## 菜单方向

`placement` 默认 `bottom-end`：菜单的右边缘与按钮的右边缘对齐。其它取值与 `Menu` 相同
（`bottom-start`），菜单空间不足时会自动翻到上方。

```vue
<SplitButton label="保存" menu-label="更多保存方式" placement="bottom-start">
  <MenuItem label="另存为" value="另存为" />
</SplitButton>
```

## API

### SplitButton

| 属性         | 类型                                                        | 默认值         | 说明                       |
| ------------ | ----------------------------------------------------------- | -------------- | -------------------------- |
| label        | `string`                                                    | —              | 主按钮文本                 |
| icon         | `IconifyIcon \| string`                                     | —              | 主按钮前置图标             |
| menuLabel    | `string`                                                    | —              | 尾部分段的无障碍名称，必填 |
| variant      | `"elevated" \| "filled" \| "tonal" \| "outlined" \| "text"` | `"filled"`     | 视觉层级                   |
| size         | `"sm" \| "md" \| "lg"`                                      | `"md"`         | 高度 32 / 40 / 48px        |
| placement    | `"bottom-start" \| "bottom-end" \| "right-start"`           | `"bottom-end"` | 菜单相对尾部分段的展开方向 |
| disabled     | `boolean`                                                   | `false`        | 两段都禁用                 |
| menuDisabled | `boolean`                                                   | `false`        | 只禁用尾部分段             |
| type         | `"button" \| "submit" \| "reset"`                           | `"button"`     | 主按钮的原生类型           |

| 事件   | 载荷               | 说明                   |
| ------ | ------------------ | ---------------------- |
| select | `string \| number` | 菜单项被选中时的标识值 |

- 默认插槽：菜单内容，通常是若干 `MenuItem`。
- 根元素是 `div`，其余属性与事件透传到该元素；`class` 落在容器上。
- 尾部分段带 `aria-haspopup="menu"` 与 `aria-expanded`，`↓` 键可直接展开菜单；`Esc` 收起并把焦点交还尾部。

### 可访问性

两段都是原生 `button`，因此各自可 Tab 到达；焦点样式是内侧 2px 的 `outline-ds-focus`，不会被胶囊边界裁掉。
尾部按钮通过 `aria-label`（`menuLabel`）得到名称——它只有图标，没有可见文字。
