<script setup lang="ts">
import { ref } from "vue";
import { Button, Card, Container, Icon, IconButton } from "@sharpdotnut/dotsharp";
import moreIcon from "@iconify-icons/material-symbols/more-vert";
import folderIcon from "@iconify-icons/material-symbols/folder";
import closeIcon from "@iconify-icons/material-symbols/close";

const lastAction = ref<string | null>(null);
</script>

# Card 卡片

`Card` 是带表面样式的布局容器：一层背景、一组圆角，加上标题行、正文和底部操作栏三段固定结构。
它和 [`Container`](/components/container) 共用层级上下文，因此卡片里的卡片会自动深一层。

`Card` 只负责排版，不负责交互：点击、选中、跳转都由卡片里的内容自己决定。

## 最小用法

`title` 是标题，默认插槽是正文。

<div class="demo-row">
  <Card title="共享文件夹" class="w-full max-w-sm">
    <p class="text-sm text-ds-fg">任何拿到链接的人都可以查看这个文件夹。</p>
  </Card>
</div>

```vue
<template>
  <Card title="共享文件夹">任何拿到链接的人都可以查看这个文件夹。</Card>
</template>
```

## 三段结构

卡片的 DOM 永远是三块，缺省的部分不渲染，也不留空隙：

| 区块 | 元素             | 内容                                                                   |
| ---- | ---------------- | ---------------------------------------------------------------------- |
| 头部 | `<header>`       | `title-left` 槽位 · 标题列（`title` / `subtitle`）· `title-right` 槽位 |
| 正文 | 无标签的内容容器 | 默认插槽                                                               |
| 底部 | `<footer>`       | `footer-left` 槽位 + `footer-right` 槽位                               |

标题永远在卡片最顶端：头部没有上方留白，头部的存在只给正文加上边距。头部和底部各自在两组槽位都
为空时才完全不渲染。

## 变体

`variant` 决定表面，层级决定圆角与内边距：

<div class="demo-row">
  <Card variant="elevated" title="浮起" class="w-52">
    <p class="text-sm text-ds-muted">阴影抬升，浮在页面上。</p>
  </Card>
  <Card variant="filled" title="填充" class="w-52">
    <p class="text-sm text-ds-muted">填充底色，视觉重量更低。</p>
  </Card>
  <Card variant="surface" title="表面" class="w-52">
    <p class="text-sm text-ds-muted">只有表面色，没有任何装饰。</p>
  </Card>
  <Card variant="outlined" title="描边" class="w-52">
    <p class="text-sm text-ds-muted">一条描边，适合密集排布。</p>
  </Card>
  <Card variant="plain" title="透明" class="w-52">
    <p class="text-sm text-ds-muted">完全透明，只保留圆角与排版。</p>
  </Card>
</div>

```vue
<template>
  <Card variant="elevated" title="浮起">…</Card>
  <Card variant="filled" title="填充">…</Card>
  <Card variant="surface" title="表面">…</Card>
  <Card variant="outlined" title="描边">…</Card>
  <Card variant="plain" title="透明">…</Card>
</template>
```

`surface` 是对话框面板用的表面色，`plain` 用于把卡片结构套在已有背景上。

## 标题与副标题

`title` 和 `subtitle` 各接受一段纯文本；需要标记、链接、换行这类富内容时改用 `title` / `subtitle` 插槽，
插槽优先于属性。副标题由你自己排版，使用插槽时它不会自动获得上边距。

两者的默认节点都是普通 `div`，不用 `h3` / `p`：组件库不带 reset，中性元素不会被宿主页面的标题、
段落排版（外边距、字号、行高）改写。需要标题层级时用 `#title` 插槽自己写 `<h3>`。

<div class="demo-row">
  <Card class="w-full max-w-sm">
    <template #title>
      <div class="flex items-center gap-2">
        <span class="rounded-ds-sm bg-ds-tonal px-2 py-0.5 text-xs text-ds-on-tonal">公测</span>
        <span class="text-base leading-6 font-medium">共享文件夹</span>
      </div>
    </template>
    <template #subtitle>
      <p class="mt-1 text-sm leading-5 text-ds-muted">
        邀请链接 <span class="text-ds-primary-strong">7 天后过期</span>。
      </p>
    </template>
    <p class="text-sm text-ds-fg">任何拿到链接的人都可以查看这个文件夹。</p>
  </Card>
