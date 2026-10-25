import type { InjectionKey, Ref } from "vue";

/** 子项的标识值：显式 value，或省略时由 SegmentedButtons 注入的索引。 */
export type SegmentedValue = string | number;

export interface SegmentedContext {
  /** 选中值，由 SegmentedButtons 的 `v-model:value` 提供；多选时是数组。 */
  model: Ref<SegmentedValue | SegmentedValue[] | undefined>;
  /** 多选模式下点击切换子项，单选模式下点击即选中且不可取消。 */
  multiple: boolean;
  isSelected: (value: SegmentedValue) => boolean;
  toggle: (value: SegmentedValue) => void;
  /** 当前获得焦点的子项标识，决定 roving tabindex 的 `0` / `-1`。 */
  focusValue: Ref<SegmentedValue | undefined>;
  /** 子项获得焦点时由 SegmentedButton 调用，同步 `focusValue`。 */
  setFocus: (value: SegmentedValue) => void;
}

export const segmentedContextKey: InjectionKey<SegmentedContext> = Symbol(
  "dotsharp-segmented-buttons",
);
