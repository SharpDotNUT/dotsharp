import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";

import { describe, expect, it } from "vite-plus/test";

import { DEFAULT_SOURCE_COLOR, generateTokens, normalizeSourceColor } from "./palette";

/*
 * `?raw` returns an empty string for stylesheets in the Vitest pipeline, and
 * `import.meta.url` is not a file URL there, so resolve the stylesheet from the
 * working directory instead (works from the workspace root and the package).
 */
function readStylesheet(): string {
  let dir = process.cwd();

  for (;;) {
    for (const candidate of [
      join(dir, "packages/dotsharp/src/styles/index.css"),
      join(dir, "src/styles/index.css"),
    ]) {
      if (existsSync(candidate)) return readFileSync(candidate, "utf8");
    }

    const parent = dirname(dir);
    if (parent === dir) throw new Error("Cannot locate src/styles/index.css");
    dir = parent;
  }
}

const css = readStylesheet();

/** Extracts `--ds-*` declarations from the block that starts at `selector`. */
function declarations(selector: string): Record<string, string> {
  const start = css.indexOf(selector);
  if (start === -1) throw new Error(`Stylesheet is missing \`${selector}\``);

  const open = css.indexOf("{", start);
  const close = css.indexOf("}", open);
  const body = css.slice(open + 1, close);

  const found: Record<string, string> = {};
  for (const match of body.matchAll(/--ds-([\w-]+):\s*([^;]+);/g)) {
    found[match[1]] = match[2].trim();
  }
  return found;
}

describe("generateTokens", () => {
  it("expands one source colour into every token for both modes", () => {
    const light = generateTokens(DEFAULT_SOURCE_COLOR, "light");
    const dark = generateTokens(DEFAULT_SOURCE_COLOR, "dark");

    expect(Object.keys(light).sort()).toEqual(Object.keys(dark).sort());
    for (const value of Object.values(light)) expect(value).toMatch(/^#[0-9a-f]{6}([0-9a-f]{2})?$/);

    // Roles must not collapse into each other.
    expect(light.primary).not.toBe(light["primary-strong"]);
    expect(light.bg).not.toBe(dark.bg);
    expect(light.text).not.toBe(dark.text);
  });

  it("keeps the same role tones when only the hue changes", () => {
    const purple = generateTokens("#a855f7", "light");
    const teal = generateTokens("#0e9f8f", "light");

    // Same tone table, different hue: lightness roles stay stable.
    expect(purple.bg).not.toBe(teal.bg);
    expect(purple.text).not.toBe(teal.text);
    expect(generateTokens("#0e9f8f", "light")).toBe(teal);
  });

  it("keeps text and control pairs readable for any source hue", () => {
    const ratio = (a: string, b: string): number => {
      const luminance = (hex: string): number => {
        const channels = [1, 3, 5].map((offset) => {
          const value = Number.parseInt(hex.slice(offset, offset + 2), 16) / 255;
          return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
        });
        return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
      };

      const [lighter, darker] = [luminance(a), luminance(b)].sort((x, y) => y - x);
      return (lighter + 0.05) / (darker + 0.05);
    };

    for (const source of ["#a855f7", "#0e9f8f", "#e0a000", "#2563eb", "#dc2626"]) {
      for (const mode of ["light", "dark"] as const) {
        const tokens = generateTokens(source, mode);

        expect(ratio(tokens.text, tokens.bg)).toBeGreaterThanOrEqual(4.5);
        expect(ratio(tokens["text-muted"], tokens.surface)).toBeGreaterThanOrEqual(4.5);
        expect(ratio(tokens["on-primary"], tokens.primary)).toBeGreaterThanOrEqual(4.5);
        expect(ratio(tokens["on-tonal"], tokens.tonal)).toBeGreaterThanOrEqual(4.5);
        expect(ratio(tokens.secondary, tokens.surface)).toBeGreaterThanOrEqual(4.5);
        expect(ratio(tokens.error, tokens.bg)).toBeGreaterThanOrEqual(4.5);
      }
    }
  });

  it("normalises short and prefix-less source colours", () => {
    expect(normalizeSourceColor("#A8F")).toBe("#aa88ff");
    expect(normalizeSourceColor("a855f7")).toBe("#a855f7");
    expect(normalizeSourceColor(" #A855F7 ")).toBe("#a855f7");
    expect(() => normalizeSourceColor("#12345")).toThrow(TypeError);
    expect(() => normalizeSourceColor("rebeccapurple")).toThrow(TypeError);
  });
});

describe("src/styles/index.css", () => {
  it("ships the generated default palette so no-JS and SSR paint correctly", () => {
    const generated = generateTokens(DEFAULT_SOURCE_COLOR, "light");
    const shipped = declarations(":root {");

    expect(Object.fromEntries(Object.keys(generated).map((key) => [key, shipped[key]]))).toEqual(
      generated,
    );
  });

  it("keeps both dark-mode blocks in sync with the generator", () => {
    const dark = generateTokens(DEFAULT_SOURCE_COLOR, "dark");
    const shipped = [
      declarations(':root:not([data-theme="light"]) {'),
      declarations(':root[data-theme="dark"] {'),
    ];

    for (const block of shipped) {
      expect(Object.fromEntries(Object.keys(dark).map((key) => [key, block[key]]))).toEqual(dark);
    }
  });
});
