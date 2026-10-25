<script setup lang="ts">
import { ref } from "vue";
import { Button, Icon, UploadArea, Uploader } from "@sharpdotnut/dotsharp";
import uploadFile from "@iconify-icons/material-symbols/upload-file";

const picked = ref<string[]>([]);
const dropped = ref<string[]>([]);
const rejected = ref<string[]>([]);
const custom = ref<string[]>([]);
const note = ref("");

function names(files: File[]): string[] {
  return files.map((file) => file.name);
}
</script>

# Uploader 上传

`Uploader` 与 `UploadArea` 只负责**选择文件**：打开原生选择框、接收拖拽，把 `File` 对象交给调用方。
它们不发请求、不管理进度、也不保存文件——上传由你自己完成。

| 组件         | 形态                                                   |
| ------------ | ------------------------------------------------------ |
| `Uploader`   | 只提供行为和一个插槽：点击插槽里的内容就打开文件选择框 |
| `UploadArea` | 一整块可拖拽、可点击的上传区域，默认内容可以整体替换   |

两者都接受原生 `accept` 与 `multiple`，选中结果通过 `select` 事件给出。

## 点击上传

把可聚焦的控件（通常是 [`Button`](/components/button)）放进 `Uploader` 的插槽。点击插槽里的任意位置都会
打开文件选择框；`Uploader` 本身不渲染任何可见样式。

<div class="demo-row">
  <Uploader accept="image/*" multiple @select="picked = names($event)">
    <Button>选择图片</Button>
  </Uploader>
</div>

当前选择：{{ picked.length ? picked.join("、") : "（还没有选择）" }}

```vue
<script setup lang="ts">
import { ref } from "vue";
import { Button, Uploader } from "@sharpdotnut/dotsharp";

const picked = ref<string[]>([]);

function names(files: File[]): string[] {
  return files.map((file) => file.name);
}
</script>

<template>
  <Uploader accept="image/*" multiple @select="picked = names($event)">
    <Button>选择图片</Button>
  </Uploader>
</template>
```

`Uploader` 的根是一个没有布局限制的 `div`（`inline-block`），`class` / `style` 照常透传。它不额外添加
`role` 或 `tabindex`：无障碍语义与键盘操作由插槽里的控件提供，所以不要只放一段不可聚焦的文字。

插槽可以拿到 `open` 与 `disabled`，需要自己触发时用它们；组件实例也暴露了 `open()` 方法：

```vue
<Uploader ref="uploader" accept=".pdf" @select="onSelect">
  <Button variant="outlined">选择 PDF</Button>
</Uploader>
```

```ts
const uploader = ref<InstanceType<typeof Uploader> | null>(null);
uploader.value?.open();
```

`disabled` 会拦截根节点上的点击（包括插槽控件的点击冒泡），并给根节点加上 `aria-disabled="true"`；
插槽里的控件应自行设置 `disabled`，避免看起来仍然可用、也避免它自己的键盘操作仍然生效。

## 上传区域

`UploadArea` 默认渲染一块最小高度 128px 的虚线区域：拖拽时描边与底色变化，点击或按 Enter / 空格打开选择框。

<div class="demo-row">
  <UploadArea
    accept="image/*"
    multiple
    label="拖拽图片到此处，或点击选择"
    description="支持 PNG / JPG，可一次拖入多张"
    class="w-full max-w-md"
    @select="dropped = names($event)"
  />
</div>

当前选择：{{ dropped.length ? dropped.join("、") : "（还没有选择）" }}

```vue
<UploadArea
  accept="image/*"
  multiple
  label="拖拽图片到此处，或点击选择"
  description="支持 PNG / JPG，可一次拖入多张"
  @select="onSelect"
/>
```

`label` 是默认内容的主文案，同时作为整个区域的无障碍名称；`description` 是第二行说明，两行都可以用插槽
完全替换。

### 拖拽也会按 accept 筛选

原生 `<input type="file">` 会自己过滤 `accept`，但拖拽不会。`UploadArea` 在 `drop` 时按同一套规则
（扩展名、精确 MIME、`image/*` 这类通配）筛选，把不符合的文件通过 `invalid` 事件交给你提示：

