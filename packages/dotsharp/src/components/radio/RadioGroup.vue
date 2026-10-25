<script setup lang="ts">
import { computed, inject, provide, toRef, useAttrs, useId } from "vue";
import { radioContextKey, type RadioValue } from "./context";
import { useFieldValidation } from "../../composables/useFieldValidation";
import { formItemContextKey, type FormValidateTrigger, type FormValidator } from "../form/context";

defineOptions({ inheritAttrs: false });

interface RadioGroupProps {
  /** 原生 `name`；省略时自动生成，确保组内互斥与方向键切换。 */
  name?: string;
  disabled?: boolean;
  /**
   * 验证函数：接收当前值，返回 `false` 表示通过，返回 `true` 或错误文案表示不通过。
   */
  validator?: FormValidator<RadioValue>;
  /** 自动校验时机，默认 `["input", "blur"]`；传 `[]` 关闭自动校验。 */
  validateOn?: FormValidateTrigger | FormValidateTrigger[];
}

const props = withDefaults(defineProps<RadioGroupProps>(), {
  name: undefined,
  disabled: false,
  validator: undefined,
  validateOn: undefined,
});

const model = defineModel<RadioValue>("value", { default: 0 });

const uid = useId();
const messageId = `ds-radio-group-message-${uid}`;
const attrs = useAttrs();

const formItem = inject(formItemContextKey, null);

const {
  invalid: isInvalid,
  message: validationMessage,
  trigger: triggerValidation,
  validate,
  clearValidate,
} = useFieldValidation({
  value: () => model.value,
  validator: () => props.validator,
  triggers: () => props.validateOn,
});

defineExpose({ validate, clearValidate });

/** `FormItem` 的标签在没有显式无障碍名称时充当组的可访问名称。 */
const itemLabelAttrs = computed(() => {
  const labelId = formItem?.labelId.value;
  if (!labelId || "aria-label" in attrs || "aria-labelledby" in attrs) return {};
  return { "aria-labelledby": labelId };
});

provide(radioContextKey, {
  model,
  name: computed(() => props.name ?? `ds-radio-group-${uid}`),
  disabled: toRef(props, "disabled"),
  notify: triggerValidation,
});
</script>

<template>
  <div
    role="radiogroup"
    v-bind="{ ...$attrs, ...itemLabelAttrs }"
    :aria-invalid="isInvalid || undefined"
    :aria-required="formItem?.required.value || undefined"
    :aria-describedby="validationMessage ? messageId : undefined"
    class="ds-radio-group flex flex-col font-ds text-ds-fg"
  >
    <slot />
    <p v-if="validationMessage" :id="messageId" class="mt-1 text-xs leading-4 text-ds-error">
      {{ validationMessage }}
    </p>
  </div>
</template>
