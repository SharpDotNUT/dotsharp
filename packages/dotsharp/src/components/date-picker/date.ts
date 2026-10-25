import type { DateOrder } from "../../i18n";

/** 日期组件的所有日期都是本地时区的零点，避免夏令时把时间推来推去。 */
export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function today(): Date {
  return startOfDay(new Date());
}

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

export function addDays(date: Date, amount: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + amount);
}

export function addMonths(date: Date, amount: number): Date {
  const target = new Date(date.getFullYear(), date.getMonth() + amount, 1);
  target.setDate(Math.min(date.getDate(), daysInMonth(target.getFullYear(), target.getMonth())));
  return startOfDay(target);
}

export function addYears(date: Date, amount: number): Date {
  return addMonths(date, amount * 12);
}

export function sameDay(a: Date | null, b: Date | null): boolean {
  if (!a || !b) return false;
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function sameMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

/** 本地日期键，用作日历格子的 `data-date`。 */
export function toISODate(date: Date): string {
  const year = String(date.getFullYear()).padStart(4, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** 输入框里显示/占位的数字顺序，例如 `mm/dd/yyyy`。 */
export function datePlaceholder(order: DateOrder, upper = false): string {
  const pattern = order === "mdy" ? "mm/dd/yyyy" : order === "dmy" ? "dd/mm/yyyy" : "yyyy/mm/dd";
  return upper ? pattern.toUpperCase() : pattern;
}

function pad(value: number, length = 2): string {
  return String(value).padStart(length, "0");
}

export function formatDateInput(date: Date, order: DateOrder): string {
  const year = pad(date.getFullYear(), 4);
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  if (order === "dmy") return `${day}/${month}/${year}`;
  if (order === "ymd") return `${year}/${month}/${day}`;
  return `${month}/${day}/${year}`;
}

/**
 * 解析用户输入的数字日期。接受 `/`、`-`、`.` 与空白作分隔符，
 * 年份必须写满四位；非法日期（例如 2 月 30 日）返回 `null`。
 */
export function parseDateInput(text: string, order: DateOrder): Date | null {
  const match = text.trim().match(/^(\d{1,4})[/\-.\s]+(\d{1,4})[/\-.\s]+(\d{1,4})$/);
  if (!match) return null;

  const [, first, second, third] = match;
  const rawYear = order === "ymd" ? first! : third!;
  const year = Number(rawYear);
  const month = Number(order === "mdy" ? first : second);
  const day = Number(order === "mdy" ? second : order === "dmy" ? first : third);

  if (!/^\d{4}$/.test(rawYear) || year < 1) return null;
  if (!Number.isInteger(month) || month < 1 || month > 12) return null;
  if (!Number.isInteger(day) || day < 1 || day > daysInMonth(year, month - 1)) return null;

  return new Date(year, month - 1, day);
}

function formatter(locale: string, options: Intl.DateTimeFormatOptions): Intl.DateTimeFormat {
  return new Intl.DateTimeFormat(locale, { ...options, timeZone: "UTC" });
}

/** 语言下的月份名称，从一月开始。固定用 UTC，服务端与浏览器结果一致。 */
export function monthNames(locale: string, width: "long" | "short" = "long"): string[] {
  const format = formatter(locale, { month: width });
  return Array.from({ length: 12 }, (_, month) =>
    format.format(new Date(Date.UTC(2023, month, 1))),
  );
}

/** 语言下的星期名称，从周日开始（调用方按一周首日自行旋转）。 */
export function weekdayNames(locale: string, width: "narrow" | "short" | "long"): string[] {
  const format = formatter(locale, { weekday: width });
  return Array.from({ length: 7 }, (_, index) =>
    format.format(new Date(Date.UTC(2023, 0, 1 + index))),
  );
}

/** 头部的大号日期，例如 `Mon, Aug 17`。 */
export function formatDateLong(date: Date, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(date);
}

/** 月份与年份，例如 `August 2025`。输入是本地日期，按本地时区格式化。 */
export function formatMonthYear(date: Date, locale: string): string {
  return new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(date);
}

/** 日历格子的无障碍名称，例如 `Sunday, August 17, 2025`。 */
export function formatDateFull(date: Date, locale: string): string {
  return new Intl.DateTimeFormat(locale, { dateStyle: "full" }).format(date);
}
