import { describe, expect, it } from "vite-plus/test";

import { buildSliderParts, SLIDER_THUMB_GAP, sliderActiveBounds, snapValue } from "./shared";

describe("snapValue", () => {
  it("吸附到步长并夹在区间内", () => {
    expect(snapValue(34, 0, 100, 20)).toBe(40);
    expect(snapValue(-30, 0, 100, 20)).toBe(0);
    expect(snapValue(130, 0, 100, 20)).toBe(100);
    expect(snapValue(0.30000000000000004, 0, 1, 0.1)).toBe(0.3);
  });
});

describe("sliderActiveBounds", () => {
  it("普通滑块从起点填充", () => {
    expect(sliderActiveBounds([40], 0, 100, false)).toEqual({ start: 0, end: 0.4, anchor: 0 });
  });

  it("居中滑块从 0 值处填充", () => {
    expect(sliderActiveBounds([25], -100, 100, true)).toEqual({
      start: 0.5,
      end: 0.625,
      anchor: 0.5,
    });
    expect(sliderActiveBounds([-10], -100, 100, true)).toEqual({
      start: 0.45,
      end: 0.5,
      anchor: 0.5,
    });
  });

  it("范围滑块填充两个手柄之间", () => {
    expect(sliderActiveBounds([30, 70], 0, 100, false)).toEqual({
      start: 0.3,
      end: 0.7,
      anchor: 0,
    });
  });
});

describe("buildSliderParts", () => {
  it("普通滑块的分段在手柄两侧留出间隙", () => {
    const parts = buildSliderParts([50], 0, 100, false);
    expect(parts).toHaveLength(2);

    expect(parts[0]).toMatchObject({
      active: true,
      start: 0,
      end: 0.5,
      startInset: 0,
      endInset: SLIDER_THUMB_GAP,
      startCorner: "outer",
      endCorner: "inner",
    });
    expect(parts[1]).toMatchObject({
      active: false,
      start: 0.5,
      end: 1,
      startInset: SLIDER_THUMB_GAP,
      endInset: 0,
      startCorner: "inner",
      endCorner: "outer",
    });
  });

  it("手柄位于端点时外端仍保留间隙，且圆角为胶囊形", () => {
    const [active] = buildSliderParts([0], 0, 100, false);
    expect(active).toMatchObject({ start: 0, end: 1, startInset: SLIDER_THUMB_GAP });
  });

  it("范围滑块中间段的两端都是内侧小圆角", () => {
    const parts = buildSliderParts([30, 70], 0, 100, false);
    expect(parts.map((part) => part.active)).toEqual([false, true, false]);
    expect(parts[1]).toMatchObject({
      startInset: SLIDER_THUMB_GAP,
      endInset: SLIDER_THUMB_GAP,
      startCorner: "inner",
      endCorner: "inner",
    });
  });

  it("居中滑块在 0 值处的接缝不内缩，用手柄处才留间隙", () => {
    const parts = buildSliderParts([25], -100, 100, true);
    expect(parts.map((part) => part.active)).toEqual([false, true, false]);

    const seam = parts[0]!;
    expect(seam.end).toBe(0.5);
    expect(seam.endInset).toBe(0);
    expect(seam.endCorner).toBe("square");
    expect(parts[1]).toMatchObject({
      start: 0.5,
      end: 0.625,
      startInset: 0,
      endInset: SLIDER_THUMB_GAP,
    });
  });

  it("范围滑块的端点手柄不会产生零宽分段", () => {
    const parts = buildSliderParts([0, 70], 0, 100, false);
    expect(parts.map((part) => part.active)).toEqual([true, false]);
  });
});
