<script setup lang="ts">
import { ref } from "vue";
import { Button, NavigationRail, NavigationRailItem } from "@sharpdotnut/dotsharp";
import alarm from "@iconify-icons/material-symbols/alarm";
import alarmOn from "@iconify-icons/material-symbols/alarm-on";
import hourglass from "@iconify-icons/material-symbols/hourglass";
import menu from "@iconify-icons/material-symbols/menu";
import menuOpen from "@iconify-icons/material-symbols/menu-open";
import schedule from "@iconify-icons/material-symbols/schedule";
import timer from "@iconify-icons/material-symbols/timer";

const standardValue = ref("timer");
const pushValue = ref("timer");
const pushExpanded = ref(false);
const modalValue = ref("timer");
const modalOpen = ref(false);
const widthValue = ref("timer");
const widthExpanded = ref(true);
const indexValue = ref(0);
</script>

# NavigationRail 侧边导航栏

竖向导航。`NavigationRail` 持有选中值（`v-model:value`），`NavigationRailItem` 描述每一项。
同一应用里导航栏应当是唯一的导航元素，不要再叠加 `NavigationBar` / `NavigationDrawer`。

折叠态固定 96px，展开态 220–360px，两种形态都始终显示文字。

| 形态                        | 宽度        | 排版                                      |
| --------------------------- | ----------- | ----------------------------------------- |
| 折叠（默认，`96px`）        | 固定 `96px` | 图标在上、文字在下                        |
| 展开（`expandable`）        | `220–360px` | 图标与文字左右排列，整行胶囊指示          |
| 不可展开（无 `expandable`） | 固定 `96px` | 始终折叠排版，`v-model:expanded` 不起作用 |

## 子项约定

`NavigationRail` / `NavigationRailItem` 遵循[父子组件以及插槽统一范式](/guide/patterns)：选中值由
`v-model:value` 持有，`NavigationRailItem` 用 `label`、`icon` 或默认插槽描述内容，标识取 `value` 或
父组件注入的索引。

## 标准侧边导航

不传 `expandable` 时是固定 96px 的折叠 rail：图标在上、文字在下，`v-model:expanded` 不会改变宽度。

<div class="demo-row">
  <div class="flex h-[26rem] w-full overflow-hidden rounded-ds border border-ds-line bg-ds-bg">
    <NavigationRail v-model:value="standardValue" :menu="false" label="时钟">
      <NavigationRailItem label="计时器" value="timer" :icon="hourglass" />
      <NavigationRailItem label="闹钟" value="alarm" :icon="alarm" />
      <NavigationRailItem label="时钟" value="clock" :icon="schedule" />
      <NavigationRailItem label="秒表" value="stopwatch" :icon="timer" />
    </NavigationRail>
    <div class="flex flex-1 items-start p-6 text-sm text-ds-muted">应用内容</div>
  </div>
</div>

当前选中值：{{ standardValue }}

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
  <div class="flex h-[26rem] w-full overflow-hidden rounded-ds border border-ds-line bg-ds-bg">
    <NavigationRail v-model:value="current" :menu="false" label="时钟">
      <NavigationRailItem label="计时器" value="timer" :icon="hourglass" />
      <NavigationRailItem label="闹钟" value="alarm" :icon="alarm" />
      <NavigationRailItem label="时钟" value="clock" :icon="schedule" />
      <NavigationRailItem label="秒表" value="stopwatch" :icon="timer" />
    </NavigationRail>
    <div class="flex flex-1 items-start p-6 text-sm text-ds-muted">应用内容</div>
  </div>
