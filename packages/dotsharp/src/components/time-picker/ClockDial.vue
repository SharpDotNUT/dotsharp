<script setup lang="ts">
import { computed, ref } from "vue";
import { useI18n } from "../../i18n";
import type { TimeFormat } from "./types";
import {
  dialPosition,
  handAngle,
  handRadius,
  hourDialLabels,
  hourFromAngle,
  INNER_RING,
  isInnerRing,
  isPm,
  minuteDialLabels,
  minuteFromAngle,
  OUTER_RING,
  pad2,
  pointerAngle,
  setHour12,
  stepHour,
  stepMinute,
  toHour12,
} from "./time";

interface ClockDialProps {
  /** 表盘当前编辑小时还是分钟。 */
  mode: "hours" | "minutes";
  format: TimeFormat;
  /** 小时 0–23；12 小时制显示时再换算。 */
  hour: number;
  /** 分钟 0–59。 */
  minute: number;
}

const props = defineProps<ClockDialProps>();

const emit = defineEmits<{
  "update:hour": [hour: number];
  "update:minute": [minute: number];
  /** 点选（而非拖动）一个数字后触发，父组件用它切到分钟。 */
  select: [];
}>();

const i18n = useI18n();
const rootRef = ref<HTMLElement | null>(null);
let dragging = false;

const cells = computed(() =>
  props.mode === "hours" ? hourDialLabels(props.format) : minuteDialLabels(),
);

const angle = computed(() => handAngle(props.hour, props.minute, props.mode));
const radius = computed(() => handRadius(props.hour, props.mode, props.format));

const handleLabel = computed(() => {
  if (props.mode === "minutes") return pad2(props.minute);
  return props.format === "12h" ? String(toHour12(props.hour)) : pad2(props.hour);
});

const currentValue = computed(() => {
  if (props.mode === "minutes") return props.minute;
  return props.format === "12h" ? toHour12(props.hour) : props.hour;
});

/** 选中值所在的数字不再单独显示：它已经在手柄里。 */
const otherCells = computed(() => cells.value.filter((cell) => cell.value !== currentValue.value));

/** 线从圆心朝右画，再转成表盘角度（0 在 12 点方向，所以减 90）。 */
const handStyle = computed(() => ({
  width: `${radius.value * 50}%`,
  transform: `translateY(-50%) rotate(${angle.value - 90}deg)`,
}));

const handleStyle = computed(() => {
  const point = dialPosition(angle.value, radius.value);
  return { left: `${point.x}%`, top: `${point.y}%` };
});

function cellStyle(cell: { angle: number; inner: boolean }) {
  const point = dialPosition(cell.angle, cell.inner ? INNER_RING : OUTER_RING);
  return { left: `${point.x}%`, top: `${point.y}%` };
}

const dialLabel = computed(() => i18n.t(props.mode === "hours" ? "hour" : "minute"));
const valueMin = computed(() => (props.mode === "minutes" || props.format === "24h" ? 0 : 1));
const valueMax = computed(() => (props.mode === "minutes" ? 59 : props.format === "12h" ? 12 : 23));
const valueNow = computed(() => currentValue.value);
const valueText = computed(() => {
  if (props.mode === "minutes") return `${pad2(props.minute)} ${i18n.t("minute")}`;
  if (props.format === "24h") return `${pad2(props.hour)} ${i18n.t("hour")}`;
  return `${toHour12(props.hour)} ${i18n.t(isPm(props.hour) ? "pm" : "am")}`;
});

function offsetOf(event: PointerEvent): { dx: number; dy: number } {
  const element = rootRef.value;
  if (!element) return { dx: 0, dy: 0 };

  const rect = element.getBoundingClientRect();
  const half = Math.min(rect.width, rect.height) / 2 || 1;
  return {
    dx: (event.clientX - (rect.left + rect.width / 2)) / half,
    dy: (event.clientY - (rect.top + rect.height / 2)) / half,
  };
}

