<script setup lang="ts">
import { computed, ref } from "vue";
import {
  buildSliderParts,
  clamp,
  decimalPlaces,
  formatSliderNumber,
  isFractionActive,
  sliderActiveBounds,
  sliderFraction,
  snapValue,
  SLIDER_HANDLE_HEIGHT_CLASSES,
  SLIDER_MAX_TICKS,
  SLIDER_TRACK_HEIGHT_CLASSES,
  type SliderCorner,
  type SliderSize,
  type SliderValueDisplay,
} from "./shared";

interface SliderBaseProps {
  /** 手柄值，已按顺序排列；单值滑块传一个元素。 */
  values: number[];
  min: number;
  max: number;
  step: number;
  size: SliderSize;
  disabled: boolean;
  centered: boolean;
  ticks: boolean;
  showValue: SliderValueDisplay;
  /** 自定义数值文本（数值气泡与 `aria-valuetext`）。 */
  format?: (value: number) => string;
  /** 无障碍名称，写到每个手柄的 `aria-label` 上。 */
  label?: string;
}

const props = defineProps<SliderBaseProps>();
const emit = defineEmits<{ update: [values: number[]] }>();

const values = computed(() => {
  const next = props.values.map((value) =>
    clamp(Number.isFinite(value) ? value : props.min, props.min, props.max),
  );
  return next.length > 1 ? next.sort((a, b) => a - b) : next;
});

const span = computed(() => props.max - props.min);
const percents = computed(() =>
  values.value.map((value) => sliderFraction(value, props.min, props.max) * 100),
);

const decimals = computed(() => decimalPlaces(props.min, props.max, props.step));
const formatValue = (value: number) =>
  props.format ? props.format(value) : formatSliderNumber(value, decimals.value);

const activeBounds = computed(() =>
  sliderActiveBounds(values.value, props.min, props.max, props.centered),
);

const parts = computed(() =>
  buildSliderParts(values.value, props.min, props.max, props.centered).map((part) => ({
    key: part.key,
    active: part.active,
    startCorner: part.startCorner,
    endCorner: part.endCorner,
    style: {
      left: `calc(${part.start * 100}% + ${part.startInset}px)`,
      width: `max(0px, calc(${(part.end - part.start) * 100}% - ${part.startInset + part.endInset}px))`,
    },
  })),
);

const startCornerClasses: Record<SliderCorner, string> = {
  outer: "rounded-l-full",
  inner: "rounded-l-[2px]",
  square: "rounded-l-none",
};

const endCornerClasses: Record<SliderCorner, string> = {
  outer: "rounded-r-full",
  inner: "rounded-r-[2px]",
  square: "rounded-r-none",
};

const ticks = computed(() => {
  if (!props.ticks || !(props.step > 0)) return [];
  const count = Math.floor(span.value / props.step + 1e-9);
  if (count < 1 || count > SLIDER_MAX_TICKS) return [];

  const bounds = activeBounds.value;
  const marks: { value: number; left: string; active: boolean }[] = [];
  for (let index = 1; index < count; index += 1) {
    const value = props.min + index * props.step;
    const fraction = sliderFraction(value, props.min, props.max);
    if (fraction <= 1e-6 || fraction >= 1 - 1e-6) continue;
    marks.push({
      value,
      left: `${fraction * 100}%`,
      active: isFractionActive(fraction, bounds),
    });
  }
  return marks;
});

/** 手柄正好压在轨道端点时，该端的端点圆点让给手柄，不再单独绘制。 */
const leftStopVisible = computed(() => !percents.value.some((percent) => percent <= 1e-6));
const rightStopVisible = computed(() => !percents.value.some((percent) => percent >= 100 - 1e-6));
const leftStopActive = computed(
  () => activeBounds.value.start <= 1e-6 && activeBounds.value.end > 1e-6,
);
const rightStopActive = computed(
  () => activeBounds.value.end >= 1 - 1e-6 && activeBounds.value.start < 1 - 1e-6,
);

const track = ref<HTMLElement | null>(null);
const thumbRefs = ref<(HTMLElement | null)[]>([]);
const dragIndex = ref<number | null>(null);
const activeIndex = ref(0);
const moving = ref(false);

const bubbleIndex = computed(() =>
  Math.min(
    props.showValue === "always" ? activeIndex.value : (dragIndex.value ?? activeIndex.value),
    values.value.length - 1,
  ),
);
const bubbleVisible = computed(
  () => props.showValue === "always" || (props.showValue === "drag" && dragIndex.value !== null),
);
const bubbleValue = computed(() => values.value[bubbleIndex.value] ?? props.min);
const bubbleLeft = computed(() => `${percents.value[bubbleIndex.value] ?? 0}%`);

const unit = computed(() => (props.step > 0 ? props.step : span.value / 100 || 1));

function valueFromPointer(event: PointerEvent): number {
  const element = track.value;
  if (!element) return props.min;
  const rect = element.getBoundingClientRect();
  const ratio = rect.width > 0 ? clamp((event.clientX - rect.left) / rect.width, 0, 1) : 0;
  return snapValue(props.min + ratio * span.value, props.min, props.max, props.step);
}

function nearestIndex(value: number): number {
  const current = values.value;
  if (current.length < 2) return 0;
  const [low, high] = current as [number, number];
  const toLow = Math.abs(value - low);
  const toHigh = Math.abs(value - high);
  if (toLow === toHigh) return value >= high ? 1 : 0;
  return toLow < toHigh ? 0 : 1;
}

