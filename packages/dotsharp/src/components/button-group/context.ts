import type { InjectionKey } from "vue";
import type { ButtonSize, ButtonVariant } from "../button/shared";

/** 子项标识：显式 `value`，或省略时由 ButtonGroup 注入的索引。 */
export type ButtonGroupValue = string | number;

/** 选择模式：`single` 单选、`multiple` 多选；省略即纯按钮组（不维护选中态）。 */
export type ButtonGroupSelection = "single" | "multiple";

/**
 * `standard`：按钮之间留空隙，每个按钮都是完整胶囊；
 * `connected`：按钮用 2px 间隙连成一条，只有两端是完整圆角。
 */
export type ButtonGroupShape = "standard" | "connected";

export interface ButtonGroupContext {
  selection: ButtonGroupSelection | undefined;
  shape: ButtonGroupShape;
  variant: ButtonVariant;
  size: ButtonSize;
  isSelected: (value: ButtonGroupValue) => boolean;
  toggle: (value: ButtonGroupValue) => void;
}

export const buttonGroupContextKey: InjectionKey<ButtonGroupContext> =
  Symbol("dotsharp-button-group");
