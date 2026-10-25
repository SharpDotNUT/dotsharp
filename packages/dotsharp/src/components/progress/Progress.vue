<script setup lang="ts">
import { computed } from "vue";
import {
  circularProgressArcs,
  clampProgressValue,
  progressFraction,
  type ProgressShape,
  type ProgressVariant,
} from "./shared";

interface ProgressProps {
  /** 进度上限。 */
  max?: number;
  /** 线形（占满宽度）或圆环。 */
  shape?: ProgressShape;
  /**
   * `detached`：进度与剩余轨道分成两段，中间留空；线性轨道末端带一个圆点。
   * `continuous`：整条 / 整圈背景，进度直接叠在上面。
   * `indeterminate` 时不再区分（不确定态没有端点，也就没有留空）。
   */
  variant?: ProgressVariant;
  /** 圆环直径（px）；圆环粗细取它的 1/12。 */
  size?: number;
  /** 时长未知的任务：线性为扫过的实心段，圆环为绕圈的弧；忽略 `value` 与 `variant`。 */
  indeterminate?: boolean;
  /** 无障碍名称（`aria-label`）。 */
  label?: string;
}

const props = withDefaults(defineProps<ProgressProps>(), {
  max: 100,
  shape: "linear",
  variant: "detached",
  size: 48,
  indeterminate: false,
  label: undefined,
});

/**
 * 当前进度，夹在 `0`–`max` 之间；`indeterminate` 时忽略。
 * 用 `v-model:value` 双向绑定；没有监听者时，`setValue()` 写下的值留在组件内部。
 */
const model = defineModel<number>("value", { default: 0 });

/** 线性轨道厚度与留空都是 4px；留空在进度点两侧各占一半。 */
const LINEAR_GAP = 4;
/** 不确定圆环的弧长占整圈的比例。 */
const INDETERMINATE_ARC = 0.25;

const current = computed(() => clampProgressValue(model.value, props.max));
const fraction = computed(() => progressFraction(model.value, props.max));
const percent = computed(() => fraction.value * 100);

/** 不确定态没有数值可报，`aria-valuenow` 缺席就是读屏的「不确定进度条」。 */
const valueAttrs = computed(() =>
  props.indeterminate
    ? {}
    : { "aria-valuemin": 0, "aria-valuemax": props.max, "aria-valuenow": current.value },
);

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
  if (props.indeterminate) return { fill: null, track: null };
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

/** 整圈底：`continuous` 与不确定态都画成完整的圆，`detached` 由剩余轨道弧充当。 */
const showRingBackground = computed(() => props.indeterminate || props.variant === "continuous");
const ringFill = computed(() =>
  props.indeterminate
    ? { length: circumference.value * INDETERMINATE_ARC, offset: 0 }
    : arcs.value.fill,
);

function dashArray(length: number) {
  return `${length} ${circumference.value - length}`;
}

/**
 * 父组件可以直接推动进度：值先夹在 `0`–`max` 之间再写回 `value`，显示按既有的 CSS 过渡动到新位置。
 * 不确定态下视觉不变，但仍会同步 `value`。
 */
function setValue(next: number) {
  model.value = clampProgressValue(next, props.max);
}

defineExpose({ setValue });
</script>

<template>
  <div
    role="progressbar"
    :aria-label="label"
    v-bind="valueAttrs"
    :class="[
      'ds-progress font-ds',
      shape === 'linear' ? 'flex w-full items-center' : 'inline-flex',
    ]"
  >
    <template v-if="shape === 'linear'">
      <!-- 不确定态：轨道上循环扫过一段实心段；`translate-x-[20%]` 是减少动效时的静态落点。 -->
      <div
        v-if="indeterminate"
        class="relative h-1 w-full overflow-hidden rounded-full bg-ds-primary"
        aria-hidden="true"
      >
        <span
          class="absolute inset-y-0 left-0 w-1/4 translate-x-[20%] rounded-full bg-ds-primary-strong animate-ds-progress-indeterminate motion-reduce:animate-none"
        />
      </div>

      <template v-else-if="variant === 'detached'">
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

    <!-- 不确定态由外层旋转；`-rotate-90` 留在 SVG 上，两者互不打架。 -->
    <span
      v-else
      class="inline-flex"
      :class="indeterminate ? 'animate-spin motion-reduce:animate-none' : undefined"
    >
      <svg
        :width="size"
        :height="size"
        :viewBox="`0 0 ${size} ${size}`"
        class="block shrink-0 -rotate-90"
        aria-hidden="true"
      >
        <circle
          v-if="showRingBackground"
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
          v-if="ringFill"
          :cx="center"
          :cy="center"
          :r="radius"
          fill="none"
          class="stroke-ds-primary-strong transition-[stroke-dasharray,stroke-dashoffset] duration-300 ease-out"
          :stroke-width="strokeWidth"
          stroke-linecap="round"
          :stroke-dasharray="dashArray(ringFill.length)"
          :stroke-dashoffset="ringFill.offset"
        />
      </svg>
    </span>
  </div>
</template>
