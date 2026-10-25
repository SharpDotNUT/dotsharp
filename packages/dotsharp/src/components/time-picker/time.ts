import type { TimeFormat, TimeValue } from "./types";

/** 表盘上的一个数字。`inner` 表示它在 24 小时制的内圈。 */
export interface DialLabel {
  /** 这个数字代表的值：小时 0–23（12 小时制是 1–12），或分钟 0–59。 */
  value: number;
  label: string;
  /** 顺时针角度，0 表示 12 点方向。 */
  angle: number;
  inner: boolean;
}

/** 数字相对圆心的半径（1 = 半边长），与 `dialPosition` 的单位一致。 */
export const OUTER_RING = 0.8;
export const INNER_RING = 0.52;
/** 24 小时制两圈的分界，取两圈半径的中点。 */
const RING_SPLIT = (INNER_RING + OUTER_RING) / 2;

export function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

function mod(value: number, size: number): number {
  return ((value % size) + size) % size;
}

/** 把任意数字收敛成合法的时刻；非有限数返回 `null`，`second` 有值时才保留。 */
export function normalizeTime(value: TimeValue | null | undefined): TimeValue | null {
  if (!value) return null;
  const { hour, minute, second } = value;
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) return null;

  const time: TimeValue = { hour: mod(Math.trunc(hour), 24), minute: mod(Math.trunc(minute), 60) };
  if (second !== undefined && Number.isFinite(second)) {
    time.second = mod(Math.trunc(second), 60);
  }
  return time;
}

export function sameTime(a: TimeValue | null, b: TimeValue | null): boolean {
  if (!a || !b) return a === b;
  return a.hour === b.hour && a.minute === b.minute && (a.second ?? 0) === (b.second ?? 0);
}

/** 12 小时制里显示的小时：0 → 12，13 → 1。 */
export function toHour12(hour: number): number {
  const value = mod(hour, 12);
  return value === 0 ? 12 : value;
}

export function isPm(hour: number): boolean {
  return mod(hour, 24) >= 12;
}

/** 把 12 小时制的显示小时与 AM/PM 合回 0–23。 */
export function setHour12(hour12: number, pm: boolean): number {
  return mod(hour12, 12) + (pm ? 12 : 0);
}

/** 只换 AM/PM，显示小时不变。 */
export function withPeriod(hour: number, pm: boolean): number {
  return setHour12(toHour12(hour), pm);
}

/** 按真实小时加减（12 小时制会在 11 → 12 时自动换 AM/PM），始终落在 0–23。 */
export function stepHour(hour: number, delta: number): number {
  return mod(hour + delta, 24);
}

export function stepMinute(minute: number, delta: number): number {
  return mod(minute + delta, 60);
}

export function timeFromDate(date: Date): TimeValue {
  return { hour: date.getHours(), minute: date.getMinutes(), second: date.getSeconds() };
}

/** 头部小时字段的两位数字（12 小时制取 1–12）。 */
export function hourText(time: TimeValue, format: TimeFormat): string {
  return pad2(format === "12h" ? toHour12(time.hour) : time.hour);
}

/** 输入框里显示/占位的时钟格式提示。 */
export function timePlaceholder(format: TimeFormat, upper = false, seconds = false): string {
  const base = upper && format === "24h" ? "HH:MM" : "hh:mm";
  const clock = seconds ? `${base}:${upper && format === "24h" ? "SS" : "ss"}` : base;
  return format === "12h" && upper ? `${clock} AM` : clock;
}

export function formatTimeInput(
  time: TimeValue,
  format: TimeFormat,
  labels: { am: string; pm: string },
  seconds = false,
): string {
  let clock = `${hourText(time, format)}:${pad2(time.minute)}`;
  if (seconds) clock += `:${pad2(time.second ?? 0)}`;
  if (format === "24h") return clock;
  return `${clock} ${isPm(time.hour) ? labels.pm : labels.am}`;
}

