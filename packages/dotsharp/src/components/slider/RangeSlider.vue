<script setup lang="ts">
import { computed } from "vue";
import SliderBase from "./SliderBase.vue";
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
}

withDefaults(defineProps<RangeSliderProps>(), {
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
});

const model = defineModel<SliderRangeValue>({ default: () => [0, 100] });
const values = computed(() => [...model.value]);

function onUpdate(next: number[]) {
  model.value = [next[0] ?? model.value[0], next[1] ?? model.value[1]];
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
    :centered="false"
    :ticks="ticks"
    :show-value="showValue"
    :format="format"
    :label="label"
    :labels="labels"
    @update="onUpdate"
  >
    <template #start><slot name="start" /></template>
    <template #end><slot name="end" /></template>
  </SliderBase>
</template>
