<script setup lang="ts">
import { computed } from "vue";
import {
  circularProgressArcs,
  progressFraction,
  type ProgressShape,
  type ProgressVariant,
} from "./shared";

interface ProgressProps {
  /** 当前进度，夹在 `0`–`max` 之间。 */
  value?: number;
  /** 进度上限。 */
  max?: number;
  /** 线形（占满宽度）或圆环。 */
  shape?: ProgressShape;
  /**
   * `detached`：进度与剩余轨道分成两段，中间留空；线性轨道末端带一个圆点。
   * `continuous`：整条 / 整圈背景，进度直接叠在上面。
   */
  variant?: ProgressVariant;
  /** 圆环直径（px）；圆环粗细取它的 1/12。 */
  size?: number;
  /** 无障碍名称（`aria-label`）。 */
  label?: string;
}

const props = withDefaults(defineProps<ProgressProps>(), {
  value: 0,
  max: 100,
  shape: "linear",
  variant: "detached",
  size: 48,
  label: undefined,
});

/** 线性轨道厚度与留空都是 4px；留空在进度点两侧各占一半。 */
const LINEAR_GAP = 4;

const current = computed(() =>
  Math.min(props.max, Math.max(0, Number.isFinite(props.value) ? props.value : 0)),
);
const fraction = computed(() => progressFraction(props.value, props.max));
const percent = computed(() => fraction.value * 100);

const linearFillWidth = computed(() =>
  fraction.value >= 1 ? "100%" : `max(0px, calc(${percent.value}% - ${LINEAR_GAP / 2}px))`,
);
const linearTrackLeft = computed(() =>
  fraction.value <= 0 ? "0px" : `calc(${percent.value}% + ${LINEAR_GAP / 2}px)`,
);

const strokeWidth = computed(() => Math.max(2, Math.round(props.size / 12)));
const radius = computed(() => (props.size - strokeWidth.value) / 2);
const center = computed(() => props.size / 2);
const circumference = computed(() => 2 * Math.PI * radius.value);

const arcs = computed(() => {
  if (props.variant === "continuous") {
    const length = fraction.value * circumference.value;
    return { fill: length > 0 ? { length, offset: 0 } : null, track: null };
  }
  return circularProgressArcs(
    fraction.value,
    circumference.value,
    strokeWidth.value,
    strokeWidth.value,
  );
});

function dashArray(length: number) {
  return `${length} ${circumference.value - length}`;
}
</script>

<template>
  <div
    role="progressbar"
    :aria-label="label"
    aria-valuemin="0"
    :aria-valuemax="max"
    :aria-valuenow="current"
    :class="[
      'ds-progress font-ds',
      shape === 'linear' ? 'flex w-full items-center' : 'inline-flex',
    ]"
  >
    <template v-if="shape === 'linear'">
      <template v-if="variant === 'detached'">
        <div class="relative h-1 min-w-0 flex-1">
          <span
            class="absolute inset-y-0 right-0 rounded-full bg-ds-primary transition-[left] duration-300 ease-out"
            :style="{ left: linearTrackLeft }"
            aria-hidden="true"
          />
          <span
            class="absolute inset-y-0 left-0 rounded-full bg-ds-primary-strong transition-[width] duration-300 ease-out"
            :style="{ width: linearFillWidth }"
            aria-hidden="true"
          />
        </div>
        <span
          v-if="fraction < 1"
          class="ml-0.5 size-1 shrink-0 rounded-full bg-ds-primary-strong"
          aria-hidden="true"
        />
      </template>
      <div
        v-else
        class="relative h-1 w-full overflow-hidden rounded-full bg-ds-primary"
        aria-hidden="true"
      >
        <span
          class="absolute inset-y-0 left-0 rounded-full bg-ds-primary-strong transition-[width] duration-300 ease-out"
          :style="{ width: `${percent}%` }"
        />
      </div>
    </template>

    <svg
      v-else
      :width="size"
      :height="size"
      :viewBox="`0 0 ${size} ${size}`"
      class="block shrink-0 -rotate-90"
      aria-hidden="true"
    >
      <circle
        v-if="variant === 'continuous'"
        :cx="center"
        :cy="center"
        :r="radius"
        fill="none"
        class="stroke-ds-primary"
        :stroke-width="strokeWidth"
      />
      <circle
        v-else-if="arcs.track"
        :cx="center"
        :cy="center"
        :r="radius"
        fill="none"
        class="stroke-ds-primary transition-[stroke-dasharray,stroke-dashoffset] duration-300 ease-out"
        :stroke-width="strokeWidth"
        stroke-linecap="round"
        :stroke-dasharray="dashArray(arcs.track.length)"
        :stroke-dashoffset="arcs.track.offset"
      />
      <circle
        v-if="arcs.fill"
        :cx="center"
        :cy="center"
        :r="radius"
        fill="none"
        class="stroke-ds-primary-strong transition-[stroke-dasharray,stroke-dashoffset] duration-300 ease-out"
        :stroke-width="strokeWidth"
        stroke-linecap="round"
        :stroke-dasharray="dashArray(arcs.fill.length)"
        :stroke-dashoffset="arcs.fill.offset"
      />
    </svg>
  </div>
</template>
