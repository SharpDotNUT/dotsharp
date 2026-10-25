<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { Button, useTheme } from "@sharpdotnut/dotsharp";

const { theme, resolvedTheme, sourceColor, setTheme, setSourceColor } = useTheme();

const mounted = ref(false);
onMounted(() => {
  mounted.value = true;
});

// SSR and the first hydration render must not read `localStorage`.
const color = computed(() => (mounted.value ? sourceColor.value : "#a855f7"));

function onColorInput(event: Event): void {
  setSourceColor((event.target as HTMLInputElement).value);
}
</script>

# 主题

`@sharpdotnut/dotsharp` 通过 `useTheme()` 管理主题：模式可以是 `system`（默认，跟随系统）、`light` 或 `dark`。
组合式函数会把解析后的结果写到 `<html data-theme="light|dark">` 上，组件样式据此切换设计变量。

## 一个颜色，一整套配色

整套配色只由一个源色生成：

1. 源色在 HCT 色空间里读出色相、彩度和明度；
2. 生成 primary / secondary / neutral / neutral-variant / error 五条 tonal palette（色相固定、彩度按色域收窄、
   明度从 0 到 100 排列）；
3. 每个 `--ds-*` 令牌从中取一个固定 tone，明暗两套各自一套映射。

因此换源色时色相关系、层级和对比度都保持一致，不需要手工调每个令牌：

```ts
import { useTheme } from "@sharpdotnut/dotsharp";

const { sourceColor, setSourceColor } = useTheme();

setSourceColor("#0e9f8f"); // '#rrggbb'、'rrggbb'、'#rgb' 均可
```

<div class="demo-row">
  <input
    type="color"
    :value="color"
    aria-label="源色"
    class="h-9 w-14 cursor-pointer rounded-ds-sm border border-ds-line bg-transparent p-1"
    @input="onColorInput"
  />
  <Button size="sm" variant="text" @click="setSourceColor('#a855f7')">恢复默认</Button>
</div>

当前源色：{{ color }}。选择会持久化到 `localStorage`，刷新后保留。

## 样式与变量

安装与样式引入见[快速开始](/guide/getting-started)。与主题相关的是：`style.css` 里定义 `--ds-*` 变量，
再由 Tailwind 的 `@theme inline` 映射成 `bg-ds-primary`、`text-ds-fg` 这类工具类——工具类引用的是变量本身，
所以切换 `data-theme` 或换源色只改变量值，组件类名保持不变。

样式表内置的是默认源色（`#a855f7`）生成的明暗两套值，未调用 `setSourceColor()` 或禁用 JavaScript 时同样正确
显示。调用 `setSourceColor()` 后，生成结果以行内自定义属性写到 `<html>` 上（恢复默认源色时移除这些行内值），
因此默认主题仍可在自己的样式表里覆盖 `--ds-*`；持久化的自定义源色要等脚本执行后才生效，首帧仍是默认配色。

- 使用方无需安装 Tailwind，也无需配置 `@source` 扫描 `node_modules`。
- 样式表不含 Tailwind preflight，不会重置应用自身的页面样式。
- 颜色令牌来自 `@material/material-color-utilities` 的 HCT / tonal palette 实现（随包安装，无需额外配置）。

## 层级与涟漪

阴影层级与点按涟漪是两套独立于配色的公共能力：层级用 `shadow-ds-*` 表达容器之间的距离，涟漪用
`v-ripple` 提供点按反馈。分别见[层级](/guide/elevation)与[涟漪](/guide/ripple)。

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

| 名称             | 类型                                            | 说明                                                         |
| ---------------- | ----------------------------------------------- | ------------------------------------------------------------ |
| `theme`          | `ComputedRef<'system' \| 'light' \| 'dark'>`    | 当前模式，默认 `system`                                      |
| `resolvedTheme`  | `ComputedRef<'light' \| 'dark'>`                | 实际生效的主题，`system` 模式下取系统偏好                    |
| `sourceColor`    | `ComputedRef<string>`                           | 当前源色，形如 `#a855f7`                                     |
| `setTheme`       | `(mode: 'system' \| 'light' \| 'dark') => void` | 切换模式并立即写入 DOM 与本地存储                            |
| `setSourceColor` | `(color: string) => void`                       | 由单个颜色重建全部令牌并立即写入 DOM；非法颜色抛 `TypeError` |

## 说明

- 默认模式为 `system`；系统偏好变化时，只有 `system` 模式会跟着变。
- 模式持久化到 `localStorage` 的 `dotsharp-theme` 键，源色持久化到 `dotsharp-source-color` 键。
- 组合式函数只写 `data-theme="light|dark"` 与 `--ds-*` 行内变量，不写 `.dark` 类，因此不绑定任何特定文档框架。
- 服务端渲染时不会访问 `window`，也不会写 DOM；界面首帧主题请自行在页面 `head` 中提前设置，本站的做法见本站配置。
