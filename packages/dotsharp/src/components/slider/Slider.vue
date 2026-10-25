<script setup lang="ts">
import { computed } from "vue";
import SliderBase from "./SliderBase.vue";
import { useFieldValidation } from "../../composables/useFieldValidation";
import type { FormValidateTrigger, FormValidator } from "../form/context";
import type { SliderSize, SliderValueDisplay } from "./shared";

interface SliderProps {
  min?: number;
  max?: number;
  /** 步长；离散滑块的每个可选值之间的间隔。 */
  step?: number;
  /** 轨道厚度：XS 16px、S 24px、M 40px、L 56px、XL 96px。 */
  size?: SliderSize;
  disabled?: boolean;
  /** 以 0（夹在 min / max 内）为填充原点，用于正负对称的取值范围。 */
  centered?: boolean;
  /** 在轨道上画出每个可选值的刻度点；刻度超过 20 个时自动省略。 */
  ticks?: boolean;
  /** 数值气泡的显示时机：拖动时 / 始终 / 不显示。 */
  showValue?: SliderValueDisplay;
  /** 自定义数值文本，同时用于数值气泡与 `aria-valuetext`。 */
  format?: (value: number) => string;
  /** 无障碍名称（`aria-label`）。 */
  label?: string;
  /**
   * 验证函数：接收当前值，返回 `false` 表示通过，返回 `true` 或错误文案表示不通过。
   */
  validator?: FormValidator<number>;
  /** 自动校验时机，默认 `["input", "blur"]`；传 `[]` 关闭自动校验。 */
  validateOn?: FormValidateTrigger | FormValidateTrigger[];
}

const props = withDefaults(defineProps<SliderProps>(), {
  min: 0,
  max: 100,
  step: 1,
  size: "xs",
  disabled: false,
  centered: false,
  ticks: false,
  showValue: "drag",
  format: undefined,
  label: undefined,
  validator: undefined,
  validateOn: undefined,
});

const model = defineModel<number>({ default: 0 });
const values = computed(() => [model.value]);

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

function onUpdate(next: number[]) {
  model.value = next[0] ?? model.value;
  triggerValidation("input", next[0] ?? model.value);
}
</script>

<template>
  <div class="ds-slider-field flex w-full flex-col gap-1 font-ds">
    <SliderBase
      :values="values"
      :min="min"
      :max="max"
      :step="step"
      :size="size"
      :disabled="disabled"
      :centered="centered"
      :ticks="ticks"
      :show-value="showValue"
      :format="format"
      :label="label"
      :invalid="isInvalid"
      @update="onUpdate"
      @blur="triggerValidation('blur')"
    >
      <template #start><slot name="start" /></template>
      <template #end><slot name="end" /></template>
    </SliderBase>
    <p v-if="validationMessage" class="text-xs leading-4 text-ds-error">
      {{ validationMessage }}
    </p>
  </div>
</template>
