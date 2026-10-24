import type { InjectionKey, Ref } from "vue";

/** 子项的标识值：显式 value，或省略时由 NavigationDrawer 注入的索引。 */
export type NavigationDrawerValue = string | number;

export interface NavigationDrawerContext {
  /** 当前选中值，由 NavigationDrawer 的 `v-model:value` 提供。 */
  model: Ref<NavigationDrawerValue>;
}

export const navigationDrawerContextKey: InjectionKey<NavigationDrawerContext> = Symbol(
  "dotsharp-navigation-drawer",
);
