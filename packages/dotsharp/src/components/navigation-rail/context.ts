import type { InjectionKey, Ref } from "vue";

/** 子项的标识值：显式 value，或省略时由 NavigationRail 注入的索引。 */
export type NavigationRailValue = string | number;

/** `static`：图标与文字常显、不可展开；`expandable`：折叠只留图标，展开时文字出现在右侧。 */
export type NavigationRailVariant = "static" | "expandable";

export interface NavigationRailContext {
  /** 当前选中值，由 NavigationRail 的 `v-model:value` 提供。 */
  model: Ref<NavigationRailValue>;
  /** 展开状态；仅 `expandable` 变体有意义。 */
  expanded: Ref<boolean>;
  variant: Ref<NavigationRailVariant>;
}

export const navigationRailContextKey: InjectionKey<NavigationRailContext> = Symbol(
  "dotsharp-navigation-rail",
);
