import type { InjectionKey, Ref, ShallowRef } from "vue";

/** 子项的标识值：显式 value，或省略时由 Select 注入的索引。 */
export type SelectValue = string | number;

export interface SelectContext {
  /** 当前选中值，由 Select 的 `v-model:value` 提供。 */
  model: Ref<SelectValue>;
  /**
   * 唯一的高亮元素。键盘移动与鼠标悬停都写这里，`aria-activedescendant` 也从它读，
   * 因此焦点始终留在触发器上，弹层里的选项不需要可聚焦。
   */
  activeEl: ShallowRef<HTMLElement | null>;
  /** 选项被点击时提交选中值并关闭弹层。 */
  select: (value: SelectValue) => void;
  /** 选项报告自己进入高亮（鼠标悬停）。 */
  setActive: (el: HTMLElement | null) => void;
}

export const selectContextKey: InjectionKey<SelectContext> = Symbol("dotsharp-select");
