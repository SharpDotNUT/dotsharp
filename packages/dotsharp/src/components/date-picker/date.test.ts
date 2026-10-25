import { describe, expect, it } from "vite-plus/test";

import {
  addMonths,
  datePlaceholder,
  daysInMonth,
  formatDateInput,
  formatDateLong,
  formatMonthYear,
  monthNames,
  parseDateInput,
  startOfDay,
  toISODate,
  weekdayNames,
} from "./date";

describe("date utilities", () => {
  it("formats and parses the three input orders", () => {
    const date = new Date(2025, 7, 17);

    expect(formatDateInput(date, "mdy")).toBe("08/17/2025");
    expect(formatDateInput(date, "dmy")).toBe("17/08/2025");
    expect(formatDateInput(date, "ymd")).toBe("2025/08/17");

    expect(toISODate(parseDateInput("08/17/2025", "mdy")!)).toBe("2025-08-17");
    expect(toISODate(parseDateInput("17.08.2025", "dmy")!)).toBe("2025-08-17");
    expect(toISODate(parseDateInput("2025-8-17", "ymd")!)).toBe("2025-08-17");
  });

  it("rejects invalid dates", () => {
    expect(parseDateInput("02/30/2025", "mdy")).toBeNull();
    expect(parseDateInput("01/13/2025", "dmy")).toBeNull();
    expect(parseDateInput("32/01/2025", "dmy")).toBeNull();
    expect(parseDateInput("01/01/25", "mdy")).toBeNull();
    expect(parseDateInput("", "mdy")).toBeNull();
    expect(parseDateInput("2025/08", "ymd")).toBeNull();
    expect(parseDateInput("17/08/2025", "mdy")).toBeNull();
  });

  it("accepts leap days only in leap years", () => {
    expect(parseDateInput("02/29/2024", "mdy")).not.toBeNull();
    expect(parseDateInput("02/29/2025", "mdy")).toBeNull();
    expect(daysInMonth(2024, 1)).toBe(29);
    expect(daysInMonth(2025, 1)).toBe(28);
  });

  it("exposes lowercase and uppercase placeholders", () => {
    expect(datePlaceholder("mdy")).toBe("mm/dd/yyyy");
    expect(datePlaceholder("ymd", true)).toBe("YYYY/MM/DD");
  });

  it("clamps month arithmetic to the last day", () => {
    expect(toISODate(addMonths(new Date(2025, 0, 31), 1))).toBe("2025-02-28");
    expect(toISODate(addMonths(new Date(2024, 0, 31), 1))).toBe("2024-02-29");
    expect(toISODate(addMonths(new Date(2025, 0, 15), -1))).toBe("2024-12-15");
  });

  it("normalizes to local midnight", () => {
    const date = startOfDay(new Date(2025, 7, 17, 23, 59, 59));
    expect(date.getHours()).toBe(0);
    expect(date.getMinutes()).toBe(0);
    expect(toISODate(date)).toBe("2025-08-17");
  });

  it("formats month and weekday names with Intl", () => {
    const months = monthNames("en");
    expect(months).toHaveLength(12);
    expect(months[7]).toBe("August");
    expect(monthNames("ja")[0]).toContain("1");
    expect(weekdayNames("en", "narrow")).toHaveLength(7);
    expect(weekdayNames("en", "narrow")[0]).toBe("S");
    expect(formatMonthYear(new Date(2025, 7, 17), "en")).toBe("August 2025");
    expect(formatDateLong(new Date(2025, 7, 17), "en")).toContain("Aug");
  });
});
