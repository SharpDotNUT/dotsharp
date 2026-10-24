declare module "*.css" {
  const content: string;
  export default content;
}

// SFC modules are resolved by `vue-tsc`; this ambient fallback keeps plain
// TypeScript tooling (e.g. oxlint's type-aware pass) from failing to resolve
// `.vue` imports.
declare module "*.vue" {
  import type { Component } from "vue";
  const component: Component;
  export default component;
}
