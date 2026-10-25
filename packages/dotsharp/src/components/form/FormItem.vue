<script setup lang="ts">
import { computed, provide, useId } from "vue";
import { formItemContextKey } from "./context";

defineOptions({ inheritAttrs: false });

interface FormItemProps {
  /** 字段标签；省略时不渲染标签。 */
  label?: string;
  /** 在标签末尾显示必填标记。仅为视觉提示，是否必填由验证函数决定。 */
  required?: boolean;
  /** 字段下方的辅助说明。 */
  description?: string;
}

const props = withDefaults(defineProps<FormItemProps>(), {
  label: undefined,
  required: false,
  description: undefined,
});

const uid = useId();
const labelId = `ds-form-item-label-${uid}`;

provide(formItemContextKey, {
  labelId: computed(() => (props.label ? labelId : undefined)),
  required: computed(() => props.required),
});
</script>

<template>
  <div v-bind="$attrs" class="ds-form-item flex w-full flex-col gap-2 font-ds">
    <label v-if="label" :id="labelId" class="text-sm leading-5 text-ds-muted">
      {{ label }}<span v-if="required" aria-hidden="true" class="text-ds-error"> *</span>
    </label>
    <slot />
    <p v-if="description" class="text-xs leading-4 text-ds-muted">{{ description }}</p>
  </div>
</template>