</div>

```vue
<template>
  <Card>
    <template #title>
      <div class="flex items-center gap-2">
        <span class="rounded-ds-sm bg-ds-tonal px-2 py-0.5 text-xs text-ds-on-tonal">公测</span>
        <span class="text-base leading-6 font-medium">共享文件夹</span>
      </div>
    </template>
    <template #subtitle>
      <p class="mt-1 text-sm leading-5 text-ds-muted">邀请链接 <span>7 天后过期</span>。</p>
    </template>
    任何拿到链接的人都可以查看这个文件夹。
  </Card>
</template>
```

## 标题两侧的槽位

`title-left` 与 `title-right` 与标题同一行，分别贴在左右两端，用来放图标、头像、更多操作或关闭按钮。
两个槽位随整个标题栏（标题 + 副标题）的高度垂直居中：只有标题时它们对齐标题行，出现副标题后整栏变高，
槽位内容自动落到两行中间，而不是贴着顶部。

<div class="demo-row">
  <Card title="收件箱" class="w-60">
    <template #title-left>
      <Icon :icon="folderIcon" size="20" class="text-ds-muted" />
    </template>
    <p class="text-sm text-ds-muted">左槽位放前置图标。</p>
  </Card>
  <Card title="共享文件夹" subtitle="邀请链接 7 天后过期" class="w-full max-w-sm">
    <template #title-right>
      <IconButton :icon="moreIcon" label="更多操作" />
    </template>
    <p class="text-sm text-ds-fg">右槽位放操作按钮。</p>
  </Card>
  <Card title="已归档" class="w-60">
    <template #title-right>
      <IconButton :icon="closeIcon" label="关闭" />
    </template>
    <p class="text-sm text-ds-muted">关闭按钮与标题同一行。</p>
  </Card>
</div>

```vue
<template>
  <Card title="收件箱">
    <template #title-left>
      <Icon :icon="folderIcon" size="20" />
    </template>
    左槽位放前置图标。
  </Card>
  <Card title="共享文件夹" subtitle="邀请链接 7 天后过期">
    <template #title-right>
      <IconButton :icon="moreIcon" label="更多操作" />
    </template>
    右槽位放操作按钮。
  </Card>
  <Card title="已归档">
    <template #title-right>
      <IconButton :icon="closeIcon" label="关闭" />
    </template>
    关闭按钮与标题同一行。
  </Card>
</template>
```

槽位内容自己决定样式：图标用 [`Icon`](/components/icon)，按钮用 `IconButton` 或 `Button`。
放多个控件时它们之间会自动留出间距。

## 底部操作

底部是左右两组槽位：`footer-right` 放主操作，`footer-left` 放需要推向行首的次要操作。

只放主操作时：

<div class="demo-row">
  <Card title="共享文件夹" subtitle="邀请链接 7 天后过期" class="w-full max-w-sm">
    <template #title-right>
      <IconButton :icon="moreIcon" label="更多操作" />
    </template>
    <p class="text-sm text-ds-fg">任何拿到链接的人都可以查看这个文件夹。</p>
    <template #footer-right>
      <Button variant="text" @click="lastAction = '取消'">取消</Button>
      <Button @click="lastAction = '创建链接'">创建链接</Button>
    </template>
  </Card>
</div>

上次点击：{{ lastAction ?? "还没有点击" }}

```vue
<template>
  <Card title="共享文件夹" subtitle="邀请链接 7 天后过期">
    <template #title-right>
      <IconButton :icon="moreIcon" label="更多操作" />
    </template>
    任何拿到链接的人都可以查看这个文件夹。
    <template #footer-right>
      <Button variant="text">取消</Button>
      <Button>创建链接</Button>
    </template>
  </Card>
</template>
```

两侧都要时，把「了解更多」这类入口放进 `footer-left`：

<div class="demo-row">
  <Card title="开启定位服务？" class="w-full max-w-sm">
    <p class="text-sm leading-5 text-ds-muted">
      允许其他应用借助此服务确定你的位置。这意味着即使没有应用在运行，也会共享匿名的位置数据。
    </p>
    <template #footer-left>
      <Button variant="text">了解更多</Button>
    </template>
    <template #footer-right>
      <Button variant="text">不同意</Button>
      <Button variant="text">同意</Button>
    </template>
  </Card>
