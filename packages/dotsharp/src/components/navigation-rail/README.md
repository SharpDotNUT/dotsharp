<script setup lang="ts">
import { ref } from "vue";
import {
  Button,
  NavigationRail,
  NavigationRailItem,
} from "@sharpdotnut/dotsharp";
import alarm from "@iconify-icons/material-symbols/alarm";
import hourglass from "@iconify-icons/material-symbols/hourglass";
import menu from "@iconify-icons/material-symbols/menu";
import menuOpen from "@iconify-icons/material-symbols/menu-open";
import schedule from "@iconify-icons/material-symbols/schedule";
import timer from "@iconify-icons/material-symbols/timer";

const staticValue = ref("timer");
const pushValue = ref("timer");
const pushExpanded = ref(false);
const overlayValue = ref("timer");
const overlayExpanded = ref(false);
const toggleValue = ref("timer");
const toggleOpen = ref(false);
const indexValue = ref(0);
</script>

# NavigationRail 导航栏

Material Design 3 的 navigation rail：竖向导航。`NavigationRail` 持有选中值（`v-model:value`），
`NavigationRailItem` 描述每一项。同一应用里导航栏应当是唯一的导航元素，不要再叠加
`NavigationBar` / `NavigationDrawer`。

| 变体                       | 宽度         | 文字                             | 展开                       |
| -------------------------- | ------------ | -------------------------------- | -------------------------- |
| `variant="static"`（默认） | 固定 80px    | 常显在图标下方                   | 不可展开                   |
| `variant="expandable"`     | 80px ↔ 256px | 折叠时隐藏，展开时出现在图标右侧 | 可由菜单按钮或外部状态控制 |

## 静态导航栏

图标在上、文字在下，宽度固定 80px，`v-model:expanded` 与 `overlay` 都不起作用。适合导航项固定、
不需要展开态的应用（平板 / 桌面常驻侧栏）。

<div class="demo-row">
  <div class="flex h-[26rem] w-full overflow-hidden rounded-ds border border-ds-line bg-ds-bg">
    <NavigationRail v-model:value="staticValue" :menu="false" label="时钟">
      <NavigationRailItem label="计时器" value="timer" :icon="hourglass" />
      <NavigationRailItem label="闹钟" value="alarm" :icon="alarm" />
      <NavigationRailItem label="时钟" value="clock" :icon="schedule" />
      <NavigationRailItem label="秒表" value="stopwatch" :icon="timer" />
    </NavigationRail>
    <div class="flex flex-1 items-start p-6 text-sm text-ds-muted">应用内容</div>
  </div>
</div>

当前选中值：{{ staticValue }}

```vue
<script setup lang="ts">
import { ref } from "vue";
import { NavigationRail, NavigationRailItem } from "@sharpdotnut/dotsharp";
import alarm from "@iconify-icons/material-symbols/alarm";
import hourglass from "@iconify-icons/material-symbols/hourglass";
import schedule from "@iconify-icons/material-symbols/schedule";
import timer from "@iconify-icons/material-symbols/timer";

const current = ref("timer");
</script>

<template>
  <NavigationRail v-model:value="current" label="时钟">
    <NavigationRailItem label="计时器" value="timer" :icon="hourglass" />
    <NavigationRailItem label="闹钟" value="alarm" :icon="alarm" />
    <NavigationRailItem label="时钟" value="clock" :icon="schedule" />
    <NavigationRailItem label="秒表" value="stopwatch" :icon="timer" />
  </NavigationRail>
</template>
```

需要菜单按钮时传入 `menu-icon`：点击不会改变宽度，只触发 `menu` 事件，由使用方决定打开什么
（例如一个 modal drawer）。

## 可展开导航栏

`variant="expandable"` 折叠时只渲染图标；展开到 256px 时，文字出现在图标右侧。菜单按钮与 item 图标
始终固定在左侧 80px 内，只有文字区域出现或消失。

展开有三种用法，按需要选择：

| 模式         | 配置                           | 折叠时               | 展开时                      |
| ------------ | ------------------------------ | -------------------- | --------------------------- |
| 挤开内容     | `variant="expandable"`         | 80px，仅图标         | 256px，内容向右让位         |
| 覆盖内容     | `variant="expandable" overlay` | 80px，仅图标         | 256px，覆盖同一容器内的内容 |
| 仅留一个开关 | `overlay` + 折叠时 `v-if`      | 不渲染，只留外部按钮 | 从容器左侧覆盖出现          |