/** 24 小时制按指针到圆心的距离决定内外圈：拖动中跨过分界就换圈。 */
function applyOffset(dx: number, dy: number): void {
  const degrees = pointerAngle(dx, dy);

  if (props.mode === "minutes") {
    emit("update:minute", minuteFromAngle(degrees));
    return;
  }

  const inner = props.format === "24h" && isInnerRing(Math.hypot(dx, dy));
  emit("update:hour", hourFromAngle(degrees, inner, props.format));
}

function onPointerDown(event: PointerEvent): void {
  if (event.button !== 0) return;

  event.preventDefault();
  rootRef.value?.focus({ preventScroll: true });
  rootRef.value?.setPointerCapture?.(event.pointerId);

  const { dx, dy } = offsetOf(event);
  dragging = true;
  applyOffset(dx, dy);
}

function onPointerMove(event: PointerEvent): void {
  if (!dragging) return;
  const { dx, dy } = offsetOf(event);
  applyOffset(dx, dy);
}

function onPointerUp(event: PointerEvent): void {
  if (!dragging) return;

  dragging = false;
  if (rootRef.value?.hasPointerCapture(event.pointerId)) {
    rootRef.value.releasePointerCapture(event.pointerId);
  }
  emit("select");
}

const KEYS = [
  "ArrowUp",
  "ArrowRight",
  "ArrowDown",
  "ArrowLeft",
  "PageUp",
  "PageDown",
  "Home",
  "End",
];

function onKeydown(event: KeyboardEvent): void {
  if (!KEYS.includes(event.key)) return;
  event.preventDefault();

  const hours = props.mode === "hours";

  if (event.key === "Home" || event.key === "End") {
    const last = event.key === "End";
    if (hours) {
      if (props.format === "12h") {
        emit("update:hour", setHour12(last ? 12 : 1, isPm(props.hour)));
      } else {
        emit("update:hour", last ? 23 : 0);
      }
    } else {
      emit("update:minute", last ? 59 : 0);
    }
    return;
  }

  const delta =
    event.key === "PageUp"
      ? 5
      : event.key === "PageDown"
        ? -5
        : event.key === "ArrowUp" || event.key === "ArrowRight"
          ? 1
          : -1;

  if (hours) emit("update:hour", stepHour(props.hour, delta));
  else emit("update:minute", stepMinute(props.minute, delta));
}
</script>

<template>
  <div
    ref="rootRef"
    role="spinbutton"
    tabindex="0"
    class="ds-clock-dial relative mx-auto aspect-square w-full max-w-60 cursor-pointer touch-none rounded-full bg-ds-fg/5 select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ds-focus"
    :aria-label="dialLabel"
    :aria-valuemin="valueMin"
    :aria-valuemax="valueMax"
    :aria-valuenow="valueNow"
    :aria-valuetext="valueText"
    @keydown="onKeydown"
    @pointerdown="onPointerDown"
    @pointermove="onPointerMove"
    @pointerup="onPointerUp"
    @pointercancel="onPointerUp"
  >
    <div aria-hidden="true" class="pointer-events-none absolute inset-0">
      <div
        class="absolute top-1/2 left-1/2 h-0.5 origin-left rounded-full bg-ds-primary-strong"
        :style="handStyle"
      />
      <span
        v-for="cell in otherCells"
        :key="`${cell.value}-${cell.inner ? 'inner' : 'outer'}`"
        class="absolute -translate-x-1/2 -translate-y-1/2 text-sm leading-none tabular-nums text-ds-fg"
        :style="cellStyle(cell)"
      >
        {{ cell.label }}
      </span>
      <span
        class="absolute top-1/2 left-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ds-primary-strong"
      />
      <span
        class="absolute flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-ds-primary-strong text-sm leading-none font-medium tabular-nums text-ds-bg"
        :style="handleStyle"
      >
        {{ handleLabel }}
      </span>
    </div>
  </div>
</template>