<div class="demo-row">
  <UploadArea
    accept="image/*"
    multiple
    label="只接受图片"
    description="试试拖入一个文本文件"
    class="w-full max-w-md"
    @select="dropped = names($event)"
    @invalid="rejected = names($event)"
  />
</div>

最近一次被拒绝：{{ rejected.length ? rejected.join("、") : "（没有）" }}

```vue
<UploadArea
  accept="image/*"
  multiple
  label="只接受图片"
  description="试试拖入一个文本文件"
  @select="onSelect"
  @invalid="onInvalid"
/>
```

- 不符合 `accept` 的文件只进入 `invalid`，不会进入 `select`；
- `multiple` 为 `false` 时，一次拖入多个符合的文件只取第一个，其余静默忽略（与单文件 input 一致）；
- 拖拽与点击共用同一套 `accept` / `multiple`，不会出现两条路径行为不同。

## 自定义区域内容

默认插槽替换整块区域的内容，并拿到 `{ open, dragging }`：`dragging` 在文件悬停到区域上方时为 `true`。

<div class="demo-row">
  <UploadArea
    multiple
    accept=".txt,.md"
    label="上传文本文件"
    class="w-full max-w-md"
    @select="custom = names($event)"
  >
    <template #default="{ dragging }">
      <Icon
        :icon="uploadFile"
        size="2em"
        :class="dragging ? 'text-ds-primary-strong' : 'text-ds-muted'"
      />
      <div class="text-sm leading-5 font-medium text-ds-fg">
        {{ dragging ? "松开即可添加" : "把文本文件拖到这里" }}
      </div>
      <div class="text-xs leading-4 text-ds-muted">或点击选择 .txt / .md</div>
    </template>
  </UploadArea>
</div>

自定义内容：{{ custom.length ? custom.join("、") : "（还没有选择）" }}

```vue
<UploadArea multiple accept=".txt,.md" label="上传文本文件" @select="onSelect">
  <template #default="{ dragging }">
    <Icon :icon="uploadFile" size="2em" />
    <div>{{ dragging ? "松开即可添加" : "把文本文件拖到这里" }}</div>
    <div>或点击选择 .txt / .md</div>
  </template>
</UploadArea>
```

插槽内容始终在可点击区域里，点击其中的文字、图标同样会打开选择框。需要阻止某块内容触发选择时，在它上面
加 `@click.stop`。插槽只放展示内容即可，不要再放第二个上传控件。

## 文本输入 / 粘贴

传 `text` 后，区域下方多出一个文本框：用户可以像上传文本文件一样，直接把内容输入或粘贴进来。文本内容
用 `v-model:value` 双向绑定，与 `select` 给出的文件互不影响。

<div class="demo-row">
  <UploadArea
    text
    v-model:value="note"
    accept=".txt,.md"
    label="拖入文本文件，或点击选择"
    description="也可以在下方直接输入 / 粘贴"
    class="w-full max-w-md"
    @select="dropped = names($event)"
  />
</div>

已输入 {{ note.length }} 个字符<span v-if="dropped.length">，已选择 {{ dropped.join("、") }}</span>

```vue
<script setup lang="ts">
import { ref } from "vue";

const note = ref("");
</script>

<template>
  <UploadArea
    text
    v-model:value="note"
    accept=".txt,.md"
    label="拖入文本文件，或点击选择"
    description="也可以在下方直接输入 / 粘贴"
    @select="onSelect"
  />
</template>
```

`textRows` 控制文本框初始行数（默认 3），`textPlaceholder` 同时作为文本框的占位文字与无障碍名称。
文本框复用库里的 [`Input`](/components/input)（`textarea` 变体），描边、聚焦、禁用与表单里完全一致；
输入与粘贴仍由原生 `<textarea>` 提供，`disabled` 时一起禁用。

## 禁用