function applyValue(index: number, raw: number) {
  const next = [...values.value];
  const current = next[index];
  if (current === undefined) return;

  let value = snapValue(raw, props.min, props.max, props.step);
  if (next.length > 1) {
    const other = next[index === 0 ? 1 : 0]!;
    value = index === 0 ? Math.min(value, other) : Math.max(value, other);
  }
  if (value === current) return;

  next[index] = value;
  emit("update", next.length > 1 ? next.sort((a, b) => a - b) : next);
}

function onPointerDown(event: PointerEvent) {
  if (props.disabled || event.button !== 0 || !track.value) return;
  event.preventDefault();
  const value = valueFromPointer(event);
  const index = nearestIndex(value);
  activeIndex.value = index;
  dragIndex.value = index;
  moving.value = false;
  track.value.setPointerCapture?.(event.pointerId);
  thumbRefs.value[index]?.focus({ preventScroll: true });
  applyValue(index, value);
}

function onPointerMove(event: PointerEvent) {
  if (props.disabled || dragIndex.value === null) return;
  moving.value = true;
  applyValue(dragIndex.value, valueFromPointer(event));
}

function endDrag(event: PointerEvent) {
  if (dragIndex.value === null) return;
  const element = track.value;
  if (element?.hasPointerCapture?.(event.pointerId)) {
    element.releasePointerCapture?.(event.pointerId);
  }
  dragIndex.value = null;
  moving.value = false;
}

function onKeydown(event: KeyboardEvent, index: number) {
  if (props.disabled) return;
  const current = values.value[index];
  if (current === undefined) return;

  const step = unit.value;
  let next: number | null = null;
  switch (event.key) {
    case "ArrowRight":
    case "ArrowUp":
      next = current + step;
      break;
    case "ArrowLeft":
    case "ArrowDown":
      next = current - step;
      break;
    case "PageUp":
      next = current + step * 10;
      break;
    case "PageDown":
      next = current - step * 10;
      break;
    case "Home":
      next = props.min;
      break;
    case "End":
      next = props.max;
      break;
    default:
      return;
  }

  event.preventDefault();
  activeIndex.value = index;
  applyValue(index, next);
}
</script>

<template>
  <div
    class="ds-slider flex w-full items-center gap-3 font-ds"
    :data-disabled="disabled || undefined"
  >
    <slot name="start" />

    <div
      ref="track"
      class="relative min-w-0 flex-1 touch-none select-none"
      :class="[
        SLIDER_HANDLE_HEIGHT_CLASSES[size],
        disabled ? 'cursor-not-allowed opacity-40' : 'cursor-pointer',
      ]"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="endDrag"
      @pointercancel="endDrag"
    >
      <div
        v-for="part in parts"
        :key="part.key"
        class="absolute top-1/2 -translate-y-1/2"
        :class="[
          SLIDER_TRACK_HEIGHT_CLASSES[size],
          part.active ? 'bg-ds-primary-strong' : 'bg-ds-surface-hover',
          startCornerClasses[part.startCorner],
          endCornerClasses[part.endCorner],
          moving ? 'transition-none' : 'transition-[left,width] duration-150 ease-out',
        ]"
        :style="part.style"
        aria-hidden="true"
      />

      <span
        v-if="leftStopVisible"
        class="pointer-events-none absolute top-1/2 left-1 z-10 size-1 -translate-y-1/2 rounded-full"
        :class="leftStopActive ? 'bg-ds-bg' : 'bg-ds-primary-strong'"
        aria-hidden="true"
      />
      <span
        v-if="rightStopVisible"
        class="pointer-events-none absolute top-1/2 right-1 z-10 size-1 -translate-y-1/2 rounded-full"
        :class="rightStopActive ? 'bg-ds-bg' : 'bg-ds-primary-strong'"
        aria-hidden="true"
      />

      <span
        v-for="tick in ticks"
        :key="tick.value"
        class="pointer-events-none absolute top-1/2 z-10 size-1 -translate-x-1/2 -translate-y-1/2 rounded-full"
        :class="tick.active ? 'bg-ds-bg' : 'bg-ds-primary-strong'"
        :style="{ left: tick.left }"
        aria-hidden="true"
      />

      <div
        v-for="(value, index) in values"
        :key="index"
        :ref="(element) => (thumbRefs[index] = element as HTMLElement | null)"
        class="absolute top-1/2 z-20 flex w-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ds-focus"
        :class="[
          SLIDER_HANDLE_HEIGHT_CLASSES[size],
          moving && dragIndex === index
            ? 'transition-none'
            : 'transition-[left] duration-150 ease-out',
        ]"
        :style="{ left: `${percents[index]}%` }"
        role="slider"
        aria-orientation="horizontal"
        :tabindex="disabled ? -1 : 0"
        :aria-label="label"
        :aria-valuemin="min"
        :aria-valuemax="max"
        :aria-valuenow="value"
        :aria-valuetext="formatValue(value)"
        :aria-disabled="disabled ? 'true' : undefined"
        @keydown="onKeydown($event, index)"
        @focus="activeIndex = index"
      >
        <span
          class="block h-full rounded-full bg-ds-primary-strong transition-[width] duration-150 ease-out"
          :class="dragIndex === index ? 'w-0.5' : 'w-1'"
        />
      </div>

      <div
        v-if="showValue !== 'never'"
        class="pointer-events-none absolute bottom-full z-30 mb-2 flex h-11 min-w-11 -translate-x-1/2 items-center justify-center rounded-full bg-ds-fg px-3 text-sm leading-none font-medium text-ds-bg shadow-sm transition-[opacity,transform] duration-150 ease-out"
        :class="bubbleVisible ? 'scale-100 opacity-100' : 'scale-75 opacity-0'"
        :style="{ left: bubbleLeft }"
        aria-hidden="true"
      >
        {{ formatValue(bubbleValue) }}
      </div>
    </div>

    <slot name="end" />
  </div>
</template>
