import { describe, expect, it } from "vite-plus/test";

import { circularProgressArcs, progressFraction } from "./shared";

describe("progressFraction", () => {
  it("按上限换算成 0–1 的比例", () => {
    expect(progressFraction(0, 100)).toBe(0);
    expect(progressFraction(40, 100)).toBe(0.4);
    expect(progressFraction(3, 8)).toBe(0.375);
  });

  it("超出范围与非法值被夹住", () => {
    expect(progressFraction(120, 100)).toBe(1);
    expect(progressFraction(-5, 100)).toBe(0);
    expect(progressFraction(Number.NaN, 100)).toBe(0);
    expect(progressFraction(50, 0)).toBe(0);
    expect(progressFraction(50, -100)).toBe(0);
  });
});

describe("circularProgressArcs", () => {
  // 周长 100、线宽 4、间隙 4：每段两端各要让出 (4 + 4) / 2。
  const args = [100, 4, 4] as const;

  it("两段各让出间隙与圆头端点", () => {
    const { fill, track } = circularProgressArcs(0.5, ...args);
    expect(fill).toEqual({ length: 42, offset: -4 });
    expect(track).toEqual({ length: 42, offset: -54 });
  });

  it("两段长度加上让出的间隙正好是整圈", () => {
    const { fill, track } = circularProgressArcs(0.3, ...args);
    const clearance = 2 * (4 + 4);
    expect((fill?.length ?? 0) + (track?.length ?? 0) + clearance).toBeCloseTo(100);
  });

  it("空进度没有进度弧，满进度没有剩余弧", () => {
    expect(circularProgressArcs(0, ...args)).toEqual({
      fill: null,
      track: { length: 92, offset: -4 },
    });
    expect(circularProgressArcs(1, ...args)).toEqual({
      fill: { length: 92, offset: -4 },
      track: null,
    });
  });

  it("装不下间隙的一段直接省略", () => {
    const { fill, track } = circularProgressArcs(0.05, ...args);
    expect(fill).toBeNull();
    expect(track?.length).toBeCloseTo(87);
  });
});
