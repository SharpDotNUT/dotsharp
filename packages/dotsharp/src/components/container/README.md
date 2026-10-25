<script setup lang="ts">
import { Card, Container } from "@sharpdotnut/dotsharp";
</script>

# Container 容器

`Container` 是纯粹的布局容器：给出层级化的表面、圆角与内边距，不处理语义或交互。

- **最多三层**。顶层容器（没有父容器）是 1 层；子容器自动比父容器深一层，超过 3 层时停在 3 层。
- 用 `level` 手动指定 1–3，覆盖自动推导——适合把卡片放进已有布局、但不想让它看起来更深一层的情况。
- `as` 换根元素标签（`section`、`aside` 等），`padded="false"` 关掉层级内边距，交给内容自己排版。
- 容器通过 `provide` 把自己的层级交给子容器，所以层级判断不依赖 DOM 结构。

`Card` 与 `DatePicker` 复用同一套层级上下文；`Container` 本身也可以直接包住任意内容。

## 自动层级

嵌套三层即可看到圆角与表面逐层收窄，再往里嵌套会停在第 3 层：

<div class="demo-row">
  <Container class="w-full max-w-md">
    <p class="text-sm text-ds-muted">第 1 层</p>
    <Container class="mt-3">
      <p class="text-sm text-ds-muted">第 2 层</p>
      <Container class="mt-3">
        <p class="text-sm text-ds-muted">第 3 层</p>
        <Container class="mt-3">
          <p class="text-sm text-ds-muted">第 4 层回落到第 3 层</p>
        </Container>
      </Container>
    </Container>
  </Container>
</div>

```vue
<script setup lang="ts">
import { Container } from "@sharpdotnut/dotsharp";
</script>

<template>
  <Container>
    <p>第 1 层</p>
    <Container>
      <p>第 2 层</p>
      <Container>
        <p>第 3 层</p>
        <Container>
          <p>第 4 层回落到第 3 层</p>
        </Container>
      </Container>
    </Container>
  </Container>
</template>
```

## 手动层级

`level` 会覆盖自动推导，但不会影响后代：子容器仍然从你指定的层级继续加深。

<div class="demo-row">
  <Container level="3" class="w-full max-w-sm">
    <p class="text-sm text-ds-muted">手动指定为第 3 层，与嵌套深度无关</p>
  </Container>
</div>

```vue
<template>
  <Container level="3">手动指定为第 3 层，与嵌套深度无关</Container>
</template>
```

## 与 Card 组合

`Card` 自带表面样式，放在 `Container` 里时同样自动加深一层；`Container` 负责分组，`Card` 负责可辨识的内容块。

<div class="demo-row">
  <Container class="w-full max-w-md">
    <Card title="账户" subtitle="本周用量">
      <p class="text-sm text-ds-fg">已使用 42% 的配额。</p>
    </Card>
  </Container>
</div>

```vue
<template>
  <Container>
    <Card title="账户" subtitle="本周用量">已使用 42% 的配额。</Card>
  </Container>
</template>
```

## API

| 属性     | 类型          | 默认值  | 说明                     |
| -------- | ------------- | ------- | ------------------------ |
| `level`  | `1 \| 2 \| 3` | 自动    | 手动指定层级             |
| `as`     | `string`      | `"div"` | 根元素标签               |
| `padded` | `boolean`     | `true`  | 是否使用层级对应的内边距 |
