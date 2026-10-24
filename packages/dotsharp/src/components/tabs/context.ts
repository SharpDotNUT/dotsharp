import type { InjectionKey, Ref } from "vue";

/** 子项的标识值：显式 value，或省略时由 Tabs 注入的索引。 */
export type TabsValue = string | number;

export interface TabsContext {
  /** 当前选中值，由 Tabs 的 `v-model:value` 提供。 */
  model: Ref<TabsValue>;
  /** Tabs 的 `variant`，供 Tab 决定排版。 */
  variant: Ref<boolean>;
  /** 子项挂载/卸载时把自己的根元素交给 Tabs，指示条据此定位；传 `null` 表示注销。 */
  register: (value: TabsValue, el: HTMLElement | null) => void;
}

export const tabsContextKey: InjectionKey<TabsContext> = Symbol("dotsharp-tabs");
