<script setup lang="ts">
import { ref } from "vue";
import { Button, Snackbar, showSnackbar } from "@sharpdotnut/dotsharp";

const basic = ref(false);
const withAction = ref(false);
const persistent = ref(false);
const rich = ref(false);

const lastAction = ref("—");
const undone = ref(0);

function archive(): void {
  showSnackbar({
    text: "邮件已归档",
    action: { label: "撤销", onAction: () => (undone.value += 1) },
  });
}

function queueThree(): void {
  ["第一条", "第二条", "第三条"].forEach((text) =>
    showSnackbar({ text: `排队中的${text}`, duration: 1500 }),
  );
}
</script>

# Snackbar 消息条

在不打断当前流程的前提下给出一条简短反馈：保存成功、邮件已归档、网络异常。它浮在页面底部居中，
自动消失，或者让用户点「撤销」这类操作。

- 反色表面：浅色主题里是深色条、深色主题里反过来（`bg-ds-fg` + `text-ds-bg`），保证消息永远从背景里跳出来。
- 一屏只有一条；后来的排队，上一条离场动画结束才轮到下一条。
- 两种用法：模板里声明 `Snackbar` + `v-model:open`，或在任何地方调用 `showSnackbar()`，不需要组件树。

## 声明式：最小用法

`v-model:open` 是唯一的显示状态来源，`duration`（默认 5000ms）到了组件会把 `open` 置回 `false`。
给 `0` 就变成常驻，只能由用户关闭。

<div class="demo-row">
  <Button @click="basic = true">保存</Button>
  <Snackbar v-model:open="basic" text="更改已保存" />
</div>

```vue
<script setup lang="ts">
import { ref } from "vue";
import { Button, Snackbar } from "@sharpdotnut/dotsharp";

const open = ref(false);
</script>

<template>
  <Button @click="open = true">保存</Button>

  <Snackbar v-model:open="open" text="更改已保存" />
</template>
```

## 带操作按钮

`action` 是按钮文案，点击后触发 `action` 事件并关闭消息。操作是「撤销」「重试」这类可以立刻执行的补救动作，
不要在这里放次要的「了解更多」——那是对话框或链接的职责。

<div class="demo-row">
  <Button @click="withAction = true">归档</Button>
  <Snackbar
    v-model:open="withAction"
    text="邮件已归档"
    action="撤销"
    @action="lastAction = '撤销'"
  />
</div>

最近一次操作：{{ lastAction }}

```vue
<Snackbar v-model:open="open" text="邮件已归档" action="撤销" @action="undo" />
```

需要给操作加图标或自定义内容时用 `action` 插槽，它优先于 `action` 属性。

## 常驻与关闭按钮

`duration="0"` 关掉自动关闭；再打开 `dismissible` 显示右上角的关闭按钮（无障碍名称由 `close-label` 提供，
默认 `Close`）。用于「有未保存的修改」这类必须让用户看见并处理的状态。

<div class="demo-row">
  <Button @click="persistent = true">显示常驻消息</Button>
  <Snackbar
    v-model:open="persistent"
    text="有未保存的修改，离开前请先保存"
    :duration="0"
    dismissible
  />
</div>

```vue
<Snackbar v-model:open="open" text="有未保存的修改" :duration="0" dismissible />
```

## 函数式调用

`showSnackbar(options)` 在任何地方都能用——事件回调、请求拦截器、路由守卫——它在首次调用时才把宿主挂到
`body`，引入模块本身没有副作用。返回的句柄带 `close()`，可以提前关掉这一条。

<div class="demo-row">
  <Button @click="archive">归档邮件</Button>
  <Button variant="outlined" @click="queueThree">连续推送三条</Button>
</div>

撤销次数：{{ undone }}　撤销只对被点的那一条生效。

```ts
import { showSnackbar } from "@sharpdotnut/dotsharp";

showSnackbar({
  text: "邮件已归档",
  action: { label: "撤销", onAction: () => restore() },
});

// 句柄可以提前关闭；还在排队时直接从队列移除。
const handle = showSnackbar({ text: "正在上传…", duration: 0, dismissible: true });
handle.close();

// 路由切换这类时机一键清场。
closeAllSnackbars();
```

连续推送三条时只有第一条可见，后两条排队，每条展示 1500ms。

## 多行与富内容

默认插槽优先于 `text`，可以塞进换行或强调文本；消息条本身不限行数，但超过两行就该考虑改用对话框。

<div class="demo-row">
  <Button @click="rich = true">显示多行消息</Button>
  <Snackbar v-model:open="rich" :duration="0" dismissible>
    已从「草稿箱」删除 3 个会话
    <span class="text-ds-bg/70">（可在 30 天内从回收站恢复）</span>
  </Snackbar>
</div>

```vue
<Snackbar v-model:open="open">
  已从「草稿箱」删除 3 个会话
  <span class="text-ds-bg/70">（可在 30 天内从回收站恢复）</span>
</Snackbar>
```

## API

### 属性

| 属性         | 类型      | 默认值    | 说明                                 |
| ------------ | --------- | --------- | ------------------------------------ |
| v-model:open | `boolean` | `false`   | 是否显示；超时后组件自己置回 `false` |
| text         | `string`  | —         | 正文；默认插槽优先                   |
| action       | `string`  | —         | 操作按钮文案；`action` 插槽优先      |
| duration     | `number`  | `5000`    | 自动关闭的毫秒数；`0` 表示常驻       |
| dismissible  | `boolean` | `false`   | 是否显示关闭按钮                     |
| closeLabel   | `string`  | `"Close"` | 关闭按钮的无障碍名称                 |

### 事件与插槽

| 名称      | 说明                                 |
| --------- | ------------------------------------ |
| `action`  | 操作按钮被点击；随后消息自动关闭     |
| `default` | 正文，优先于 `text`                  |
| `action`  | 操作按钮的内容，优先于 `action` 文案 |

### showSnackbar

| 选项        | 类型             | 默认值    | 说明                   |
| ----------- | ---------------- | --------- | ---------------------- |
| text        | `string`         | —         | 正文（必填）           |
| action      | `SnackbarAction` | —         | `{ label, onAction? }` |
| duration    | `number`         | `5000`    | `0` 表示常驻           |
| dismissible | `boolean`        | `false`   | 是否显示关闭按钮       |
| closeLabel  | `string`         | `"Close"` | 关闭按钮的无障碍名称   |

返回 `{ id, close }`；另外导出 `closeAllSnackbars()` 清空当前消息与队列。

### 可访问性

- 消息条根元素是 `role="status"` + `aria-atomic="true"`，出现时读屏会礼貌播报整条内容。
- 关闭按钮是纯图标，必须有 `closeLabel`；操作按钮是普通按钮，键盘可聚焦，焦点环使用反色前景。
- 消息条不会抢焦点，也不阻断页面交互——这正是它和对话框的分界。
- 常驻消息（`duration="0"`）要把用户能做的动作一起给出，否则读屏用户与键盘用户会被一条关不掉的消息困住。
