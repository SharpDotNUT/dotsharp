import type { InjectionKey, Ref } from "vue";
import type { FormValidateTrigger } from "../form/context";

/** 子项的标识值：显式 value，或省略时由 RadioGroup 注入的索引。 */
export type RadioValue = string | number;

export interface RadioContext {
  /** 当前选中值，由 RadioGroup 的 `v-model:value` 提供。 */
  model: Ref<RadioValue>;
  /** 原生 radio 的 `name`，让浏览器负责方向键分组切换。 */
  name: Ref<string>;
  /** RadioGroup 的 `disabled`，会叠加到每个子项上。 */
  disabled: Ref<boolean>;
  /** 子项在用户选择（`input`）或失焦（`blur`）时通知 RadioGroup 触发校验。 */
  notify: (when: FormValidateTrigger, value?: unknown) => void;
}

export const radioContextKey: InjectionKey<RadioContext> = Symbol("dotsharp-radio-group");
