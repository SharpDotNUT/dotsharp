import type { InjectionKey } from "vue";
import type { ButtonSize, ButtonVariant } from "../button/shared";

/** 子项标识：显式 `value`，或省略时由 ButtonGroup 注入的索引。 */
export type ButtonGroupValue = string | number;

/** 选择模式：`single` 单选、`multiple` 多选；省略即纯按钮组（不维护选中态）。 */
export type ButtonGroupSelection = "single" | "multiple";

/**
 * `standard`：按钮之间留空隙，未选中的按钮是完整胶囊；
 * `connected`：按钮用 2px 间隙连成一条，未选中时只有两端是完整圆角。
 * 两种形状的选中态共用同一个圆角令牌（`--ds-radius`）：standard 收成更小的圆角，
 * connected 四角统一，避免端点处出现「一端全圆、一端小圆」。
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