`overlay` 用 `absolute` 锚定最近的定位容器，父元素需要 `relative`（Tailwind 的 `relative` 类）。

### 挤开内容

<div class="demo-row">
  <div class="flex h-[26rem] w-full overflow-hidden rounded-ds border border-ds-line bg-ds-bg">
    <NavigationRail v-model:value="pushValue" v-model:expanded="pushExpanded" variant="expandable" :menu-icon="menu" :menu-expanded-icon="menuOpen" menu-label="展开或收起导航" label="时钟">
      <NavigationRailItem label="计时器" value="timer" :icon="hourglass" />
      <NavigationRailItem label="闹钟" value="alarm" :icon="alarm" />
      <NavigationRailItem label="时钟" value="clock" :icon="schedule" />
      <NavigationRailItem label="秒表" value="stopwatch" :icon="timer" />
    </NavigationRail>
    <div class="flex flex-1 items-start p-6 text-sm text-ds-muted">应用内容</div>
  </div>
</div>

当前选中值：{{ pushValue }}，展开：{{ pushExpanded }}

```vue
<script setup lang="ts">
import { ref } from "vue";
import { NavigationRail, NavigationRailItem } from "@sharpdotnut/dotsharp";
import alarm from "@iconify-icons/material-symbols/alarm";
import hourglass from "@iconify-icons/material-symbols/hourglass";
import menu from "@iconify-icons/material-symbols/menu";
import menuOpen from "@iconify-icons/material-symbols/menu-open";

const current = ref("timer");
const expanded = ref(false);
</script>

<template>
  <NavigationRail
    v-model:value="current"
    v-model:expanded="expanded"
    variant="expandable"
    :menu-icon="menu"
    :menu-expanded-icon="menuOpen"
  >
    <NavigationRailItem label="计时器" value="timer" :icon="hourglass" />
    <NavigationRailItem label="闹钟" value="alarm" :icon="alarm" />
  </NavigationRail>
</template>
```

### 覆盖内容

加 `overlay` 后展开态不再挤开内容，而是在容器内覆盖在内容上方。它没有遮罩、不锁定页面滚动、
不接管焦点，也不是 modal：点击外部不会自动收起，收起由菜单按钮或使用方控制 `v-model:expanded` 完成。

<div class="demo-row">
  <div class="relative flex h-[24rem] w-full overflow-hidden rounded-ds border border-ds-line bg-ds-bg">
    <NavigationRail v-model:value="overlayValue" v-model:expanded="overlayExpanded" variant="expandable" overlay :menu-icon="menu" :menu-expanded-icon="menuOpen" menu-label="展开或收起导航" label="时钟">
      <NavigationRailItem label="计时器" value="timer" :icon="hourglass" />
      <NavigationRailItem label="闹钟" value="alarm" :icon="alarm" />
      <NavigationRailItem label="时钟" value="clock" :icon="schedule" />
      <NavigationRailItem label="秒表" value="stopwatch" :icon="timer" />
    </NavigationRail>
    <div class="flex flex-1 items-start p-6 text-sm text-ds-muted">应用内容（展开时被 rail 覆盖一部分）</div>
  </div>
</div>

当前选中值：{{ overlayValue }}，展开：{{ overlayExpanded }}

```vue
<script setup lang="ts">
import { ref } from "vue";
import { NavigationRail, NavigationRailItem } from "@sharpdotnut/dotsharp";
import alarm from "@iconify-icons/material-symbols/alarm";
import hourglass from "@iconify-icons/material-symbols/hourglass";
import menu from "@iconify-icons/material-symbols/menu";
import menuOpen from "@iconify-icons/material-symbols/menu-open";

const current = ref("timer");
const expanded = ref(false);
</script>

<template>
  <div class="relative flex h-[24rem]">
    <NavigationRail
      v-model:value="current"
      v-model:expanded="expanded"
      variant="expandable"
      overlay
      :menu-icon="menu"
      :menu-expanded-icon="menuOpen"
    >
      <NavigationRailItem label="计时器" value="timer" :icon="hourglass" />
      <NavigationRailItem label="闹钟" value="alarm" :icon="alarm" />
    </NavigationRail>
    <div class="flex-1">应用内容</div>
  </div>
</template>
```

### 仅留一个开关

折叠时完全不渲染 rail，只在容器内保留一个菜单按钮；点击后把 `v-model:expanded` 置为 `true`，rail 以
覆盖方式出现。展开后仍可用 rail 自带的菜单按钮收起，所以这里保留内置按钮、不用 `:menu="false"`。

