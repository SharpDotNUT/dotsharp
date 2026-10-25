export type ProgressShape = "linear" | "circular";
/**
 * `detached`：进度与剩余轨道分成两段，中间留空；线性轨道末端带一个圆点。
 * `continuous`：整条 / 整圈背景，进度直接叠在上面。
 */
export type ProgressVariant = "detached" | "continuous";

/** 把值与上限换算成 0–1 的比例；非法值（`NaN`、`max <= 0`）按 0 处理。 */
export function progressFraction(value: number, max: number): number {
  if (!Number.isFinite(value) || !Number.isFinite(max) || max <= 0) return 0;
  return Math.min(1, Math.max(0, value / max));
}

/** 一段圆弧的虚线参数：`length` 为可见线长，`offset` 为沿圆周的起点（取负值）。 */
export interface ProgressDash {
  length: number;
  offset: number;
}

export interface CircularProgressArcs {
  /** 进度弧；长度为 0 时为 `null`。 */
  fill: ProgressDash | null;
  /** 剩余轨道弧；长度为 0 时为 `null`。 */
  track: ProgressDash | null;
}

/**
 * `detached` 圆环的两段弧。进度从 12 点顺时针填充，`fraction` 是它的圆周占比。
 *
 * 两段之间、以及 12 点的接缝处各留出 `gap` 的可见间隙；圆头端点（`stroke-linecap: round`）
 * 各向外延伸 `strokeWidth / 2`，所以沿圆周要多让出一个 `strokeWidth`。装不下间隙的那一段返回 `null`。
 */
export function circularProgressArcs(
  fraction: number,
  circumference: number,
  strokeWidth: number,
  gap: number,
): CircularProgressArcs {
  const clearance = gap + strokeWidth;
  const fillLength = fraction * circumference - clearance;
  const trackLength = (1 - fraction) * circumference - clearance;

  return {
    fill: fillLength > 0 ? { length: fillLength, offset: -clearance / 2 } : null,
    track:
      trackLength > 0
        ? { length: trackLength, offset: -(fraction * circumference + clearance / 2) }
        : null,
  };
}
