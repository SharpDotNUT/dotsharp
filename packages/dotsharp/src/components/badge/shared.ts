/**
 * 把徽标的值格式化成可见文本。省略值（`undefined`）或空字符串表示小圆点，
 * 数字超过 `max` 时折叠成 `${max}+`。
 */
export function formatBadgeValue(value: string | number | undefined, max = 99): string {
  if (value === undefined) return "";

  if (typeof value === "number") {
    if (!Number.isFinite(value)) return "";
    if (Number.isFinite(max) && value > max) return `${max}+`;
  }

  return String(value);
}