<div class="demo-row">
  <div class="relative flex h-[24rem] w-full overflow-hidden rounded-ds border border-ds-line bg-ds-bg">
    <div class="flex flex-1 flex-col items-start gap-3 p-6">
      <Button @click="toggleOpen = true">展开导航</Button>
      <span class="text-sm text-ds-muted">应用内容</span>
    </div>
    <NavigationRail v-if="toggleOpen" v-model:value="toggleValue" v-model:expanded="toggleOpen" variant="expandable" overlay :menu-icon="menu" :menu-expanded-icon="menuOpen" menu-label="收起导航" label="时钟">
      <NavigationRailItem label="计时器" value="timer" :icon="hourglass" />
      <NavigationRailItem label="闹钟" value="alarm" :icon="alarm" />
      <NavigationRailItem label="时钟" value="clock" :icon="schedule" />
      <NavigationRailItem label="秒表" value="stopwatch" :icon="timer" />
    </NavigationRail>
  </div>
</div>

```vue
<script setup lang="ts">
import { ref } from "vue";
import { Button, NavigationRail, NavigationRailItem } from "@sharpdotnut/dotsharp";
import alarm from "@iconify-icons/material-symbols/alarm";
import hourglass from "@iconify-icons/material-symbols/hourglass";
import menu from "@iconify-icons/material-symbols/menu";
import menuOpen from "@iconify-icons/material-symbols/menu-open";

const open = ref(false);
const current = ref("timer");
</script>

<template>
  <div class="relative flex h-[24rem]">
    <div class="flex-1 p-6">
      <Button @click="open = true">展开导航</Button>
    </div>

    <NavigationRail
      v-if="open"
      v-model:value="current"
      v-model:expanded="open"
      variant="expandable"
      overlay
      :menu-icon="menu"
      :menu-expanded-icon="menuOpen"
      menu-label="收起导航"
    >
      <NavigationRailItem label="计时器" value="timer" :icon="hourglass" />
      <NavigationRailItem label="闹钟" value="alarm" :icon="alarm" />
    </NavigationRail>
  </div>
</template>
```

## 内置菜单按钮

| 行为            | `static`                   | `expandable`                      |
| --------------- | -------------------------- | --------------------------------- |
| 点击效果        | 触发 `menu` 事件，宽度不变 | 切换 `v-model:expanded`           |
| `aria-expanded` | 不输出                     | 输出当前展开状态                  |
| 图标切换        | 始终用 `menu-icon`         | 展开时优先用 `menu-expanded-icon` |

- `menu`（默认 `true`）：是否渲染按钮；只有提供 `menu-icon` 或 `menu` 插槽时才真正出现。
- `menu-label`：按钮的 `aria-label`。
- `menu` 是作用域插槽，参数为 `{ expanded }`，可替换成任意图标或自定义按钮内容：

```vue
<script setup lang="ts">
import { ref } from "vue";
import { Icon, NavigationRail, NavigationRailItem } from "@sharpdotnut/dotsharp";
import hourglass from "@iconify-icons/material-symbols/hourglass";
import menu from "@iconify-icons/material-symbols/menu";
import menuOpen from "@iconify-icons/material-symbols/menu-open";

const expanded = ref(false);
</script>

<template>
  <NavigationRail v-model:expanded="expanded" variant="expandable">
    <template #menu="{ expanded }">
      <Icon :icon="expanded ? menuOpen : menu" size="24" />
    </template>
    <NavigationRailItem label="计时器" :icon="hourglass" />
  </NavigationRail>
</template>
```

## 选中值与索引

`NavigationRailItem` 省略 `value` 时用自己的数字索引（从 `0` 开始）作为标识；`v-model:value` 默认是 `0`，
所以首项默认选中。

<div class="demo-row">
  <div class="flex h-[22rem] w-full overflow-hidden rounded-ds border border-ds-line bg-ds-bg">
    <NavigationRail v-model:value="indexValue" :menu="false" label="索引示例">
      <NavigationRailItem label="第一项" :icon="hourglass" />
      <NavigationRailItem label="第二项" :icon="alarm" />
      <NavigationRailItem label="第三项" :icon="schedule" />
    </NavigationRail>
    <div class="flex flex-1 items-start p-6 text-sm text-ds-muted">应用内容</div>
  </div>
</div>

当前选中索引：{{ indexValue }}

