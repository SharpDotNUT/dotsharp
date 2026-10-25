import { afterEach, describe, expect, it, vi } from "vite-plus/test";

import {
  canonicalLocale,
  getDateOrder,
  getFirstDayOfWeek,
  getTimeFormat,
  isLocaleRegistered,
  matchLocale,
  registerLocale,
  setLocale,
  t,
  useI18n,
} from "./index";

afterEach(() => {
  setLocale("en");
  vi.restoreAllMocks();
});

describe("i18n", () => {
  it("ships en, zh-Hans, zh-Hant and ja", () => {
    for (const code of ["en", "zh-Hans", "zh-Hant", "ja"]) {
      expect(isLocaleRegistered(code)).toBe(true);
      expect(setLocale(code)).toBe(true);
      expect(t("cancel")).not.toBe("");
    }
  });

  it("follows the locale date order", () => {
    setLocale("en");
    expect(getDateOrder()).toBe("mdy");
    setLocale("zh-Hans");
    expect(getDateOrder()).toBe("ymd");
    setLocale("ja");
    expect(getDateOrder()).toBe("ymd");
  });

  it("follows the locale time format", () => {
    setLocale("en");
    expect(getTimeFormat()).toBe("12h");
    expect(useI18n().timeFormat.value).toBe("12h");
    setLocale("zh-Hans");
    expect(getTimeFormat()).toBe("24h");
    setLocale("ja");
    expect(getTimeFormat()).toBe("24h");
    registerLocale("ja", {}, { timeFormat: "12h" });
    expect(getTimeFormat()).toBe("12h");
  });

  it("switches the reactive locale", () => {
    const i18n = useI18n();
    setLocale("ja");
    expect(i18n.locale.value).toBe("ja");
    expect(i18n.intlLocale.value).toBe("ja");
    expect(i18n.order.value).toBe("ymd");
  });

  it("canonicalizes locale codes", () => {
    expect(canonicalLocale("zh-hant")).toBe("zh-Hant");
    expect(setLocale("zh-hant")).toBe(true);
    expect(useI18n().locale.value).toBe("zh-Hant");
  });

  it("rejects unregistered locales", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(setLocale("xx")).toBe(false);
    expect(useI18n().locale.value).toBe("en");
    expect(warn).toHaveBeenCalled();
  });

  it("registers a custom locale with partial messages and options", () => {
    registerLocale("fr", { cancel: "Annuler", ok: "Valider" }, { order: "dmy" });

    expect(setLocale("fr")).toBe(true);
    expect(t("cancel")).toBe("Annuler");
    expect(t("ok")).toBe("Valider");
    // 未提供的字段回退到英文。
    expect(t("selectDate")).toBe("Select date");
    expect(getDateOrder()).toBe("dmy");
  });

  it("allows overriding a built-in locale", () => {
    registerLocale("ja", { ok: "決定" });
    setLocale("ja");
    expect(t("ok")).toBe("決定");
    expect(t("cancel")).toBe("キャンセル");
  });

  it("matches browser languages against supported locales", () => {
    const supported = ["en", "zh-Hans", "zh-Hant", "ja"];

    expect(matchLocale(supported, ["ja-JP"])).toBe("ja");
    expect(matchLocale(supported, ["zh-TW"])).toBe("zh-Hant");
    expect(matchLocale(supported, ["zh-HK"])).toBe("zh-Hant");
    expect(matchLocale(supported, ["zh-CN"])).toBe("zh-Hans");
    expect(matchLocale(supported, ["en-GB"])).toBe("en");
    expect(matchLocale(supported, ["fr-FR", "zh-SG"])).toBe("zh-Hans");
    expect(matchLocale(supported, ["fr-FR"])).toBeUndefined();
    expect(matchLocale([], ["en"])).toBeUndefined();
  });

  it("prefers an exact match over a language match", () => {
    expect(matchLocale(["en", "zh-Hant"], ["zh-Hans"])).toBe("zh-Hant");
    expect(matchLocale(["zh-Hans", "zh-Hant"], ["zh-Hant-HK"])).toBe("zh-Hant");
  });

  it("derives the first day of the week from Intl", () => {
    setLocale("en");
    expect(getFirstDayOfWeek()).toBeGreaterThanOrEqual(1);
    expect(getFirstDayOfWeek()).toBeLessThanOrEqual(7);

    registerLocale("en", {}, { firstDayOfWeek: 1 });
    expect(getFirstDayOfWeek()).toBe(1);
  });
});
