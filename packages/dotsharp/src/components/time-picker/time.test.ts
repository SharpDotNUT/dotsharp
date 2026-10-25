import { describe, expect, it } from "vite-plus/test";

import {
  formatTimeInput,
  handRadius,
  hourDialLabels,
  hourFromAngle,
  hourText,
  INNER_RING,
  isInnerRing,
  isPm,
  minuteDialLabels,
  minuteFromAngle,
  normalizeTime,
  OUTER_RING,
  parseTimeInput,
  pointerAngle,
  setHour12,
  stepHour,
  stepMinute,
  timeFromDate,
  timePlaceholder,
  toHour12,
  withPeriod,
} from "./time";

const labels = { am: "AM", pm: "PM" };

describe("time utilities", () => {
  it("formats the header fields", () => {
    expect(hourText({ hour: 7, minute: 5 }, "12h")).toBe("07");
    expect(hourText({ hour: 0, minute: 0 }, "12h")).toBe("12");
    expect(hourText({ hour: 20, minute: 0 }, "24h")).toBe("20");
  });

  it("round-trips the text value in both formats", () => {
    expect(formatTimeInput({ hour: 7, minute: 5 }, "12h", labels)).toBe("07:05 AM");
    expect(formatTimeInput({ hour: 20, minute: 0 }, "12h", labels)).toBe("08:00 PM");
    expect(formatTimeInput({ hour: 20, minute: 0 }, "24h", labels)).toBe("20:00");
    expect(formatTimeInput({ hour: 20, minute: 0, second: 7 }, "24h", labels, true)).toBe(
      "20:00:07",
    );
    expect(formatTimeInput({ hour: 7, minute: 5, second: 9 }, "12h", labels, true)).toBe(
      "07:05:09 AM",
    );

    expect(parseTimeInput("07:05 AM", "12h")).toEqual({ hour: 7, minute: 5 });
    expect(parseTimeInput("8:00 pm", "12h")).toEqual({ hour: 20, minute: 0 });
    expect(parseTimeInput("12:30 a.m.", "12h")).toEqual({ hour: 0, minute: 30 });
    expect(parseTimeInput("20:00", "24h")).toEqual({ hour: 20, minute: 0 });
    expect(parseTimeInput("7：5", "24h")).toEqual({ hour: 7, minute: 5 });
    expect(parseTimeInput("20:30:45", "24h", true)).toEqual({ hour: 20, minute: 30, second: 45 });
    expect(parseTimeInput("20:30", "24h", true)).toEqual({ hour: 20, minute: 30 });
    expect(parseTimeInput("7:05:09 pm", "12h", true)).toEqual({ hour: 19, minute: 5, second: 9 });
  });

  it("rejects seconds when they are disabled", () => {
    expect(parseTimeInput("20:30:45", "24h")).toBeNull();
    expect(parseTimeInput("20:30:60", "24h", true)).toBeNull();
  });

  it("rejects values outside the chosen format", () => {
    expect(parseTimeInput("20:00", "12h")).toBeNull();
    expect(parseTimeInput("0:00", "12h")).toBeNull();
    expect(parseTimeInput("13:00 pm", "12h")).toBeNull();
    expect(parseTimeInput("24:00", "24h")).toBeNull();
    expect(parseTimeInput("20:00 pm", "24h")).toBeNull();
    expect(parseTimeInput("12:60", "24h")).toBeNull();
    expect(parseTimeInput("1200", "24h")).toBeNull();
    expect(parseTimeInput("", "24h")).toBeNull();
  });

  it("converts between 12-hour display and 0–23", () => {
    expect(toHour12(0)).toBe(12);
    expect(toHour12(12)).toBe(12);
    expect(toHour12(13)).toBe(1);
    expect(isPm(11)).toBe(false);
    expect(isPm(12)).toBe(true);
    expect(setHour12(12, false)).toBe(0);
    expect(setHour12(12, true)).toBe(12);
    expect(setHour12(7, true)).toBe(19);
    expect(withPeriod(7, true)).toBe(19);
    expect(withPeriod(0, false)).toBe(0);
  });

  it("steps hours within the day", () => {
    expect(stepHour(11, 1)).toBe(12);
    expect(stepHour(12, 1)).toBe(13);
    expect(stepHour(23, 1)).toBe(0);
    expect(stepHour(0, -1)).toBe(23);
    expect(stepMinute(58, 5)).toBe(3);
    expect(stepMinute(0, -1)).toBe(59);
  });

  it("normalizes and derives times", () => {
    expect(normalizeTime({ hour: 25, minute: -1 })).toEqual({ hour: 1, minute: 59 });
    expect(normalizeTime({ hour: 1, minute: 2, second: 70 })).toEqual({
      hour: 1,
      minute: 2,
      second: 10,
    });
    expect(normalizeTime(null)).toBeNull();
    expect(normalizeTime({ hour: Number.NaN, minute: 0 })).toBeNull();
    expect(timeFromDate(new Date(2025, 7, 17, 20, 30))).toEqual({
      hour: 20,
      minute: 30,
      second: 0,
    });
    expect(timePlaceholder("12h")).toBe("hh:mm");
    expect(timePlaceholder("24h", true)).toBe("HH:MM");
    expect(timePlaceholder("12h", true, true)).toBe("hh:mm:ss AM");
    expect(timePlaceholder("24h", true, true)).toBe("HH:MM:SS");
  });

  it("lays out the 24-hour dial on two rings", () => {
    const outer = hourDialLabels("24h").filter((cell) => !cell.inner);
    const inner = hourDialLabels("24h").filter((cell) => cell.inner);

    expect(outer).toHaveLength(12);
    expect(inner).toHaveLength(12);
    expect(outer[0]).toMatchObject({ value: 0, label: "00", angle: 0 });
    expect(inner[0]).toMatchObject({ value: 12, label: "12", angle: 0 });
    expect(inner[1]).toMatchObject({ value: 13, angle: 30 });

    const twelveHour = hourDialLabels("12h");
    expect(twelveHour).toHaveLength(12);
    expect(twelveHour[0]).toMatchObject({ value: 12, label: "12" });
    expect(twelveHour[1]).toMatchObject({ value: 1, label: "1" });
  });

  it("labels the minute dial every five minutes", () => {
    const cells = minuteDialLabels();
    expect(cells).toHaveLength(12);
    expect(cells[0]).toMatchObject({ value: 0, label: "00" });
    expect(cells[3]).toMatchObject({ value: 15, label: "15", angle: 90 });
    expect(cells[7]).toMatchObject({ value: 35, label: "35" });
  });

  it("converts pointer offsets to values", () => {
    expect(pointerAngle(0, -1)).toBe(0);
    expect(pointerAngle(1, 0)).toBe(90);
    expect(pointerAngle(0, 1)).toBe(180);
    expect(pointerAngle(-1, 0)).toBe(270);

    expect(isInnerRing(0.5)).toBe(true);
    expect(isInnerRing(0.65)).toBe(true);
    expect(isInnerRing(0.67)).toBe(false);
    expect(isInnerRing(0.79)).toBe(false);

    expect(hourFromAngle(0, false, "24h")).toBe(0);
    expect(hourFromAngle(0, true, "24h")).toBe(12);
    expect(hourFromAngle(90, false, "24h")).toBe(3);
    expect(hourFromAngle(90, true, "24h")).toBe(15);
    expect(hourFromAngle(0, false, "12h")).toBe(12);
    expect(hourFromAngle(90, false, "12h")).toBe(3);
    expect(hourFromAngle(359, false, "24h")).toBe(0);

    expect(minuteFromAngle(0)).toBe(0);
    expect(minuteFromAngle(90)).toBe(15);
    expect(minuteFromAngle(42)).toBe(7);
    expect(minuteFromAngle(354)).toBe(59);
  });

  it("puts the hand on the ring that holds the value", () => {
    expect(handRadius(7, "hours", "12h")).toBe(OUTER_RING);
    expect(handRadius(7, "hours", "24h")).toBe(OUTER_RING);
    expect(handRadius(20, "hours", "24h")).toBe(INNER_RING);
    expect(handRadius(0, "minutes", "24h")).toBe(OUTER_RING);
  });
});
