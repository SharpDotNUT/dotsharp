import type { InjectionKey, Ref } from "vue";

/** 子项的标识值：显式 value，或省略时由 NavigationBar 注入的索引。 */
export type NavigationValue = string | number;

/** 导航项排版：`compact` 图标在上、文字在下；`medium` 图标与文字左右排列。 */
export type NavigationVariant = "compact" | "medium";

export interface NavigationContext {
  /** 当前选中值，由 NavigationBar 的 `v-model:value` 提供。 */
  model: Ref<NavigationValue>;
  /** NavigationBar 的 `variant`，供 NavigationItem 决定排版与高亮范围。 */
  variant: Ref<NavigationVariant>;
}

export const navigationContextKey: InjectionKey<NavigationContext> =
  Symbol("dotsharp-navigation-bar");
