<script setup lang="ts">
import { computed, ref } from "vue";
import uploadFileIcon from "@iconify-icons/material-symbols/upload-file";
import Icon from "../icon/Icon.vue";
import Input from "../input/Input.vue";
import { matchesAccept, useFilePicker } from "./shared";

defineOptions({ inheritAttrs: false });

interface UploadAreaProps {
  /** 原生 `accept` 规则；拖拽的文件同样按它筛选。 */
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
  /** 默认内容的主文案，同时作为整个区域的无障碍名称。 */
  label?: string;
  /** 默认内容的第二行说明。 */
  description?: string;
  /** 在区域下方额外提供一个文本框，可直接输入或粘贴文本内容。 */
  text?: boolean;
  textRows?: number;
  textPlaceholder?: string;
}

const props = withDefaults(defineProps<UploadAreaProps>(), {
  accept: undefined,
  multiple: false,
  disabled: false,
  label: "Drag and drop files here, or click to browse",
  description: undefined,
  text: false,
  textRows: 3,
  textPlaceholder: "Or type or paste text",
});

/** 文本模式的内容；没有绑定时组件内部仍然可用。 */
const value = defineModel<string>("value", { default: "" });

const emit = defineEmits<{ select: [files: File[]]; invalid: [files: File[]] }>();

const { inputRef, open, onChange } = useFilePicker({
  disabled: () => props.disabled,
  onSelect: (files) => emit("select", files),
});

defineExpose({ open });

const dragging = ref(false);
/** `dragenter` / `dragleave` 会在子元素上成对触发，用计数判断是否真正离开区域。 */
let dragDepth = 0;

function isFileDrag(event: DragEvent): boolean {
  return Array.from(event.dataTransfer?.types ?? []).includes("Files");
}

function resetDrag(): void {
  dragDepth = 0;
  dragging.value = false;
}

function onDragEnter(event: DragEvent): void {
  if (props.disabled || !isFileDrag(event)) return;
  event.preventDefault();
  dragDepth++;
  dragging.value = true;
}

function onDragOver(event: DragEvent): void {
  if (!isFileDrag(event)) return;
  // 即使禁用也要接住 drop，否则浏览器会直接把文件当成页面打开。
  event.preventDefault();
}

function onDragLeave(event: DragEvent): void {
  if (!dragging.value) return;
  event.preventDefault();
  dragDepth--;
  if (dragDepth <= 0) resetDrag();
}

function onDrop(event: DragEvent): void {
  if (!isFileDrag(event)) return;
  event.preventDefault();
  resetDrag();
  if (props.disabled) return;

  const files = Array.from(event.dataTransfer?.files ?? []);
  const accept = props.accept;
  const accepted = accept ? files.filter((file) => matchesAccept(file, accept)) : files;
  const rejected = files.filter((file) => !accepted.includes(file));
  // 单选区域只取第一个可接受的文件，其余静默忽略（与原生单文件 input 一致）。
  const selected = props.multiple ? accepted : accepted.slice(0, 1);

  if (selected.length) emit("select", selected);
  if (rejected.length) emit("invalid", rejected);
}

function onKeydown(event: KeyboardEvent): void {
  if (event.key !== "Enter" && event.key !== " ") return;
  event.preventDefault();
  open();
}

const zoneClasses = computed(() => [
  "ds-upload-area__zone box-border flex min-h-32 flex-col items-center justify-center gap-2 rounded-ds border-2 border-dashed px-6 py-8 text-center transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ds-focus",
  props.disabled
    ? "cursor-not-allowed border-ds-outline opacity-60"
    : dragging.value
      ? "border-ds-primary-strong bg-ds-tonal"
      : "cursor-pointer border-ds-outline bg-ds-surface hover:border-ds-primary-strong hover:bg-ds-surface-hover",
]);
</script>

<template>
  <div
    v-bind="$attrs"
    class="ds-upload-area flex flex-col gap-2 font-ds"
    @dragenter="onDragEnter"
    @dragover="onDragOver"
    @dragleave="onDragLeave"
    @drop="onDrop"
  >
    <div
      :class="zoneClasses"
      role="button"
      :tabindex="disabled ? -1 : 0"
      :aria-disabled="disabled ? true : undefined"
      :aria-label="label"
      @click="open"
      @keydown="onKeydown"
    >
      <slot :open="open" :dragging="dragging">
        <Icon :icon="uploadFileIcon" size="2em" class="text-ds-muted" aria-hidden="true" />
        <div class="text-sm leading-5 font-medium text-ds-fg">{{ label }}</div>
        <div v-if="description" class="text-xs leading-4 text-ds-muted">{{ description }}</div>
      </slot>
    </div>

    <Input
      v-if="text"
      v-model="value"
      textarea
      :rows="textRows"
      :placeholder="textPlaceholder"
      :aria-label="textPlaceholder"
      :disabled="disabled"
    />

    <input
      ref="inputRef"
      type="file"
      class="hidden"
      :accept="accept"
      :multiple="multiple"
      :disabled="disabled"
      tabindex="-1"
      aria-hidden="true"
      @change="onChange"
    />
  </div>
</template>