<div class="demo-row">
  <Uploader disabled>
    <Button disabled variant="outlined">选择文件</Button>
  </Uploader>
  <UploadArea disabled label="上传已关闭" description="此处不接受文件" class="w-full max-w-xs" />
</div>

```vue
<template>
  <Uploader disabled>
    <Button disabled variant="outlined">选择文件</Button>
  </Uploader>
  <UploadArea disabled label="上传已关闭" description="此处不接受文件" />
</template>
```

禁用后区域不再响应点击、Enter / 空格、拖拽与 drop，也不会打开选择框；样式降低透明度并换成禁止光标。

## API

### Uploader

| 属性       | 类型      | 默认值  | 说明                                     |
| ---------- | --------- | ------- | ---------------------------------------- |
| `accept`   | `string`  | —       | 原生 `accept` 规则，如 `image/*`、`.pdf` |
| `multiple` | `boolean` | `false` | 是否允许多选                             |
| `disabled` | `boolean` | `false` | 禁用点击与文件选择                       |

| 事件     | 参数     | 说明                 |
| -------- | -------- | -------------------- |
| `select` | `File[]` | 用户确认后选中的文件 |

| 插槽      | 内容                                         |
| --------- | -------------------------------------------- |
| `default` | 触发内容；插槽 props 为 `{ open, disabled }` |

| 暴露     | 说明                 |
| -------- | -------------------- |
| `open()` | 程序化打开文件选择框 |

### UploadArea

| 属性              | 类型      | 默认值                                           | 说明                                 |
| ----------------- | --------- | ------------------------------------------------ | ------------------------------------ |
| `accept`          | `string`  | —                                                | 原生 `accept` 规则；拖拽同样按此筛选 |
| `multiple`        | `boolean` | `false`                                          | 是否允许多选                         |
| `disabled`        | `boolean` | `false`                                          | 禁用区域                             |
| `label`           | `string`  | `"Drag and drop files here, or click to browse"` | 默认主文案，也是区域的无障碍名称     |
| `description`     | `string`  | —                                                | 默认内容的第二行说明                 |
| `text`            | `boolean` | `false`                                          | 追加文本输入 / 粘贴框                |
| `textRows`        | `number`  | `3`                                              | 文本框初始行数                       |
| `textPlaceholder` | `string`  | `"Or type or paste text"`                        | 文本框占位文字，也是它的无障碍名称   |
| `v-model:value`   | `string`  | `""`                                             | 文本内容（`text` 为 `true` 时使用）  |

| 事件      | 参数     | 说明                                    |
| --------- | -------- | --------------------------------------- |
| `select`  | `File[]` | 选中（或拖入）的文件                    |
| `invalid` | `File[]` | 拖入但不符合 `accept`、因而未采用的文件 |

| 插槽      | 内容                                                             |
| --------- | ---------------------------------------------------------------- |
| `default` | 区域内容，替换默认图标与文案；插槽 props 为 `{ open, dragging }` |

| 暴露     | 说明                 |
| -------- | -------------------- |
| `open()` | 程序化打开文件选择框 |

### 结构

- `UploadArea` 根是 `flex flex-col gap-2 font-ds` 容器，拖拽事件挂在根上，因此拖到文本框或间隙也不会被
  浏览器当成「打开文件」。区域本身是 `role="button"` + `tabindex="0"`，键盘 Enter / 空格与点击等价。
- 区域类名 `ds-upload-area__zone`：`min-h-32`、2px 虚线描边、`rounded-ds`、`bg-ds-surface`；悬停时描边转
  主色，拖拽时换成 `bg-ds-tonal`。禁用态降低透明度并禁用指针。
- 隐藏的 `<input type="file">` 是普通 DOM：`accept` / `multiple` / `disabled` 原样传给 input；
  选择完成后 input 的 `value` 会被清空，因此同一个文件可以连续选择两次。
- 文本模式直接渲染 `Input` 的 `textarea` 变体，`textRows` 透传为 `rows`、`textPlaceholder` 透传为占位文字与
  无障碍名称，因此外观、聚焦环与禁用态和表单里的 `Input` 完全一致。
