<script setup lang="ts">
import { ref } from "vue";
import { Button, Card, Container, IconButton } from "@sharpdotnut/dotsharp";
import moreIcon from "@iconify-icons/material-symbols/more-vert";

const dismissed = ref(false);
</script>

# Card 卡片

`Card` 是带表面样式的布局容器，建立在与 [`Container`](/components/container) 相同的层级上下文上：
嵌套时自动加深一层，最多三层，也可以用 `level` 手动指定。

- `variant` 决定表面：`elevated`（抬升阴影）、`filled`（填充）、`outlined`（描边）、`plain`（透明）。
- `title` / `subtitle` 渲染头部；`actions` 插槽放在标题右侧，`footer` 插槽与正文用分隔线隔开。
- `padded="false"` 关闭内边距，供 `DatePicker` 这类自带排版的组件使用。

## 变体

<div class="demo-row">
  <Card variant="elevated" title="Elevated" class="w-56">
    <p class="text-sm text-ds-muted">带阴影，适合悬浮在页面之上。</p>
  </Card>
  <Card variant="filled" title="Filled" class="w-56">
    <p class="text-sm text-ds-muted">浅色填充，视觉重量更低。</p>
  </Card>
  <Card variant="outlined" title="Outlined" class="w-56">
    <p class="text-sm text-ds-muted">只有描边，适合密集列表。</p>
  </Card>
</div>

```vue
<template>
  <Card variant="elevated" title="Elevated">…</Card>
  <Card variant="filled" title="Filled">…</Card>
  <Card variant="outlined" title="Outlined">…</Card>
</template>
```

## 标题与动作

<div class="demo-row">
  <Card title="共享文件夹" subtitle="邀请链接 7 天后过期" class="w-full max-w-md">
    <template #actions>
      <IconButton :icon="moreIcon" label="更多操作" />
    </template>
    <p class="text-sm text-ds-fg">任何拿到链接的人都可以查看这个文件夹。</p>
    <template #footer>
      <div class="flex justify-end gap-2">
        <Button variant="text" @click="dismissed = true">取消</Button>
        <Button @click="dismissed = false">创建链接</Button>
      </div>
    </template>
  </Card>
</div>

点击后的状态：{{ dismissed ? "已取消" : "未操作" }}

```vue
<template>
  <Card title="共享文件夹" subtitle="邀请链接 7 天后过期">
    <template #actions>
      <IconButton :icon="moreIcon" label="更多操作" />
    </template>
    任何拿到链接的人都可以查看这个文件夹。
    <template #footer>
      <Button variant="text">取消</Button>
      <Button>创建链接</Button>
    </template>
  </Card>
</template>
```

`actions` 是标题右侧的弹性行；`footer` 会自动加上分隔线与上边距。

## 嵌套

`Card` 与 `Container` 共用层级：卡片里的卡片自动更深一层，圆角与内边距随层级收缩。

<div class="demo-row">
  <Card title="外层" class="w-full max-w-md">
    <Container class="mt-3">
      <Card variant="outlined" title="内层">
        <p class="text-sm text-ds-muted">自动落在第 2 层。</p>
      </Card>
    </Container>
  </Card>
</div>

## API

| 属性       | 类型                                              | 默认值       | 说明                     |
| ---------- | ------------------------------------------------- | ------------ | ------------------------ |
| `variant`  | `"elevated" \| "filled" \| "outlined" \| "plain"` | `"elevated"` | 表面样式                 |
| `title`    | `string`                                          | —            | 标题                     |
| `subtitle` | `string`                                          | —            | 标题下方的说明           |
| `level`    | `1 \| 2 \| 3`                                     | 自动         | 手动指定层级             |
| `padded`   | `boolean`                                         | `true`       | 是否使用层级对应的内边距 |

插槽：`default`、`header`、`actions`、`footer`。
