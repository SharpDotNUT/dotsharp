<script setup lang="ts">
import { Badge } from "@sharpdotnut/dotsharp";
</script>

# Badge 徽标

未读计数与状态点：省略 `value` 时是一个 6px 的圆点，给出 `value` 时是带数字的胶囊。

- 小圆点：只表达“有新内容”，不显示数字。
- 大徽标：`16px` 高、圆角胶囊，数字宽度自适应；`max` 控制折叠上限（默认 99，超出显示 `99+`）。
- 颜色固定为 `--ds-error` / `--ds-on-error`，与主题的明暗模式同步，不随源色变化而失去警示含义。

## 计数

<div class="demo-row">
  <Badge :value="3" label="3 条未读" />
  <Badge :value="42" label="42 条未读" />
  <Badge :value="120" label="120 条未读" />
  <Badge :value="120" :max="999" label="120 条未读" />
</div>

```vue
<Badge :value="3" label="3 条未读" />
<Badge :value="120" label="120 条未读" />
<Badge :value="120" :max="999" label="120 条未读" />
```

`value` 是数字且超过 `max` 时折叠为 `${max}+`；字符串原样显示（例如 `"NEW"`），不参与换算。

## 小圆点

不传 `value` 就是纯状态点。它本身没有文字，必须用 `label` 说明含义。

<div class="demo-row">
  <span class="inline-flex items-center gap-2 font-ds text-sm text-ds-fg">
    <Badge label="有新通知" />
    有新通知
  </span>
  <span class="inline-flex items-center gap-2 font-ds text-sm text-ds-fg">
    <Badge label="离线" class="!bg-ds-outline" />
    离线
  </span>
</div>

```vue
<Badge label="有新通知" />
```

徽标默认是 `inline-flex`。需要贴到图标或按钮上时，用 `Icon` / `IconButton` 的 `#badge` 插槽，
组件会负责右上角的相对定位。

## API

| 属性  | 类型               | 默认值 | 说明                                       |
| ----- | ------------------ | ------ | ------------------------------------------ |
| value | `string \| number` | —      | 计数或短文本；省略或空字符串时显示小圆点   |
| max   | `number`           | `99`   | 数字上限，超出显示 `${max}+`               |
| label | `string`           | —      | 无障碍名称；小圆点没有可见文字时应始终提供 |

- 根元素是 `span`，带 `role="status"`（计数变化会被读屏播报）与 `aria-label`。
- 其余属性与事件透传到根元素；可以覆盖颜色/尺寸，例如 `class="!bg-ds-success"`。

### 可访问性

可见数字就是徽标的文本内容；只有小圆点时读屏只能拿到 `label`，所以不要省略它。把徽标与它描述的对象放在
同一段可读文本中（或给徽标自己的 `label`），避免数字孤零零地出现。
