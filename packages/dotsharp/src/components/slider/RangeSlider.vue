<script setup lang="ts">
import { computed } from "vue";
import SliderBase from "./SliderBase.vue";
import { useFieldValidation } from "../../composables/useFieldValidation";
import type { FormValidateTrigger, FormValidator } from "../form/context";
import type { SliderRangeValue, SliderSize, SliderValueDisplay } from "./shared";

interface RangeSliderProps {
  min?: number;
  max?: number;
  /** 两个手柄共用的步长。 */
  step?: number;
  size?: SliderSize;
  disabled?: boolean;
  /** 在轨道上画出每个可选值的刻度点；刻度超过 20 个时自动省略。 */
  ticks?: boolean;
  /** 数值气泡的显示时机；拖动时只显示当前手柄的气泡。 */
  showValue?: SliderValueDisplay;
  format?: (value: number) => string;
  /** 无障碍名称（`aria-label`），两个手柄共用；用 `labels` 可分别命名。 */
  label?: string;
  /** 两个手柄各自的无障碍名称，顺序为 `[低位, 高位]`。 */
  labels?: [string, string];
  /**
   * 验证函数：接收当前区间，返回 `false` 表示通过，返回 `true` 或错误文案表示不通过。
   */
  validator?: FormValidator<SliderRangeValue>;
  /** 自动校验时机，默认 `["input", "blur"]`；传 `[]` 关闭自动校验。 */
  validateOn?: FormValidateTrigger | FormValidateTrigger[];
}

const props = withDefaults(defineProps<RangeSliderProps>(), {
  min: 0,
  max: 100,
  step: 1,
  size: "xs",
  disabled: false,
  ticks: false,
  showValue: "drag",
  format: undefined,
  label: undefined,
  labels: undefined,
  validator: undefined,
  validateOn: undefined,
});

const model = defineModel<SliderRangeValue>({ default: () => [0, 100] });
const values = computed(() => [...model.value]);

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
  const low = next[0] ?? model.value[0];
  const high = next[1] ?? model.value[1];
  model.value = [low, high];
  triggerValidation("input", [low, high]);
}
</script>

<template>
  <div class="ds-range-slider-field flex w-full flex-col gap-1 font-ds">
    <SliderBase
      :values="values"
      :min="min"
      :max="max"
      :step="step"
      :size="size"
      :disabled="disabled"
      :centered="false"
      :ticks="ticks"
      :show-value="showValue"
      :format="format"
      :label="label"
      :labels="labels"
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