</div>

```vue
<template>
  <Card title="开启定位服务？">
    正文……
    <template #footer-left>
      <Button variant="text">了解更多</Button>
    </template>
    <template #footer-right>
      <Button variant="text">不同意</Button>
      <Button variant="text">同意</Button>
    </template>
  </Card>
</template>
```

### 放不下时折成两行

底部是 `flex-wrap` 容器，右组带 `margin-left: auto`：两组放得下时同一行左右分开；放不下时右组整组折到
第二行，并且仍然贴右边缘，左组留在第一行左端。

<div class="demo-row">
  <Card title="删除后无法恢复" class="w-56">
    <p class="text-sm text-ds-muted">窄卡片里底部会分成两行。</p>
    <template #footer-left>
      <Button variant="text" size="sm">了解更多</Button>
    </template>
    <template #footer-right>
      <Button variant="text" size="sm">稍微想想</Button>
      <Button variant="text" size="sm">确认删除</Button>
    </template>
  </Card>
  <Card title="删除后无法恢复" class="w-full max-w-md">
    <p class="text-sm text-ds-muted">同样两组操作，宽卡片里保持一行。</p>
    <template #footer-left>
      <Button variant="text" size="sm">了解更多</Button>
    </template>
    <template #footer-right>
      <Button variant="text" size="sm">稍微想想</Button>
      <Button variant="text" size="sm">确认删除</Button>
    </template>
  </Card>
</div>

```vue
<Card title="删除后无法恢复" class="w-56">
  正文……
  <template #footer-left>
    <Button variant="text" size="sm">了解更多</Button>
  </template>
  <template #footer-right>
    <Button variant="text" size="sm">稍微想想</Button>
    <Button variant="text" size="sm">确认删除</Button>
  </template>
</Card>
```

折行判断的是内容实际宽度，不是断点，所以长文案、放大字号、窄容器都会触发同样的两行布局。

## 内边距

`padded` 默认为 `true`，由层级决定内边距。传 `false` 后卡片只留下背景与圆角，排版完全交给内容——
整宽色带、图片、列表这类需要贴边的版式用它。

<div class="demo-row">
  <Card :padded="false" variant="outlined" class="w-full max-w-sm">
    <div class="bg-ds-tonal px-4 py-3 text-sm text-ds-on-tonal">整宽色带贴着卡片边缘</div>
    <div class="px-4 py-3 text-sm text-ds-muted">正文自己管内边距。</div>
    <div class="flex justify-end gap-2 px-4 pb-4">
      <Button variant="text" size="sm">取消</Button>
      <Button size="sm">保存</Button>
    </div>
  </Card>
</div>

```vue
<template>
  <Card :padded="false" variant="outlined">
    <div class="bg-ds-tonal px-4 py-3">整宽色带贴着卡片边缘</div>
    <div class="px-4 py-3">正文自己管内边距。</div>
    <div class="flex justify-end gap-2 px-4 pb-4">
      <Button variant="text" size="sm">取消</Button>
      <Button size="sm">保存</Button>
    </div>
  </Card>
</template>
```

带标题的卡片也可以 `padded="false"`，此时头部同样没有内边距。

## 层级与嵌套

`Card` 与 `Container` 共用层级：外层自动是 1，嵌套自动加深，最多三层；圆角与内边距随层级收缩
（`rounded-ds-xl` / `p-4` → `rounded-ds-lg` / `p-3` → `rounded-ds` / `p-2`）。

<div class="demo-row">
  <Card title="第 1 层" class="w-full max-w-md">
    <Container class="mt-3">
      <Card variant="outlined" title="第 2 层">
        <Container class="mt-2">
          <Card variant="filled" title="第 3 层">
            <p class="text-sm text-ds-muted">再深也只停在第 3 层。</p>
          </Card>
        </Container>
      </Card>
    </Container>
  </Card>
</div>

```vue
<template>
  <Card title="第 1 层">
    <Container>
      <Card variant="outlined" title="第 2 层">
        <Container>
          <Card variant="filled" title="第 3 层">…</Card>
        </Container>
      </Card>
    </Container>
  </Card>
</template>
```

需要脱离父层级（例如浮层里的卡片仍要第 1 层的圆角）时，显式传 `level`：

