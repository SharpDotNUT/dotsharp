<script setup lang="ts">
import { onMounted, ref } from "vue";
import { Button, useTheme } from "@sharpdotnut/dotsharp";

const { theme, resolvedTheme, setTheme } = useTheme();

const mounted = ref(false);
onMounted(() => {
  mounted.value = true;
});
</script>

# 主题

`@sharpdotnut/dotsharp` 通过 `useTheme()` 管理主题：模式可以是 `system`（默认，跟随系统）、`light` 或 `dark`。
组合式函数会把解析后的结果写到 `<html data-theme="light|dark">` 上，组件样式据此切换设计变量。

## 安装

```bash
pnpm add @sharpdotnut/dotsharp
```

## 引入样式

主题变量与组件样式都在同一个样式表里，应用入口引入一次即可：

```ts
import "@sharpdotnut/dotsharp/style.css";
```

## 使用

```ts
import { useTheme } from "@sharpdotnut/dotsharp";

const { theme, resolvedTheme, setTheme } = useTheme();

setTheme("dark"); // 'system' | 'light' | 'dark'
```

<div class="demo-row">
  <Button size="sm" @click="setTheme('system')">跟随系统</Button>
  <Button size="sm" @click="setTheme('light')">浅色</Button>
  <Button size="sm" @click="setTheme('dark')">深色</Button>
</div>

当前状态：模式 {{ mounted ? theme : 'system' }}，解析结果 {{ mounted ? resolvedTheme : 'light' }}。

## API

| 名称            | 类型                                            | 说明                                      |
| --------------- | ----------------------------------------------- | ----------------------------------------- |
| `theme`         | `ComputedRef<'system' \| 'light' \| 'dark'>`    | 当前模式，默认 `system`                   |
| `resolvedTheme` | `ComputedRef<'light' \| 'dark'>`                | 实际生效的主题，`system` 模式下取系统偏好 |
| `setTheme`      | `(mode: 'system' \| 'light' \| 'dark') => void` | 切换模式并立即写入 DOM 与本地存储         |

## 说明

- 默认模式为 `system`；系统偏好变化时，只有 `system` 模式会跟着变。
- 选择会持久化到 `localStorage` 的 `dotsharp-theme` 键，刷新后自动恢复。
- 组合式函数只写 `data-theme="light|dark"`，不写 `.dark` 类，因此不绑定任何特定文档框架。
- 服务端渲染时不会访问 `window`，也不会写 DOM；界面首帧主题请自行在页面 `head` 中提前设置，本站的做法见本站配置。
