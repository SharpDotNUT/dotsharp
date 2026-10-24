import { beforeEach, describe, expect, it, vi } from "vite-plus/test";

const MEDIA_QUERY = "(prefers-color-scheme: dark)";
const STORAGE_KEY = "dotsharp-theme";

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
});
