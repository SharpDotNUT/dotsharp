# 层级 Elevation

层级用阴影表达元素与页面之间的距离。库把 0–5 六级阴影定义为固定令牌 `--ds-elevation-0` … `--ds-elevation-5`，
再通过 `@theme inline` 映射成 `shadow-ds-0` … `shadow-ds-5`。组件只使用这些工具类，不手写阴影字面值。

| 层级 | 工具类          | 典型用途                                        |
| ---- | --------------- | ----------------------------------------------- |
| 0    | `shadow-ds-0`   | 无阴影                                          |
| 1    | `shadow-ds-1`   | elevated 按钮、滑块数值气泡                     |
| 2    | `shadow-ds-2`   | elevated 卡片、菜单 / 选择器面板、提示气泡、FAB |
| 3    | `shadow-ds-3`   | 对话框、模态抽屉 / 侧栏、Snackbar、悬浮的 FAB   |
| 4–5  | `shadow-ds-4/5` | 预留给更高的叠层，组件暂未使用                  |

## 使用

在自己的 Tailwind 里直接写同名工具类：

```vue
<div class="rounded-ds-lg bg-ds-surface shadow-ds-2">层级 2 的容器</div>
```

`dist/style.css` 按需生成，只包含库内实际引用的类。需要预留更高层级时，写 `box-shadow: var(--ds-elevation-4)`，
或在使用方自己的 Tailwind 配置里生成同名工具类。

## 明暗主题

层级不随源色生成，明暗两套共用同一组值。暗色模式下靠提高表面色明度区分叠层，而不是继续加深阴影，
因此同一层级在两种主题下观感一致。

需要整体调浅或调深时，在自有样式里覆写变量即可，工具类引用的始终是变量本身：

```css
:root {
  --ds-elevation-2: 0 2px 6px rgb(0 0 0 / 0.12);
}
```

## 与主题的关系

源色只决定颜色令牌，层级只决定阴影；两者互不影响。主题的其余部分见[主题](/guide/theme)。
