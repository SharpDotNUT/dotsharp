export type SliderSize = "xs" | "s" | "m" | "l" | "xl";

/** `showValue`：数值气泡的显示时机。 */
export type SliderValueDisplay = "drag" | "always" | "never";

/** 范围滑块的值类型：`[最小值, 最大值]`。 */
export type SliderRangeValue = [number, number];

export type SliderCorner = "outer" | "inner" | "square";

export interface SliderPart {
  key: string;
  active: boolean;
  /** 轨道分段在整条轨道上的起止位置，0–1。 */
  start: number;
  end: number;
  /** 边界处相对整条轨道的水平内缩（px），用于在手柄两侧留出间隙。 */
  startInset: number;
  endInset: number;
  startCorner: SliderCorner;
  endCorner: SliderCorner;
}

/** 轨道厚度：来自 Material 3 Expressive 的 XS / S / M / L / XL（dp ≈ px）。 */
export const SLIDER_TRACK_HEIGHT_CLASSES: Record<SliderSize, string> = {
  xs: "h-4",
  s: "h-6",
  m: "h-10",
  l: "h-14",
  xl: "h-24",
};

/**
 * 手柄是竖条而不是圆点：宽 4px，高度至少 44px；轨道更厚时比轨道再高 12px。
 * 只写死类名，Tailwind 才能静态收集到。
 */
export const SLIDER_HANDLE_HEIGHT_CLASSES: Record<SliderSize, string> = {
  xs: "h-11",
  s: "h-11",
  m: "h-13",
  l: "h-17",
  xl: "h-27",
};

/** 手柄与轨道之间的间隙，对应 `thumbTrackGapSize`。 */
export const SLIDER_THUMB_GAP = 6;

/** 超过这个刻度数量就不再画点：再密就糊成一条线，只会拖慢渲染。 */
export const SLIDER_MAX_TICKS = 20;

const EPSILON = 1e-6;

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/** 把任意值吸附到 `min + n * step`，并夹在 `[min, max]` 内。 */
export function snapValue(value: number, min: number, max: number, step: number): number {
  if (!(step > 0)) return clamp(value, min, max);
  const snapped = min + Math.round((value - min) / step) * step;
  return clamp(Number(snapped.toFixed(10)), min, max);
}

/** 估计一组数字需要的小数位，用于避免 `0.30000000000000004`。 */
export function decimalPlaces(...numbers: number[]): number {
  return numbers.reduce((result, number) => {
    const text = String(number);
    const exponent = text.match(/e-(\d+)$/);
    if (exponent) return Math.max(result, Number(exponent[1]));
    const dot = text.indexOf(".");
    return dot === -1 ? result : Math.max(result, text.length - dot - 1);
  }, 0);
}

export function formatSliderNumber(value: number, decimals: number): string {
  if (decimals <= 0) return String(Math.round(value));
  return String(Number(value.toFixed(Math.min(decimals, 100))));
}

export function sliderFraction(value: number, min: number, max: number): number {
  const span = max - min;
  if (!(span > 0)) return 0;
  return clamp((value - min) / span, 0, 1);
}

export interface SliderActiveBounds {
  start: number;
  end: number;
  /** 居中模式下的填充原点（0 值所在的刻度），普通模式下为 0。 */
  anchor: number;
}

/**
 * 计算高亮轨道所占的区间：
 * - 普通滑块：起点到当前值；
 * - 居中滑块：0 值所在位置到当前值；
 * - 范围滑块：两个手柄之间。
 */
export function sliderActiveBounds(
  values: number[],
  min: number,
  max: number,
  centered: boolean,
): SliderActiveBounds {
  const fractions = values.map((value) => sliderFraction(value, min, max));
  const anchor = centered ? sliderFraction(clamp(0, min, max), min, max) : 0;

  if (centered) {
    const value = fractions[0] ?? 0;
    return { start: Math.min(anchor, value), end: Math.max(anchor, value), anchor };
  }

  if (fractions.length >= 2) {
    return {
      start: Math.min(...fractions),
      end: Math.max(...fractions),
      anchor,
    };
  }

  return { start: 0, end: fractions[0] ?? 0, anchor };
}

/**
 * 把轨道切成若干段，并标出每段属于高亮还是底色。
 * 边界取轨道两端、所有手柄位置和居中原点；手柄处的边界再内缩一个间隙，
 * 朝向手柄的一侧用 2px 小圆角（`trackInsideCornerSize`）。
 */
export function buildSliderParts(
  values: number[],
  min: number,
  max: number,
  centered: boolean,
): SliderPart[] {
  const fractions = values.map((value) => sliderFraction(value, min, max));
  const bounds = sliderActiveBounds(values, min, max, centered);
  const boundaryValues = [0, 1, ...fractions, ...(centered ? [bounds.anchor] : [])];
  const boundaries = Array.from(
    new Set(boundaryValues.map((value) => Number(value.toFixed(9)))),
  ).sort((a, b) => a - b);

  const onThumb = (fraction: number) =>
    fractions.some((thumb) => Math.abs(thumb - fraction) < EPSILON);

  const parts: SliderPart[] = [];
  for (let index = 0; index < boundaries.length - 1; index += 1) {
    const start = boundaries[index]!;
    const end = boundaries[index + 1]!;
    if (end - start < EPSILON) continue;

    const middle = (start + end) / 2;
    const active =
      bounds.end - bounds.start > EPSILON && middle >= bounds.start && middle <= bounds.end;

    const startOnThumb = onThumb(start);
    const endOnThumb = onThumb(end);

    parts.push({
      key: `${start}-${end}`,
      active,
      start,
      end,
      startInset: startOnThumb ? SLIDER_THUMB_GAP : 0,
      endInset: endOnThumb ? SLIDER_THUMB_GAP : 0,
      startCorner: start <= EPSILON ? "outer" : startOnThumb ? "inner" : "square",
      endCorner: end >= 1 - EPSILON ? "outer" : endOnThumb ? "inner" : "square",
    });
  }

  return parts;
}

export function isFractionActive(fraction: number, bounds: SliderActiveBounds): boolean {
  return (
    bounds.end - bounds.start > EPSILON &&
    fraction >= bounds.start - EPSILON &&
    fraction <= bounds.end + EPSILON
  );
}
