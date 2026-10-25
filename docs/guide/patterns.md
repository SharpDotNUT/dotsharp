# 父子组件以及插槽统一范式

本库有两条贯穿全部组件的约定：

- 由「父组件 + 一组子项」构成的组件（`Tabs` / `Tab`、`NavigationBar` / `NavigationItem` 等）使用同一套
  选中值、子项标识与状态传递方式；
- 组件的每块内容都可以用属性或插槽描述：简单内容用属性，复杂内容用插槽，插槽优先。

已有父子组件实现：

| 父组件             | 子项                   | 选中值类型         |
| ------------------ | ---------------------- | ------------------ |
| `Tabs`             | `Tab`                  | `string \| number` |
| `Select`           | `Option`               | `string \| number` |
| `NavigationBar`    | `NavigationItem`       | `string \| number` |
| `NavigationRail`   | `NavigationRailItem`   | `string \| number` |
| `NavigationDrawer` | `NavigationDrawerItem` | `string \| number` |
| `SegmentedButtons` | `SegmentedButton`      | `string \| number` |
| `RadioGroup`       | `Radio`                | `string \| number` |

新增同类组件（如 `Steps` / `Step`）时沿用这套写法，不要另立规则。

## 属性与插槽：两种写法

同一个位置若同时提供属性和插槽，属性接收纯文本或图标数据，插槽接收任意内容，**插槽优先**。两者只写一处，
不要既传属性又在插槽里重复同样的内容。

```vue
<!-- 简单内容：属性 -->
<Tab label="航班" :icon="flight" value="flights" />
<Card title="本周概览" subtitle="10 月 20 日 – 10 月 26 日">…</Card>

<!-- 富内容：同名插槽 -->
<Tab value="custom">
  <span class="font-medium">航班</span>
  <Badge value="3" label="3 个更新" />
</Tab>
<Card>
  <template #title>本周<b>概览</b></template>
</Card>
```

| 组件                            | 属性                                     | 对应插槽                                      |
| ------------------------------- | ---------------------------------------- | --------------------------------------------- |
| `Tab` / `NavigationItem` 等子项 | `label`、`icon`                          | 默认插槽（文字区域）                          |
| `Card`                          | `title`、`subtitle`                      | `#title`、`#subtitle`、默认插槽（正文）       |
| `AppBar`                        | `title`、`subtitle`                      | 默认插槽、`#subtitle`、`#left`、`#right`      |
| `Dialog`                        | `title`、`icon`                          | `#icon`、默认插槽（正文）、`footer-*`         |
| `ListItem`                      | `label`、`description`、`icon`           | 默认插槽、`#leading`、`#trailing`             |
| `MenuItem`                      | `label`、`icon`                          | 默认插槽、`#leading`、`#trailing`、`#submenu` |
| `Checkbox` / `Chip` / `Fab`     | `label`                                  | 默认插槽                                      |
| `IconButton`                    | `icon`                                   | 默认插槽、`#badge`                            |
| `Button`                        | —                                        | 默认插槽（文字与图标）                        |
| `Input`                         | `leadingIcon`、`trailingIcon`            | `#leading`、`#trailing`                       |
| `Select` / `Option`             | `label`、`icon`                          | 默认插槽（选项内容）                          |
| `Tooltip`                       | `label`、`title`、`text`、`action-label` | 默认插槽（触发元素）、`#content`、`#action`   |
| `FormItem`                      | `label`、`description`                   | 默认插槽（字段控件）                          |

选择原则：

- 纯文本、单个图标：用属性。组件会处理截断、字号、间距与无障碍名称。
- 链接、徽标、多段文字、自定义控件：用插槽，排版由使用方负责。
- 图标优先用 `icon` 属性；需要不受组件排版限制的尺寸或换用别的图形时，才改用插槽放 `<Icon>`。
- 具体组件的插槽表与优先级说明见各组件文档。

## 选中值是一个模型

父组件用 `defineModel` 暴露选中值，消费方写 `v-model:value`。默认值是 `0`，因此未进行任何交互时首个
子项就是选中态。

```vue
<Tabs v-model:value="tab">
  <Tab label="概览" value="overview" />
  <Tab label="规格" value="specs" />
</Tabs>
```

点击已选中的子项不会重复写模型，也不会触发 `update:value`。

## 子项内容：label、icon 与插槽

子项用三种方式描述内容，可以组合：

- `label`：纯文本；
- `icon`：与 `Icon` 的 `icon` 同源，直接传图标数据，渲染在文字或插槽之前；
- 默认插槽：其它自定义内容，**优先于 `label`**——插槽与 `label` 同时存在时 `label` 不参与渲染。

```vue
<Tab label="航班" :icon="flight" value="flights" />
<Tab label="这行文字会被插槽覆盖" :icon="flight" value="custom">
  <span class="font-medium">插槽内容</span>
</Tab>
```

图标尺寸由各组件的排版决定（例如 `Tab` 用 `1.25em`，`NavigationItem` 用 `1.5em`），需要不受限制的图标时
改用插槽放 `<Icon>`。

`Select` 多一条约束：收起态的触发器只读选中项的 `label`，因此用插槽描述 `Option` 时 `label` 仍然必须提供，
否则触发器没有文字可显示（回退到 `placeholder`）。

## 子项标识：value 或索引

子项用 `value` 声明标识；省略时使用自己的**数字索引**（`0` 起）。索引由父组件按最终渲染顺序注入：
展开 `v-for` 产生的 `Fragment` 后逐个 `cloneVNode(node, { index })`，因此 `v-if` 增删、`v-for` 循环都会
重新编号。

```vue
<Tabs v-model:value="index">
  <Tab label="第一步" />
  <Tab label="第二步" />
  <Tab label="第三步" />
</Tabs>
```

索引是内部细节，使用方无需关心。需要跨版本稳定、或与路由 / 数据主键对应的标识时显式传 `value`。

## 状态通过 context 传递

父组件把选中值与布局标记放进一个带类型的 `InjectionKey` context，子组件 `inject` 并在没有父组件时
回退为 `null`——子项可以独立渲染，不会因为缺少 context 而报错。

```ts
// parent
const model = defineModel<TabsValue>("value", { default: 0 });
provide(tabsContextKey, { model, variant: toRef(props, "variant") });

// child
const tabs = inject(tabsContextKey, null);
const resolvedValue = computed<TabsValue>(() => props.value ?? props.index);
```

## 插槽在渲染期读取

父组件不在 `setup()` 或模块作用域的辅助函数里调用 `slots.default()`，那样会丢失依赖追踪并产生警告。
需要展开插槽时，把读取放进只在模板中求值的 `computed`，让依赖在渲染期间正常收集。

## 类型从包入口导出

选中值类型（`TabsValue`、`NavigationDrawerValue` 等）从 `src/index.ts` 导出，消费方不必深入组件目录。
