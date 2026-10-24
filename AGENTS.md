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
  src/styles/index.css         # Tailwind entry: HSL token anchors + @theme mapping
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

### Styling with Tailwind

- Components are styled with Tailwind utilities in the SFC template. No `<style scoped>` blocks, no hand-written
  component CSS.
- `src/styles/index.css` is the Tailwind entry. It imports **only** `tailwindcss/theme.css` and
  `tailwindcss/utilities.css` — preflight is deliberately excluded, because a component library must not reset the
  consumer's page.
- `@theme inline` maps the `--ds-*` tokens onto Tailwind keys (`--color-ds-*`, `--radius-ds`, `--font-ds`); `inline`
  keeps dark mode working because utilities then reference `var(--ds-…)` directly. Token names used by classes:
  `bg-ds-bg`, `bg-ds-surface`, `bg-ds-surface-hover`, `bg-ds-primary`, `bg-ds-primary-hover`, `text-ds-fg`,
  `text-ds-muted`, `text-ds-on-primary`, `border-ds-line`, `outline-ds-focus`, `rounded-ds`, `font-ds`.
- Class names must stay statically greppable: keep them as literal strings (object maps are fine), never build them
  by concatenation, or the utilities are not generated.
- `@source '../components'` plus Tailwind's automatic detection generates the utilities; component `README.md`
  demo markup is scanned too, so utilities used only in demos still ship.
- The docs site loads the same source CSS through `@tailwindcss/vite` (registered in `docs/.vitepress/config.ts`), so
  demos and the published stylesheet cannot drift. Docs chrome stays on VitePress variables and the hand-written
  `docs/.vitepress/theme/style.css`.
- The published `dist/style.css` is compiled by the Tailwind CLI (`pnpm build:css`), so consumers need no Tailwind
  install and no `@source` configuration.

### Item components (the Tabs / Tab paradigm)

Any component that is configured as a list of child components (`Tabs` + `Tab`, and later `Select` + `Option`,
`Steps` + `Step`, …) uses this one contract. `Tabs` / `Tab` is the reference implementation; copy it instead of
inventing a second convention.

- **Selection is a model.** The parent declares `const model = defineModel<Value>("value", { default: 0 })`, so
  consumers write `v-model:value`. The default `0` means the first child is selected before any interaction.
- **Child text is slot-else-prop.** A child declares `label?: string` for plain text and renders `<slot>{{ label }}</slot>`.
  Slot content always wins; `label` is only the fallback when no default slot is provided.
- **Child identity is `value ?? index`.** A child declares `value?: string | number`; when omitted its identity is its
  declaration-order index (0-based). The index is internal: users never pass it.
- **The parent owns the index.** The parent flattens `Fragment`s in its default slot (so `v-for` works), then
  `cloneVNode(node, { index })` for every child component; `v-if`/`v-for` therefore renumber by final render order.
- **Shared state goes through a typed context.** `src/components/<name>/context.ts` holds the value type, the
  `InjectionKey`, and the context interface (`model`, plus any layout flag such as `variant`); the parent `provide`s it,
  children `inject` it with a `null` fallback so they render standalone.
- **Read the slot inside a render-evaluated `computed`.** Never call `slots.default()` in `setup()` or a module-scope
  helper: it warns and drops slot dependency tracking. A `computed` that only the template reads is evaluated during
  render, which is correct.
- **Document the paradigm in the component README** (`label`-only, slot override, index fallback, plus the variant
  boolean if there is one), and keep the `TabsValue`-style value type exported from `src/index.ts`.

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
   `withDefaults(defineProps<…>(), …)`; style with Tailwind utilities bound to `--ds-*` tokens.
2. `src/components/<name>/README.md`: follow the docs conventions above.
3. `src/index.ts`: add the named export (`export { default as <Name> } from …`).
4. `docs/components/<name>.md`: the `@include` wrapper.
5. `docs/.vitepress/config.ts`: add a sidebar entry.

### Build and exports

- The library ships ESM only: `vp pack` (configured in `packages/dotsharp/vite.config.ts`, `unplugin-vue/rolldown`
  with `platform: 'neutral'`); `vue` is a peer dependency.
- `pnpm build` in the package = `vp pack && pnpm run build:css`. `vp pack` emits JS and types; the Tailwind CLI
  compiles `src/styles/index.css` into `dist/style.css` afterwards. Keep that order: `vp pack` cleans `dist`.
- `src/index.ts` must not import the stylesheet; the stylesheet is opt-in via the `style.css` export.
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
- Tailwind CSS is `4.3.3`: `tailwindcss` + `@tailwindcss/cli` in the library, `@tailwindcss/vite` in docs. The CLI's
  `@parcel/watcher` build script is approved in `pnpm-workspace.yaml` (`allowBuilds`); without it `pnpm install`
  fails with `ERR_PNPM_IGNORED_BUILDS`.
- `pnpm-lock.yaml` must be committed.

### Verification

After changes, at minimum run `pnpm typecheck` and `pnpm test`. When components or docs change, also run
`pnpm build:lib` and `pnpm build:docs` (the docs build fails on dead links). `pnpm check` must pass before committing.
