<script setup lang="ts">
import { useFilePicker } from "./shared";

defineOptions({ inheritAttrs: false });

interface UploaderProps {
  /** 原生 `accept` 规则，如 `image/*`、`.pdf,.docx`。 */
  accept?: string;
  /** 允许一次选择多个文件，选中结果仍通过一次 `select` 事件给出。 */
  multiple?: boolean;
  disabled?: boolean;
}

const props = withDefaults(defineProps<UploaderProps>(), {
  accept: undefined,
  multiple: false,
  disabled: false,
});

const emit = defineEmits<{ select: [files: File[]] }>();

const { inputRef, open, onChange } = useFilePicker({
  disabled: () => props.disabled,
  onSelect: (files) => emit("select", files),
});

defineExpose({ open });

/** `input.click()` 产生的点击会冒泡回根节点，必须放行，否则会再打开一次选择框。 */
function onClick(event: MouseEvent): void {
  if (event.target === inputRef.value) return;
  open();
}
</script>

<template>
  <div
    v-bind="$attrs"
    class="ds-uploader inline-block cursor-pointer align-middle"
    :class="disabled ? 'cursor-not-allowed' : ''"
    :aria-disabled="disabled ? true : undefined"
    @click="onClick"
  >
    <slot :open="open" :disabled="disabled" />
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
