import { computed, ref, type ComputedRef } from "vue";

import {
  DEFAULT_SOURCE_COLOR,
  TOKEN_NAMES,
  generateTokens,
  normalizeSourceColor,
} from "../theme/palette";

export type ThemeMode = "system" | "light" | "dark";
export type ResolvedTheme = "light" | "dark";

export interface UseThemeReturn {
  theme: ComputedRef<ThemeMode>;
  resolvedTheme: ComputedRef<ResolvedTheme>;
  /** The single colour every `--ds-*` token is generated from. */
  sourceColor: ComputedRef<string>;
  setTheme: (mode: ThemeMode) => void;
  /** Rebuilds the whole palette from one colour (`#a855f7`, `a855f7`, `#a8f`). */
  setSourceColor: (color: string) => void;
}

const STORAGE_KEY = "dotsharp-theme";
const SOURCE_KEY = "dotsharp-source-color";
const MEDIA_QUERY = "(prefers-color-scheme: dark)";
const THEME_MODES: readonly ThemeMode[] = ["system", "light", "dark"];

const mode = ref<ThemeMode>("system");
const systemDark = ref(false);
const sourceColor = ref<string>(DEFAULT_SOURCE_COLOR);

let initialized = false;

const theme = computed<ThemeMode>(() => mode.value);

const resolvedTheme = computed<ResolvedTheme>(() =>
  mode.value === "system" ? (systemDark.value ? "dark" : "light") : mode.value,
);

function isThemeMode(value: string): value is ThemeMode {
  return (THEME_MODES as readonly string[]).includes(value);
}

function read(key: string): string | null {
  if (typeof window === "undefined") return null;

  try {
    return window.localStorage.getItem(key);
  } catch {
    // Storage may be unavailable (private mode, blocked cookies). Ignore.
    return null;
  }
}

function persist(key: string, value: string): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Persisting is best effort only.
  }
}

function applyTheme(): void {
  if (typeof document === "undefined") return;

  const root = document.documentElement;
  root.dataset.theme = resolvedTheme.value;

  // The stylesheet already ships the default palette, so leaving the tokens
  // alone keeps them overridable from consumer CSS.
  if (sourceColor.value === DEFAULT_SOURCE_COLOR) {
    for (const name of TOKEN_NAMES) root.style.removeProperty(`--ds-${name}`);
    return;
  }

  const tokens = generateTokens(sourceColor.value, resolvedTheme.value);
  for (const name of TOKEN_NAMES) root.style.setProperty(`--ds-${name}`, tokens[name]);
}

function handleSystemChange(event: MediaQueryListEvent): void {
  systemDark.value = event.matches;
  if (mode.value === "system") applyTheme();
}

function init(): void {
  if (initialized) return;
  initialized = true;

  if (typeof window === "undefined") return;

  const storedTheme = read(STORAGE_KEY);
  if (storedTheme !== null && isThemeMode(storedTheme)) mode.value = storedTheme;

  const storedSource = read(SOURCE_KEY);
  if (storedSource !== null) {
    try {
      sourceColor.value = normalizeSourceColor(storedSource);
    } catch {
      // A corrupt entry falls back to the default palette.
    }
  }

  if (typeof window.matchMedia === "function") {
    const query = window.matchMedia(MEDIA_QUERY);
    systemDark.value = query.matches;
    query.addEventListener("change", handleSystemChange);
  }

  applyTheme();
}

function setTheme(next: ThemeMode): void {
  init();
  mode.value = next;

  persist(STORAGE_KEY, next);
  applyTheme();
}

function setSourceColor(color: string): void {
  init();
  sourceColor.value = normalizeSourceColor(color);

  persist(SOURCE_KEY, sourceColor.value);
  applyTheme();
}

export function useTheme(): UseThemeReturn {
  init();
  return {
    theme,
    resolvedTheme,
    sourceColor: computed(() => sourceColor.value),
    setTheme,
    setSourceColor,
  };
}
