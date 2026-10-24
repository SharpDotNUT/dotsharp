<script setup lang="ts">
import { ref } from "vue";
import { Input } from "@sharpdotnut/dotsharp";

const name = ref("");
const email = ref("");
const password = ref("");
</script>

# Input 输入框

通过 `v-model` 双向绑定的文本输入框。

## 基础用法

<div class="demo-row">
  <Input v-model="name" placeholder="请输入名字" />
</div>

当前值：{{ name || '（空）' }}

```vue
<script setup lang="ts">
import { ref } from "vue";
import { Input } from "@sharpdotnut/dotsharp";

const name = ref("");
</script>

<template>
  <Input v-model="name" placeholder="请输入名字" />
</template>
```

## 不同类型

通过 `type` 传入原生 `input` 的类型，例如 `email`、`password`。

<div class="demo-row">
  <Input v-model="email" type="email" placeholder="邮箱地址" />
  <Input v-model="password" type="password" placeholder="密码" />
</div>

```vue
<script setup lang="ts">
import { ref } from "vue";
import { Input } from "@sharpdotnut/dotsharp";

const email = ref("");
const password = ref("");
</script>

<template>
  <Input v-model="email" type="email" placeholder="邮箱地址" />
  <Input v-model="password" type="password" placeholder="密码" />
</template>
```

## 禁用与只读

`disabled` 禁止交互，`readonly` 允许聚焦与选中但不可编辑。

<div class="demo-row">
  <Input disabled placeholder="禁用状态" />
  <Input readonly model-value="只读内容" />
</div>

```vue
<template>
  <Input disabled placeholder="禁用状态" />
  <Input readonly model-value="只读内容" />
</template>
```
