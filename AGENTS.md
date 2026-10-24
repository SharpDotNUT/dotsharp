# AGENTS.md

dotsharp is a pnpm workspace: `packages/dotsharp` (Vue 3 component library, published as `@sharpdotnut/dotsharp`) plus
`docs` (VitePress site). Component documentation lives inside the component directory; `docs` only pulls it in.

## Commands

Run from the repository root:

```bash
pnpm install          # install all workspace dependencies
pnpm dev              # docs dev server (vitepress dev)
pnpm build            # build:lib + build:docs
pnpm build:lib        # vp pack, output in packages/dotsharp/dist
pnpm build:docs       # vitepress build, output in docs/.vitepress/dist
pnpm preview          # preview the built docs
pnpm typecheck        # vue-tsc --noEmit in both packages
pnpm test             # vp test (happy-dom), only packages/*/src/**/*.test.ts
pnpm check            # vp check: Oxfmt formatting + oxlint (type-aware)
pnpm exec vp check --fix   # apply formatting / auto-fixable lint
```

Per package: `pnpm --filter @sharpdotnut/dotsharp <script>`, `pnpm --filter @dotsharp/docs <script>`.

## Layout

```
packages/dotsharp/
  src/index.ts                 # the single public entry: components + useTheme
  src/styles/index.css         # theme tokens (derived from HSL anchors)
  src/components/<name>/
    <Name>.vue                 # component implementation
    README.md                  # the component's whole docs page (docs + live demo + snippets)
  src/composables/useTheme.ts  # theme composable (module-level singleton)
  src/composables/useTheme.test.ts
docs/
  .vitepress/config.ts         # site config: appearance off, pre-paint theme script, dotsharp aliases, sidebar
  .vitepress/theme/            # default theme extension: .dark sync, theme switcher, demo-row styling
  components/<name>.md         # only @includes the README.md from the component directory
  guide/theme.md, index.md
types/assets.d.ts              # module declarations for *.css and *.vue
```

## Conventions

### Theming

- Colors are defined only in `packages/dotsharp/src/styles/index.css` and must derive from HSL anchors:
  hue (`--ds-hue-*`), saturation (`--ds-sat-*`), lightness steps (`--ds-lum-*`). Tokens compose them with
  `hsl(var(--ds-hue-brand) var(--ds-sat-brand) var(--ds-lum-primary))`. Do not add bare hex/rgb colors.
- Dark mode has two anchor override blocks:
  `@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { … } }` and
  `:root[data-theme="dark"] { … }`. They must stay in sync and must override anchors only, never tokens.
- `useTheme()` writes `document.documentElement.dataset.theme` (`light`/`dark`) only; it never sets a `.dark`
  class. The docs theme mirrors the resolved value onto `.dark` for VitePress. Default mode is `system`;
  the persistence key is `dotsharp-theme`.
- Components consume `--ds-*` tokens only. Never hardcode colors, radii, or fonts.

### Component docs

- Each component's docs page is `src/components/<name>/README.md`: a `<script setup>` block, live demos wrapped in
  `<div class="demo-row">`, and ` ```vue ` snippets, all maintained in that one file.
- `docs/components/<name>.md` contains frontmatter plus a single line:
  `<!-- @include: ../../packages/dotsharp/src/components/<name>/README.md -->`.
  Never copy the content into it and never add separate `.vue` demo files.
- Demos import from the public package name (`import { Button } from '@sharpdotnut/dotsharp'`); the alias lives in
  `docs/.vitepress/config.ts` under `vite.resolve.alias`.
- Demos that touch browser state (localStorage, system theme) must be guarded by a `mounted` ref so SSR output and
  the first hydration render are identical.

### Adding a component

1. `src/components/<name>/<Name>.vue`: `defineOptions({ inheritAttrs: false })` +
   `withDefaults(defineProps<…>(), …)`; `scoped` styles using `--ds-*` tokens only.
2. `src/components/<name>/README.md`: follow the docs conventions above.
3. `src/index.ts`: add the named export (`export { default as <Name> } from …`).
4. `docs/components/<name>.md`: the `@include` wrapper.
5. `docs/.vitepress/config.ts`: add a sidebar entry.

### Build and exports

- The library ships ESM only: `vp pack` (configured in `packages/dotsharp/vite.config.ts`, `unplugin-vue/rolldown`
  with `platform: 'neutral'`); `vue` is a peer dependency.
- Output is fixed at `dist/index.js`, `dist/index.d.ts`, `dist/style.css`. `package.json` `exports` must match the
  real filenames: `. → dist/index.js`, `./style.css → dist/style.css`. Renaming output requires updating both.
- Do not add a CJS build.

### Tooling and versions

- Oxfmt owns formatting (default rules: double quotes, semicolons). Do not hand-tune style; run `pnpm check`
  (with `--fix` when needed).
- Type checking uses `vue-tsc`. Keep the `*.vue` wildcard declaration in `types/assets.d.ts`: oxlint's type-aware
  pass runs plain tsc and cannot resolve SFCs (vue-tsc still resolves real SFC types, so that declaration is not
  a type source).
- VitePress is pinned to `2.0.0-alpha.20` (for Vite 8) and `vite-plus` to `1.4.0`. Never add pnpm `overrides` for
  `vite`; VitePress and Vite+ keep their own Vite instances.
- `pnpm-lock.yaml` must be committed.

### Verification

After changes, at minimum run `pnpm typecheck` and `pnpm test`. When components or docs change, also run
`pnpm build:lib` and `pnpm build:docs` (the docs build fails on dead links). `pnpm check` must pass before committing.
