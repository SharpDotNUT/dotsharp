<script setup lang="ts">
import { computed } from "vue";
import SliderBase from "./SliderBase.vue";
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
}

withDefaults(defineProps<SliderProps>(), {
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
});

const model = defineModel<number>({ default: 0 });
const values = computed(() => [model.value]);

function onUpdate(next: number[]) {
  model.value = next[0] ?? model.value;
}
</script>

<template>
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
    @update="onUpdate"
  >
    <template #start><slot name="start" /></template>
    <template #end><slot name="end" /></template>
  </SliderBase>
</template>
