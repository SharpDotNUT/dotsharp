<script setup lang="ts">
import { computed, inject, useAttrs, useId, useSlots } from "vue";
import checkIcon from "@iconify-icons/material-symbols/check";
import removeIcon from "@iconify-icons/material-symbols/remove";
import Icon from "../icon/Icon.vue";
import { useFieldValidation } from "../../composables/useFieldValidation";
import { formItemContextKey, type FormValidateTrigger, type FormValidator } from "../form/context";

defineOptions({ inheritAttrs: false });

interface CheckboxProps {
  /** 复选框右侧的文本；存在默认插槽时被插槽覆盖。 */
  label?: string;
  /** 不确定状态：显示横线，原生 `indeterminate` 同义。 */
  indeterminate?: boolean;
  disabled?: boolean;
  /**
   * 验证函数：接收当前值，返回 `false` 表示通过，返回 `true` 或错误文案表示不通过。
   */
  validator?: FormValidator<boolean>;
  /** 自动校验时机，默认 `["input", "blur"]`；传 `[]` 关闭自动校验。 */
  validateOn?: FormValidateTrigger | FormValidateTrigger[];
}

const props = withDefaults(defineProps<CheckboxProps>(), {
  label: undefined,
  indeterminate: false,
  disabled: false,
  validator: undefined,
  validateOn: undefined,
});

const model = defineModel<boolean>({ default: false });

const attrs = useAttrs();
const slots = useSlots();
const uid = useId();

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

const messageId = `ds-checkbox-message-${uid}`;

/** 没有自己的 label / 插槽时，用 `FormItem` 的标签作为可访问名称。 */
const itemLabelAttrs = computed(() => {
  const labelId = formItem?.labelId.value;
  if (props.label || slots.default || !labelId) return {};
  if ("aria-label" in attrs || "aria-labelledby" in attrs) return {};
  return { "aria-labelledby": labelId };
});

/** 受控组件里 `model` 可能晚一拍，直接读原生控件的最新状态。 */
function onChange(event: Event): void {
  triggerValidation("input", (event.target as HTMLInputElement).checked);
}

/** `class` / `style` 落在根元素上，其余属性与事件全部透传给原生 `<input>`。 */
const rootAttrs = computed(() => {
  const out: Record<string, unknown> = {};
  if (attrs.class) out.class = attrs.class;
  if (attrs.style) out.style = attrs.style;
  return out;
});

const controlAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = attrs;
  return rest;
});

const inputId = computed(() => (attrs.id as string | undefined) ?? `ds-checkbox-${uid}`);
const checked = computed(() => model.value && !props.indeterminate);
const active = computed(() => model.value || props.indeterminate);
</script>

<template>
  <div v-bind="rootAttrs" class="ds-checkbox flex flex-col gap-1 font-ds">
    <label
      :class="[
        'group inline-flex items-center gap-2 text-base leading-6 text-ds-fg',
        disabled ? 'cursor-not-allowed opacity-38' : 'cursor-pointer',
      ]"
    >
      <span
        :class="[
          'relative inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors',
          !disabled ? 'group-hover:bg-ds-fg/8' : '',
        ]"
      >
        <input
          :id="inputId"
          v-model="model"
          v-bind="{ ...controlAttrs, ...itemLabelAttrs }"
          type="checkbox"
          :indeterminate="indeterminate"
          :disabled="disabled"
          :aria-invalid="isInvalid || undefined"
          :aria-required="formItem?.required.value || undefined"
          :aria-describedby="validationMessage ? messageId : undefined"
          class="peer absolute inset-0 z-10 m-0 h-full w-full cursor-pointer appearance-none opacity-0 disabled:cursor-not-allowed"
          @change="onChange"
          @blur="triggerValidation('blur')"
        />
        <span
          aria-hidden="true"
          :class="[
            'pointer-events-none flex h-[18px] w-[18px] box-border items-center justify-center rounded-[2px] border-2 transition-colors peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ds-focus',
            isInvalid
              ? active
                ? 'border-ds-error bg-ds-primary-strong text-ds-primary'
                : 'border-ds-error bg-transparent text-transparent'
              : active
                ? 'border-ds-primary-strong bg-ds-primary-strong text-ds-primary'
                : 'border-ds-fg bg-transparent text-transparent',
          ]"
        >
          <Icon v-if="indeterminate" :icon="removeIcon" size="0.875em" />
          <Icon v-else-if="checked" :icon="checkIcon" size="0.875em" />
        </span>
      </span>

      <span v-if="label || $slots.default" class="min-w-0">
        <slot>{{ label }}</slot>
      </span>
    </label>

    <p v-if="validationMessage" :id="messageId" class="text-xs leading-4 text-ds-error">
      {{ validationMessage }}
    </p>
  </div>
</template>
