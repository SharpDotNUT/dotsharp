import { describe, expect, it } from "vite-plus/test";

import { formatBadgeValue } from "./shared";

describe("formatBadgeValue", () => {
  it("省略值或空字符串表示小圆点", () => {
    expect(formatBadgeValue(undefined)).toBe("");
    expect(formatBadgeValue("")).toBe("");
    expect(formatBadgeValue(Number.NaN)).toBe("");
    expect(formatBadgeValue(Number.POSITIVE_INFINITY)).toBe("");
  });

  it("数字超过上限时折叠为 `${max}+`", () => {
    expect(formatBadgeValue(1)).toBe("1");
    expect(formatBadgeValue(99)).toBe("99");
    expect(formatBadgeValue(100)).toBe("99+");
    expect(formatBadgeValue(1500, 9)).toBe("9+");
  });

  it("字符串原样显示，不参与上限换算", () => {
    expect(formatBadgeValue("NEW")).toBe("NEW");
    expect(formatBadgeValue("100")).toBe("100");
    expect(formatBadgeValue(0)).toBe("0");
  });
});
