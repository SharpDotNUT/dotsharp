import { beforeEach, describe, expect, it, vi } from "vite-plus/test";

import { DEFAULT_SOURCE_COLOR, generateTokens } from "../theme/palette";

const MEDIA_QUERY = "(prefers-color-scheme: dark)";
const STORAGE_KEY = "dotsharp-theme";
const SOURCE_KEY = "dotsharp-source-color";

function mockMatchMedia(initial: boolean) {
  const listeners = new Set<(event: MediaQueryListEvent) => void>();

  const mql = {
    matches: initial,
    media: MEDIA_QUERY,
    onchange: null,
    addEventListener: (_type: string, listener: (event: MediaQueryListEvent) => void) => {
      listeners.add(listener);
    },
    removeEventListener: (_type: string, listener: (event: MediaQueryListEvent) => void) => {
      listeners.delete(listener);
    },
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => true,
  };

  const set = (next: boolean) => {
    mql.matches = next;
    for (const listener of listeners) {
      listener({ matches: next } as MediaQueryListEvent);
    }
  };

  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    writable: true,
    value: vi.fn(() => mql),
  });

  return { mql, set };
}

// `useTheme` holds module-level singleton state, so each test must load a fresh
// module instance after `vi.resetModules()`; a static import would be cached.
describe("useTheme", () => {
  beforeEach(() => {
    vi.resetModules();
    localStorage.clear();
    document.documentElement.removeAttribute("data-theme");
    document.documentElement.removeAttribute("style");
    mockMatchMedia(false);
  });

  it("defaults to system mode resolved as light", async () => {
    const { useTheme } = await import("./useTheme");
    const { theme, resolvedTheme } = useTheme();

    expect(theme.value).toBe("system");
    expect(resolvedTheme.value).toBe("light");
    expect(document.documentElement.dataset.theme).toBe("light");
  });

  it("restores a persisted theme", async () => {
    localStorage.setItem(STORAGE_KEY, "dark");

    const { useTheme } = await import("./useTheme");
    const { theme, resolvedTheme } = useTheme();

    expect(theme.value).toBe("dark");
    expect(resolvedTheme.value).toBe("dark");
    expect(document.documentElement.dataset.theme).toBe("dark");
  });

  it("applies and persists an explicit theme", async () => {
    const { useTheme } = await import("./useTheme");
    const { theme, resolvedTheme, setTheme } = useTheme();

    setTheme("dark");
    expect(theme.value).toBe("dark");
    expect(resolvedTheme.value).toBe("dark");
    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(localStorage.getItem(STORAGE_KEY)).toBe("dark");

    setTheme("light");
    expect(resolvedTheme.value).toBe("light");
    expect(document.documentElement.dataset.theme).toBe("light");
    expect(localStorage.getItem(STORAGE_KEY)).toBe("light");
  });

  it("follows the system preference while in system mode", async () => {
    const media = mockMatchMedia(false);

    const { useTheme } = await import("./useTheme");
    const { resolvedTheme } = useTheme();

    media.set(true);
    expect(resolvedTheme.value).toBe("dark");
    expect(document.documentElement.dataset.theme).toBe("dark");

    media.set(false);
    expect(resolvedTheme.value).toBe("light");
    expect(document.documentElement.dataset.theme).toBe("light");
  });

  it("leaves the stylesheet palette in place for the default source colour", async () => {
    const { useTheme } = await import("./useTheme");
    const { sourceColor } = useTheme();

    expect(sourceColor.value).toBe(DEFAULT_SOURCE_COLOR);
    // Nothing inline: consumer CSS can still override the default tokens.
    expect(document.documentElement.style.getPropertyValue("--ds-primary")).toBe("");
  });

  it("rebuilds the palette from a new source colour and persists it", async () => {
    const { useTheme } = await import("./useTheme");
    const { sourceColor, setSourceColor } = useTheme();

    setSourceColor("#0e9f8f");

    const expected = generateTokens("#0e9f8f", "light");
    expect(sourceColor.value).toBe("#0e9f8f");
    expect(localStorage.getItem(SOURCE_KEY)).toBe("#0e9f8f");
    expect(document.documentElement.style.getPropertyValue("--ds-primary")).toBe(expected.primary);
    expect(document.documentElement.style.getPropertyValue("--ds-bg")).toBe(expected.bg);
  });

  it("restores a persisted source colour", async () => {
    localStorage.setItem(SOURCE_KEY, "#0e9f8f");

    const { useTheme } = await import("./useTheme");
    const { sourceColor } = useTheme();

    expect(sourceColor.value).toBe("#0e9f8f");
    expect(document.documentElement.style.getPropertyValue("--ds-primary")).toBe(
      generateTokens("#0e9f8f", "light").primary,
    );
  });

  it("regenerates the palette for the resolved mode", async () => {
    const { useTheme } = await import("./useTheme");
    const { setTheme, setSourceColor } = useTheme();

    setSourceColor("#0e9f8f");
    setTheme("dark");

    const dark = generateTokens("#0e9f8f", "dark");
    expect(document.documentElement.style.getPropertyValue("--ds-bg")).toBe(dark.bg);
    expect(document.documentElement.style.getPropertyValue("--ds-text")).toBe(dark.text);
  });

  it("drops the inline tokens again when the default source colour returns", async () => {
    const { useTheme } = await import("./useTheme");
    const { setSourceColor } = useTheme();

    setSourceColor("#0e9f8f");
    expect(document.documentElement.style.getPropertyValue("--ds-bg")).not.toBe("");

    setSourceColor(DEFAULT_SOURCE_COLOR);
    expect(document.documentElement.style.getPropertyValue("--ds-bg")).toBe("");
    expect(localStorage.getItem(SOURCE_KEY)).toBe(DEFAULT_SOURCE_COLOR);
  });

  it("rejects an invalid source colour without touching the current palette", async () => {
    const { useTheme } = await import("./useTheme");
    const { sourceColor, setSourceColor } = useTheme();

    expect(() => setSourceColor("#12345")).toThrow(TypeError);
    expect(sourceColor.value).toBe(DEFAULT_SOURCE_COLOR);
    expect(localStorage.getItem(SOURCE_KEY)).toBeNull();
  });
});
