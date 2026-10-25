import {
  Hct,
  SchemeTonalSpot,
  TonalPalette,
  argbFromHex,
  hexFromArgb,
} from "@material/material-color-utilities";

/*
 * One source colour in, one complete palette out.
 *
 * The source is read in HCT (hue / chroma / tone) and expanded into Material 3
 * tonal palettes: fixed hue, gamut-limited chroma, and 0–100 tones. Every
 * `--ds-*` token is a tone picked from one of those palettes, so changing the
 * source colour restyles the whole theme while keeping the light / dark
 * relationships and contrast intact.
 */

export type PaletteMode = "light" | "dark";

export type ThemeTokens = Record<string, string>;

export const DEFAULT_SOURCE_COLOR = "#a855f7";

/** Success has no Material role; it keeps a fixed hue so states stay recognisable. */
const SUCCESS_PALETTE = TonalPalette.fromHueAndChroma(145, 44);

type PaletteName = "primary" | "secondary" | "neutral" | "neutralVariant" | "error" | "success";

interface TokenSpec {
  palette: PaletteName;
  tone: number;
  /** Overrides the mode's default focus alpha; used by the scrim. */
  alpha?: number;
}

const LIGHT_TOKENS: Record<string, TokenSpec> = {
  bg: { palette: "neutral", tone: 99 },
  surface: { palette: "neutral", tone: 96 },
  "surface-hover": { palette: "neutral", tone: 90 },
  elevated: { palette: "neutral", tone: 98 },
  "elevated-hover": { palette: "neutral", tone: 92 },
  tonal: { palette: "secondary", tone: 90 },
  "tonal-hover": { palette: "secondary", tone: 85 },
  "on-tonal": { palette: "secondary", tone: 10 },
  secondary: { palette: "secondary", tone: 40 },
  border: { palette: "neutralVariant", tone: 85 },
  outline: { palette: "neutralVariant", tone: 50 },
  text: { palette: "neutral", tone: 10 },
  "text-muted": { palette: "neutralVariant", tone: 30 },
  primary: { palette: "primary", tone: 90 },
  "primary-hover": { palette: "primary", tone: 85 },
  "primary-strong": { palette: "primary", tone: 40 },
  "on-primary": { palette: "primary", tone: 10 },
  error: { palette: "error", tone: 40 },
  "on-error": { palette: "error", tone: 100 },
  success: { palette: "success", tone: 35 },
  scrim: { palette: "neutral", tone: 0, alpha: 0.32 },
};

const DARK_TOKENS: Record<string, TokenSpec> = {
  bg: { palette: "neutral", tone: 6 },
  surface: { palette: "neutral", tone: 10 },
  "surface-hover": { palette: "neutral", tone: 16 },
  elevated: { palette: "neutral", tone: 13 },
  "elevated-hover": { palette: "neutral", tone: 19 },
  tonal: { palette: "secondary", tone: 30 },
  "tonal-hover": { palette: "secondary", tone: 35 },
  "on-tonal": { palette: "secondary", tone: 90 },
  secondary: { palette: "secondary", tone: 80 },
  border: { palette: "neutralVariant", tone: 30 },
  outline: { palette: "neutralVariant", tone: 60 },
  text: { palette: "neutral", tone: 90 },
  "text-muted": { palette: "neutralVariant", tone: 80 },
  primary: { palette: "primary", tone: 30 },
  "primary-hover": { palette: "primary", tone: 35 },
  "primary-strong": { palette: "primary", tone: 80 },
  "on-primary": { palette: "primary", tone: 90 },
  error: { palette: "error", tone: 80 },
  "on-error": { palette: "error", tone: 20 },
  success: { palette: "success", tone: 75 },
  scrim: { palette: "neutral", tone: 0, alpha: 0.32 },
};

const FOCUS_ALPHA: Record<PaletteMode, number> = { light: 0.35, dark: 0.4 };

const cache = new Map<string, ThemeTokens>();

/** Accepts `#a855f7`, `a855f7` or the 3-digit form and returns `#rrggbb`. */
export function normalizeSourceColor(value: string): string {
  const match = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(value.trim());
  if (match === null) throw new TypeError(`Invalid source colour: ${value}`);

  const hex = match[1].toLowerCase();
  if (hex.length === 6) return `#${hex}`;

  return `#${hex[0]}${hex[0]}${hex[1]}${hex[1]}${hex[2]}${hex[2]}`;
}

function withAlpha(hex: string, alpha: number): string {
  const byte = Math.round(alpha * 255)
    .toString(16)
    .padStart(2, "0");
  return `${hex}${byte}`;
}

/**
 * Expands a single source colour into the values of every `--ds-*` token.
 * Keys are unprefixed (`bg`, `primary-strong`, …); the caller adds `--ds-`.
 */
export function generateTokens(source: string, mode: PaletteMode): ThemeTokens {
  const color = normalizeSourceColor(source);
  const cacheKey = `${color}:${mode}`;
  const cached = cache.get(cacheKey);
  if (cached !== undefined) return cached;

  const scheme = new SchemeTonalSpot(Hct.fromInt(argbFromHex(color)), mode === "dark", 0);
  const palettes: Record<PaletteName, TonalPalette> = {
    primary: scheme.primaryPalette,
    secondary: scheme.secondaryPalette,
    neutral: scheme.neutralPalette,
    neutralVariant: scheme.neutralVariantPalette,
    error: scheme.errorPalette,
    success: SUCCESS_PALETTE,
  };

  const specs = mode === "dark" ? DARK_TOKENS : LIGHT_TOKENS;
  const tokens: ThemeTokens = {};

  for (const [name, spec] of Object.entries(specs)) {
    const hex = hexFromArgb(palettes[spec.palette].tone(spec.tone));
    tokens[name] = spec.alpha === undefined ? hex : withAlpha(hex, spec.alpha);
  }

  tokens["focus-ring"] = withAlpha(tokens["primary-strong"], FOCUS_ALPHA[mode]);
  cache.set(cacheKey, tokens);
  return tokens;
}

/** Every token the generator produces, for callers that write them to the DOM. */
export const TOKEN_NAMES: readonly string[] = Object.keys(
  generateTokens(DEFAULT_SOURCE_COLOR, "light"),
);