/**
 * 解析用户输入的时钟文本。接受 `:`、`：`、`.` 与空白作分隔符，也接受 `am` / `pm`
 * （可带点、任意大小写）。24 小时制拒绝 AM/PM；12 小时制的小时必须是 1–12，
 * 省略 AM/PM 时按上午处理。`seconds` 决定是否接受第三段数字。
 */
export function parseTimeInput(
  text: string,
  format: TimeFormat,
  seconds = false,
): TimeValue | null {
  const match =
    /^(\d{1,2})\s*[:：.]\s*(\d{1,2})(?:\s*[:：.]\s*(\d{1,2}))?(?:\s*([ap])\.?\s*m\.?)?$/i.exec(
      text.trim(),
    );
  if (!match) return null;

  const hour = Number(match[1]);
  const minute = Number(match[2]);
  const period = match[4]?.toLowerCase();
  if (minute > 59) return null;
  if (match[3] !== undefined) {
    if (!seconds) return null;
    if (Number(match[3]) > 59) return null;
  }

  const value: TimeValue = { hour: 0, minute };
  if (match[3] !== undefined) value.second = Number(match[3]);

  if (format === "24h") {
    if (period || hour > 23) return null;
    value.hour = hour;
    return value;
  }

  if (hour < 1 || hour > 12) return null;
  value.hour = setHour12(hour, period === "p");
  return value;
}

/** 表盘上某个位置相对圆心的坐标（百分比）。 */
export function dialPosition(angle: number, radius: number): { x: number; y: number } {
  const rad = (angle * Math.PI) / 180;
  return { x: 50 + radius * 50 * Math.sin(rad), y: 50 - radius * 50 * Math.cos(rad) };
}

export function hourDialLabels(format: TimeFormat): DialLabel[] {
  const steps = Array.from({ length: 12 }, (_, step) => step);

  if (format === "12h") {
    return steps.map((step) => {
      const value = step === 0 ? 12 : step;
      return { value, label: String(value), angle: step * 30, inner: false };
    });
  }

  return [
    ...steps.map((step) => ({ value: step, label: pad2(step), angle: step * 30, inner: false })),
    ...steps.map((step) => ({
      value: step + 12,
      label: pad2(step + 12),
      angle: step * 30,
      inner: true,
    })),
  ];
}

export function minuteDialLabels(): DialLabel[] {
  return Array.from({ length: 12 }, (_, step) => ({
    value: step * 5,
    label: pad2(step * 5),
    angle: step * 30,
    inner: false,
  }));
}

/** 指针相对圆心的偏移（已按半边长归一化）换算成角度，0 为 12 点方向。 */
export function pointerAngle(dx: number, dy: number): number {
  return mod((Math.atan2(dx, -dy) * 180) / Math.PI, 360);
}

/** 24 小时制里指针落在内圈还是外圈；拖动时每帧都重新判断，跨过分界就换圈。 */
export function isInnerRing(radius: number): boolean {
  return radius < RING_SPLIT;
}

export function hourFromAngle(angle: number, inner: boolean, format: TimeFormat): number {
  const step = Math.round(angle / 30) % 12;
  if (format === "12h") return step === 0 ? 12 : step;
  return inner ? step + 12 : step;
}

export function minuteFromAngle(angle: number): number {
  return Math.round(angle / 6) % 60;
}

/** 指针当前指向的角度：小时按 12 小时一圈，分钟 60 分钟一圈。 */
export function handAngle(hour: number, minute: number, mode: "hours" | "minutes"): number {
  return mode === "minutes" ? (minute % 60) * 6 : (hour % 12) * 30;
}

/** 选中数字所在的半径：24 小时制按小时分内外圈，12 小时制与分钟都在外圈。 */
export function handRadius(hour: number, mode: "hours" | "minutes", format: TimeFormat): number {
  if (mode === "minutes" || format === "12h") return OUTER_RING;
  return isPm(hour) ? INNER_RING : OUTER_RING;
}
