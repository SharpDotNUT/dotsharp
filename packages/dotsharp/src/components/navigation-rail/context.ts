import type { InjectionKey, Ref } from "vue";

/** 子项的标识值：显式 value，或省略时由 NavigationRail 注入的索引。 */
export type NavigationRailValue = string | number;

/** `standard`：挤开内容；`modal`：展开时在最近的定位容器内覆盖内容并带遮罩。 */
export type NavigationRailPresentation = "standard" | "modal";

export interface NavigationRailContext {
  /** 当前选中值，由 NavigationRail 的 `v-model:value` 提供。 */
  model: Ref<NavigationRailValue>;
  /** 展开状态；仅 `expandable` 有意义。 */
  expanded: Ref<boolean>;
  /** NavigationRail 的 `expandable`，供子项决定排版。 */
  expandable: Ref<boolean>;
}

export const navigationRailContextKey: InjectionKey<NavigationRailContext> = Symbol(
  "dotsharp-navigation-rail",
);
