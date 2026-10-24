import { computed, ref, type ComputedRef } from "vue";

export type ThemeMode = "system" | "light" | "dark";
export type ResolvedTheme = "light" | "dark";

export interface UseThemeReturn {
  theme: ComputedRef<ThemeMode>;
  resolvedTheme: ComputedRef<ResolvedTheme>;
  setTheme: (mode: ThemeMode) => void;
}

const STORAGE_KEY = "dotsharp-theme";
const MEDIA_QUERY = "(prefers-color-scheme: dark)";
const THEME_MODES: readonly ThemeMode[] = ["system", "light", "dark"];

const mode = ref<ThemeMode>("system");
const systemDark = ref(false);

let initialized = false;

const theme = computed<ThemeMode>(() => mode.value);

const resolvedTheme = computed<ResolvedTheme>(() =>
  mode.value === "system" ? (systemDark.value ? "dark" : "light") : mode.value,
);

function isThemeMode(value: string): value is ThemeMode {
  return (THEME_MODES as readonly string[]).includes(value);
}

function applyTheme(): void {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.theme = resolvedTheme.value;
}

function handleSystemChange(event: MediaQueryListEvent): void {
  systemDark.value = event.matches;
  if (mode.value === "system") applyTheme();
}

function init(): void {
  if (initialized) return;
  initialized = true;

  if (typeof window === "undefined") return;

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored !== null && isThemeMode(stored)) mode.value = stored;
  } catch {
    // Storage may be unavailable (private mode, blocked cookies). Ignore.
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

  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Persisting is best effort only.
    }
  }

  applyTheme();
}

export function useTheme(): UseThemeReturn {
  init();
  return { theme, resolvedTheme, setTheme };
}