```vue
<script setup lang="ts">
import { ref } from "vue";
import { NavigationRail, NavigationRailItem } from "@sharpdotnut/dotsharp";
import alarm from "@iconify-icons/material-symbols/alarm";
import hourglass from "@iconify-icons/material-symbols/hourglass";
import schedule from "@iconify-icons/material-symbols/schedule";

const index = ref(0);
</script>

<template>
  <NavigationRail v-model:value="index">
    <NavigationRailItem label="第一项" :icon="hourglass" />
    <NavigationRailItem label="第二项" :icon="alarm" />
    <NavigationRailItem label="第三项" :icon="schedule" />
  </NavigationRail>
</template>
```

索引由 `NavigationRail` 按声明顺序注入，只统计 `NavigationRailItem`；`v-for`、`v-if` 都按最终渲染顺序
重新编号。需要跨版本稳定的标识时显式传 `value`。

## 单项内容

- `label`：纯文本。`static` 常显在图标下方；`expandable` 折叠时隐藏，展开时显示在图标右侧。
- `icon`：与 `Icon` 的 `icon` 同源，尺寸固定 24px。
- 默认插槽：**优先于 `label`**，适合自定义排版；过长文字会截断为省略号。

```vue
<NavigationRailItem label="计时器" :icon="hourglass" value="timer" />
<NavigationRailItem value="custom" :icon="schedule">
  <span class="font-medium">自定义内容</span>
</NavigationRailItem>
```

## API

### NavigationRail

| 属性               | 类型                       | 默认值                | 说明                                                   |
| ------------------ | -------------------------- | --------------------- | ------------------------------------------------------ |
| variant            | `"static" \| "expandable"` | `"static"`            | `static` 常显文字、不可展开；`expandable` 可展开       |
| v-model:value      | `string \| number`         | `0`                   | 当前选中值，对应子项的 `value` 或索引                  |
| v-model:expanded   | `boolean`                  | `false`               | 仅 `expandable`：是否展开为 256px                      |
| overlay            | `boolean`                  | `false`               | 仅 `expandable`：展开时在定位容器内覆盖内容            |
| menu               | `boolean`                  | `true`                | 是否渲染内置菜单按钮                                   |
| menu-label         | `string`                   | `"Toggle navigation"` | 菜单按钮的 `aria-label`                                |
| menu-icon          | `IconifyIcon \| string`    | —                     | 折叠态菜单图标；没有图标且没有 `menu` 插槽时按钮不渲染 |
| menu-expanded-icon | `IconifyIcon \| string`    | —                     | 展开态菜单图标，省略时沿用 `menu-icon`                 |
| label              | `string`                   | —                     | 无障碍名称，写入 `<nav>` 的 `aria-label`               |

事件：

| 事件   | 触发时机                                          |
| ------ | ------------------------------------------------- |
| `menu` | `static` 变体点击内置菜单按钮时；不改变 rail 宽度 |

插槽：

| 插槽    | 作用域                  | 说明                      |
| ------- | ----------------------- | ------------------------- |
| default | —                       | 一组 `NavigationRailItem` |
| menu    | `{ expanded: boolean }` | 替换内置菜单按钮的内容    |

### NavigationRailItem

| 属性  | 类型                    | 默认值       | 说明                                 |
| ----- | ----------------------- | ------------ | ------------------------------------ |
| label | `string`                | —            | 纯文本内容；存在默认插槽时被插槽覆盖 |
| icon  | `IconifyIcon \| string` | —            | 图标，尺寸 24px，渲染在文字/插槽之前 |
| value | `string \| number`      | 所在位置索引 | 子项标识                             |

- 根元素是 `type="button"` 的 `button`，选中项带 `aria-current="page"`。
- 默认插槽优先于 `label`；与 `icon` 同时使用时插槽内容排在图标之后。
- 选中指示器：`static` 与折叠态只包住图标；展开态是整行胶囊。

## 可访问性

- 根元素是 `<nav>`；内置菜单按钮请通过 `menu-label` 提供可读名称。
- `expandable` 的菜单按钮带 `aria-expanded`；`static` 按钮没有该属性，只触发 `menu` 事件。
- 展开/收起只改变宽度与文字可见性，同一组 `button` 保留，焦点不会丢失。
- `overlay` 只是容器内的绝对定位布局，不产生遮罩、不锁定滚动、不接管焦点，也没有对话框语义。
- 选中项用 `aria-current="page"` 表达当前位置，不要只依赖颜色。