<div class="demo-row">
  <Card title="外层" class="w-full max-w-md">
    <Container class="mt-3">
      <Card variant="outlined" title="固定的第 1 层" :level="1">
        <p class="text-sm text-ds-muted">圆角与内边距按第 1 层计算。</p>
      </Card>
    </Container>
  </Card>
</div>

```vue
<template>
  <Card title="外层">
    <Container>
      <Card variant="outlined" title="固定的第 1 层" :level="1">…</Card>
    </Container>
  </Card>
</template>
```

## 在受限高度里延伸

卡片根是纵向 flex 容器，正文容器带 `flex-1` 与 `min-h-0`。因此给卡片加 `max-h-*` 后，正文可以自己
滚动、头部与底部保持不动——`Dialog` 的面板就是这么用卡片的。

<div class="demo-row">
  <Card title="最近活动" class="w-full max-w-sm max-h-52">
    <div class="min-h-0 flex-1 overflow-y-auto text-sm text-ds-muted">
      <p v-for="index in 12" :key="index" class="mb-2">第 {{ index }} 条活动记录。</p>
    </div>
    <div class="mt-2 flex shrink-0 justify-end border-t border-ds-line pt-2">
      <Button variant="text" size="sm">全部查看</Button>
    </div>
  </Card>
</div>

```vue
<template>
  <Card title="最近活动" class="max-h-52">
    <div class="min-h-0 flex-1 overflow-y-auto">
      <p v-for="index in 12" :key="index">第 {{ index }} 条活动记录。</p>
    </div>
    <div class="mt-2 flex shrink-0 justify-end border-t border-ds-line pt-2">
      <Button variant="text" size="sm">全部查看</Button>
    </div>
  </Card>
</template>
```

## API

| 属性       | 类型                                                           | 默认值       | 说明                            |
| ---------- | -------------------------------------------------------------- | ------------ | ------------------------------- |
| `variant`  | `"elevated" \| "filled" \| "surface" \| "outlined" \| "plain"` | `"elevated"` | 表面样式                        |
| `title`    | `string`                                                       | —            | 标题文本，`title` 插槽优先      |
| `subtitle` | `string`                                                       | —            | 副标题文本，`subtitle` 插槽优先 |
| `level`    | `1 \| 2 \| 3`                                                  | 自动         | 手动指定层级，忽略父容器        |
| `padded`   | `boolean`                                                      | `true`       | 是否使用层级对应的内边距        |

### 插槽

| 名称           | 说明                                             |
| -------------- | ------------------------------------------------ |
| `default`      | 正文                                             |
| `title`        | 自定义标题内容，替换整段标题                     |
| `subtitle`     | 自定义副标题内容；需要自己加上边距               |
| `title-left`   | 标题行左端，与标题垂直居中                       |
| `title-right`  | 标题行右端，与标题垂直居中                       |
| `footer-left`  | 左侧操作组，第一行左端                           |
| `footer-right` | 右侧操作组，贴右边缘；两组放不下时整组折到第二行 |

### 结构

- 根元素类名 `ds-card`：`box-border flex flex-col` + 层级圆角 + 变体表面 + 可选内边距，
  并 `provide` 当前层级给子容器。
- 头部只在有标题文本或标题相关插槽时渲染，类名固定为 `flex items-center gap-3`；
  标题列是 `min-w-0 flex-1`，两端的槽位是 `flex shrink-0 items-center gap-1`，随标题栏高度垂直居中。
- 正文容器是 `flex min-h-0 flex-1 flex-col`，头部存在时加 `mt-3`。
- 底部只在有 `footer-left` / `footer-right` 时渲染：`mt-3 flex flex-wrap items-center gap-2 pt-3`
  （只有留白，没有分隔线），右组额外带 `ml-auto`。
- 默认标题与副标题是 `div`（标题 `truncate text-base leading-6 font-medium`，副标题
  `mt-1 text-sm leading-5 text-ds-muted`）：组件库不带 reset，用中性元素可以避免宿主页面对
  `h1–h6` / `p` 的排版（外边距、字号）渗进卡片；需要标题语义时用 `#title` 插槽自己写 `<h3>`。
- 颜色、圆角、字体全部来自 `--ds-*` 令牌，`class` 与 `style` 透传到根元素。