</template>
```

需要菜单按钮时传入 `menu-icon`：不可展开时点击不改变宽度，只触发 `menu` 事件，由使用方决定打开什么
（例如一个 modal drawer）。

## 可展开导航栏

加 `expandable` 后由菜单按钮切换折叠 / 展开：折叠 96px 只留图标与下方文字，展开到 `expandedWidth`
（默认 256px，夹在 220–360px 之间）时文字移到图标右侧，选中指示变成整行胶囊。

`presentation` 决定展开时如何占用空间：

| `presentation`       | 展开时的布局                                                     |
| -------------------- | ---------------------------------------------------------------- |
| `"standard"`（默认） | 挤开同一行里的内容（`relative` + 宽度动画）                      |
| `"modal"`            | 用 `absolute` 覆盖最近的定位容器，带遮罩、焦点陷阱与 Escape 关闭 |

`modal` 依赖父元素是定位容器（Tailwind 的 `relative` 类），遮罩只覆盖这个容器，不是视口级浮层。

### 挤开内容（standard）

<div class="demo-row">
  <div class="flex h-[26rem] w-full overflow-hidden rounded-ds border border-ds-line bg-ds-bg">
    <NavigationRail v-model:value="pushValue" v-model:expanded="pushExpanded" expandable :menu-icon="menu" :menu-expanded-icon="menuOpen" menu-label="展开或收起导航" label="时钟">
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
import schedule from "@iconify-icons/material-symbols/schedule";
import timer from "@iconify-icons/material-symbols/timer";

const current = ref("timer");
const expanded = ref(false);
</script>

<template>
  <div class="flex h-[26rem] w-full overflow-hidden rounded-ds border border-ds-line bg-ds-bg">
    <NavigationRail
      v-model:value="current"
      v-model:expanded="expanded"
      expandable
      :menu-icon="menu"
      :menu-expanded-icon="menuOpen"
      menu-label="展开或收起导航"
      label="时钟"
    >
      <NavigationRailItem label="计时器" value="timer" :icon="hourglass" />
      <NavigationRailItem label="闹钟" value="alarm" :icon="alarm" />
      <NavigationRailItem label="时钟" value="clock" :icon="schedule" />
      <NavigationRailItem label="秒表" value="stopwatch" :icon="timer" />
    </NavigationRail>
    <div class="flex flex-1 items-start p-6 text-sm text-ds-muted">应用内容</div>
  </div>
</template>
```

### 覆盖内容（modal）

`presentation="modal"` 时展开态覆盖在容器内容之上：带遮罩，点击遮罩、按 Escape 或点击菜单按钮都会收起；
导航本身带 `role="dialog"` 与 `aria-modal="true"`，焦点在内部循环，收起后归还给原元素。

<div class="demo-row">
  <div class="relative flex h-[24rem] w-full overflow-hidden rounded-ds border border-ds-line bg-ds-bg">
    <NavigationRail v-model:value="modalValue" v-model:expanded="modalOpen" expandable presentation="modal" :menu-icon="menu" :menu-expanded-icon="menuOpen" menu-label="收起导航" label="时钟">
      <NavigationRailItem label="计时器" value="timer" :icon="hourglass" />
      <NavigationRailItem label="闹钟" value="alarm" :icon="alarm" />
      <NavigationRailItem label="时钟" value="clock" :icon="schedule" />
      <NavigationRailItem label="秒表" value="stopwatch" :icon="timer" />
    </NavigationRail>
    <div class="flex flex-1 flex-col items-start gap-3 p-6">
      <Button @click="modalOpen = true">展开导航</Button>
      <span class="text-sm text-ds-muted">应用内容（展开时被 rail 覆盖）</span>
    </div>
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
import schedule from "@iconify-icons/material-symbols/schedule";
import timer from "@iconify-icons/material-symbols/timer";

const current = ref("timer");
const expanded = ref(false);
</script>

<template>
  <div
    class="relative flex h-[24rem] w-full overflow-hidden rounded-ds border border-ds-line bg-ds-bg"
  >
    <NavigationRail
      v-model:value="current"
      v-model:expanded="expanded"
      expandable
      presentation="modal"
      :menu-icon="menu"
      :menu-expanded-icon="menuOpen"
      menu-label="收起导航"
      label="时钟"
    >
      <NavigationRailItem label="计时器" value="timer" :icon="hourglass" />
      <NavigationRailItem label="闹钟" value="alarm" :icon="alarm" />
      <NavigationRailItem label="时钟" value="clock" :icon="schedule" />
      <NavigationRailItem label="秒表" value="stopwatch" :icon="timer" />
    </NavigationRail>

    <div class="flex flex-1 flex-col items-start gap-3 p-6">
      <Button @click="expanded = true">展开导航</Button>
      <span class="text-sm text-ds-muted">应用内容（展开时被 rail 覆盖）</span>
    </div>
  </div>
