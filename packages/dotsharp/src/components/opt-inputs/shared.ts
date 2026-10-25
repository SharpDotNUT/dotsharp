/** 允许输入的字符集：数字、英文字母、数字与字母、任意单一字符（含空白与符号）。 */
export type OptInputsAccept = "numeric" | "alpha" | "alphanumeric" | "any";

/** 字母大小写转换；`none` 保持原样。 */
export type OptInputsLetterCase = "none" | "uppercase" | "lowercase";

const ACCEPT_PATTERNS: Record<OptInputsAccept, RegExp> = {
  numeric: /^[0-9]$/,
  alpha: /^[A-Za-z]$/,
  alphanumeric: /^[A-Za-z0-9]$/,
  // `u` 让一个 emoji 之类的码点算作一个字符，而不是两个代理项。
  any: /^[\s\S]$/u,
};

/** 按码点拆分文本并只保留允许的字符；剪贴板粘贴与外部模型都走这里。 */
export function filterOptChars(text: string, accept: OptInputsAccept): string[] {
  return Array.from(text).filter((char) => ACCEPT_PATTERNS[accept].test(char));
}

/** 大小写转换后仍须是单个码点（如 `ß` 的大写是 `SS`，此时保持原样）。 */
function convertCase(char: string, letterCase: OptInputsLetterCase): string {
  if (letterCase === "none") return char;

  const converted = letterCase === "uppercase" ? char.toUpperCase() : char.toLowerCase();
  return Array.from(converted).length === 1 ? converted : char;
}

/** 过滤字符集并统一大小写，输入、粘贴、外部模型共用同一条清洗管线。 */
export function sanitizeOptChars(
  text: string,
  accept: OptInputsAccept,
  letterCase: OptInputsLetterCase = "none",
): string[] {
  return filterOptChars(text, accept).map((char) => convertCase(char, letterCase));
}

/** 过滤并截断到槽位数量，得到组件真正对外暴露的值。 */
export function normalizeOptValue(
  value: string,
  accept: OptInputsAccept,
  length: number,
  letterCase: OptInputsLetterCase = "none",
): string {
  return sanitizeOptChars(value, accept, letterCase).slice(0, Math.max(0, length)).join("");
}

/**
 * 从 `start` 开始把已过滤的字符覆盖写入 `current`，返回新值。
 * 起点落在已有内容之后时从第一个空位追加，越界时写在最后一格。
 */
export function applyOptChars(
  current: string,
  start: number,
  accepted: string[],
  length: number,
): string {
  if (!accepted.length || length <= 0) return current.slice(0, Math.max(0, length));

  const chars = Array.from(current).slice(0, length);
  const from = Math.min(start, chars.length, length - 1);

  accepted.forEach((char, offset) => {
    const target = from + offset;
    if (target < length) chars[target] = char;
  });

  return chars.join("");
}

/** 删除某一格；其后的字符整体左移，值保持连续。 */
export function removeOptChar(current: string, index: number): string {
  const chars = Array.from(current);
  if (index >= 0 && index < chars.length) chars.splice(index, 1);
  return chars.join("");
}