</template>
```

### 展开宽度

`expandedWidth` 接受数字（按 px 处理），超出 220–360 会被夹到区间端点：

<div class="demo-row">
  <div class="flex h-[24rem] w-full overflow-hidden rounded-ds border border-ds-line bg-ds-bg">
    <NavigationRail v-model:value="widthValue" v-model:expanded="widthExpanded" expandable :expanded-width="300" :menu-icon="menu" :menu-expanded-icon="menuOpen" label="时钟">
      <NavigationRailItem label="计时器" value="timer" :icon="hourglass" />
      <NavigationRailItem label="闹钟" value="alarm" :icon="alarm" />
      <NavigationRailItem label="时钟" value="clock" :icon="schedule" />
    </NavigationRail>
    <div class="flex flex-1 items-start p-6 text-sm text-ds-muted">应用内容</div>
  </div>
</div>

```vue
<NavigationRail
  v-model:value="current"
  v-model:expanded="expanded"
  expandable
  :expanded-width="300"
  :menu-icon="menu"
  :menu-expanded-icon="menuOpen"
  label="时钟"
>
  <NavigationRailItem label="计时器" value="timer" :icon="hourglass" />
  <NavigationRailItem label="闹钟" value="alarm" :icon="alarm" />
  <NavigationRailItem label="时钟" value="clock" :icon="schedule" />
</NavigationRail>
```

## 内置菜单按钮

| 行为            | 不可展开（默认）           | `expandable`                      |
| --------------- | -------------------------- | --------------------------------- |
| 点击效果        | 触发 `menu` 事件，宽度不变 | 切换 `v-model:expanded`           |
| `aria-expanded` | 不输出                     | 输出当前展开状态                  |
| `aria-controls` | 不输出                     | 指向内部导航项列表的 `id`         |
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
  <NavigationRail v-model:expanded="expanded" expandable>
    <template #menu="{ expanded }">
      <Icon :icon="expanded ? menuOpen : menu" size="24" />
    </template>
    <NavigationRailItem label="计时器" :icon="hourglass" />
  </NavigationRail>
</template>
```

## 链接、禁用与选中图标

- `href`：有值时根元素渲染成 `<a href>`，仍保留 `aria-current="page"`，可以配合 `@click.prevent` 交给路由处理。
- `disabled`：按钮带原生 `disabled`；链接带 `aria-disabled="true"` 与 `tabindex="-1"`，并且不再改写选中值。
- `active-icon`：选中时替换 `icon`，折叠与展开两种排版都会生效。

<div class="demo-row">
  <div class="flex h-[22rem] w-full overflow-hidden rounded-ds border border-ds-line bg-ds-bg">
    <NavigationRail :value="'alarm'" :menu="false" label="链接示例">
      <NavigationRailItem label="计时器" value="timer" :icon="hourglass" href="/timer" />
      <NavigationRailItem label="闹钟" value="alarm" :icon="alarm" :active-icon="alarmOn" href="/alarm" />
      <NavigationRailItem label="秒表" value="stopwatch" :icon="timer" disabled />
    </NavigationRail>
    <div class="flex flex-1 items-start p-6 text-sm text-ds-muted">应用内容</div>
  </div>
</div>

```vue
<script setup lang="ts">
import { NavigationRail, NavigationRailItem } from "@sharpdotnut/dotsharp";
import alarm from "@iconify-icons/material-symbols/alarm";
import alarmOn from "@iconify-icons/material-symbols/alarm-on";
import hourglass from "@iconify-icons/material-symbols/hourglass";
import timer from "@iconify-icons/material-symbols/timer";
</script>

<template>
  <NavigationRail :value="'alarm'" :menu="false" label="链接示例">
    <NavigationRailItem label="计时器" value="timer" :icon="hourglass" href="/timer" />
    <NavigationRailItem
      label="闹钟"
      value="alarm"
      :icon="alarm"
      :active-icon="alarmOn"
      href="/alarm"
    />
    <NavigationRailItem label="秒表" value="stopwatch" :icon="timer" disabled />
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
  <NavigationRail v-model:value="index" :menu="false" label="索引示例">
    <NavigationRailItem label="第一项" :icon="hourglass" />
    <NavigationRailItem label="第二项" :icon="alarm" />
    <NavigationRailItem label="第三项" :icon="schedule" />
  </NavigationRail>
</template>
```

索引由 `NavigationRail` 按最终渲染顺序注入，规则见[父子组件以及插槽统一范式](/guide/patterns#子项标识-value-或索引)。

## 单项内容

- `label`：纯文本，**始终显示**——折叠时在图标下方，展开时在图标右侧；它同时是该项的无障碍名称。
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

| 属性               | 类型                    | 默认值                | 说明                                                   |
| ------------------ | ----------------------- | --------------------- | ------------------------------------------------------ |
| v-model:value      | `string \| number`      | `0`                   | 当前选中值，对应子项的 `value` 或索引                  |
| v-model:expanded   | `boolean`               | `false`               | 仅 `expandable`：是否展开为 `expandedWidth`            |
| expandable         | `boolean`               | `false`               | 允许菜单按钮展开 / 收起                                |
| presentation       | `"standard" \| "modal"` | `"standard"`          | 展开时挤开内容，或在定位容器内覆盖内容                 |
| expandedWidth      | `number`                | `256`                 | 展开宽度，夹在 220–360px 之间                          |
| menu               | `boolean`               | `true`                | 是否渲染内置菜单按钮                                   |
| menu-label         | `string`                | `"Toggle navigation"` | 菜单按钮的 `aria-label`                                |
| menu-icon          | `IconifyIcon \| string` | —                     | 折叠态菜单图标；没有图标且没有 `menu` 插槽时按钮不渲染 |
| menu-expanded-icon | `IconifyIcon \| string` | —                     | 展开态菜单图标，省略时沿用 `menu-icon`                 |
| label              | `string`                | —                     | 无障碍名称，写入 `<nav>` 的 `aria-label`               |

事件：

| 事件   | 触发时机                                     |
| ------ | -------------------------------------------- |
| `menu` | 不可展开时点击内置菜单按钮；不改变 rail 宽度 |

插槽：

| 插槽    | 作用域                  | 说明                      |
| ------- | ----------------------- | ------------------------- |
| default | —                       | 一组 `NavigationRailItem` |
| menu    | `{ expanded: boolean }` | 替换内置菜单按钮的内容    |

### NavigationRailItem

| 属性       | 类型                    | 默认值       | 说明                                                |
| ---------- | ----------------------- | ------------ | --------------------------------------------------- |
| label      | `string`                | —            | 纯文本内容，始终显示；存在默认插槽时被插槽覆盖      |
| icon       | `IconifyIcon \| string` | —            | 图标，尺寸 24px，渲染在文字/插槽之前                |
| activeIcon | `IconifyIcon \| string` | —            | 选中时替换 `icon`                                   |
| value      | `string \| number`      | 所在位置索引 | 子项标识                                            |
| href       | `string`                | —            | 有值时根元素渲染成 `<a>`，用于真实链接导航          |
| disabled   | `boolean`               | `false`      | 禁用，按钮用原生 `disabled`，链接用 `aria-disabled` |

- 根元素是 `button`（`href` 存在时是 `a`），选中项带 `aria-current="page"`。
- 默认插槽优先于 `label`；与 `icon` 同时使用时插槽内容排在图标之后。
- 选中指示器：折叠态只包住图标（8×14 胶囊），展开态是整行 56px 胶囊。

## 可访问性

- 根元素是 `<nav>`；请通过 `label` 给出可读名称，内置菜单按钮用 `menu-label`。
- 折叠态不再隐藏文字：每一项的可读名称就是它的 `label`（或插槽内容），无需额外的 `aria-label`。
- `expandable` 的菜单按钮带 `aria-expanded` 与 `aria-controls`；不可展开的按钮没有这两个属性，只触发 `menu` 事件。
- `presentation="modal"` 展开时 rail 带 `role="dialog"` 与 `aria-modal="true"`：焦点在内部循环，Escape 收起，
  收起后焦点归还给触发元素；遮罩点击也能收起。它不是视口级浮层，只覆盖最近的定位容器。
- 选中项用 `aria-current="page"` 表达当前位置，不要只依赖颜色。
