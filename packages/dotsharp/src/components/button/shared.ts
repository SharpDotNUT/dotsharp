/** 按钮的视觉层级，对应 Material Design 3 的五种按钮。 */
export type ButtonVariant = "elevated" | "filled" | "tonal" | "outlined" | "text";

/** 按钮高度：`sm` 32px、`md` 40px、`lg` 48px。 */
export type ButtonSize = "sm" | "md" | "lg";

/**
 * 五种层级的容器 / 文字 / 悬浮样式。Button 与同一套视觉的分组按钮共用，
 * 避免两处各写一份颜色映射后漂移。
 */
export const buttonVariantClasses: Record<ButtonVariant, string> = {
  elevated: "bg-ds-elevated text-ds-primary-strong shadow-sm enabled:hover:bg-ds-elevated-hover",
  filled: "bg-ds-primary text-ds-on-primary enabled:hover:bg-ds-primary-hover",
  tonal: "bg-ds-tonal text-ds-on-tonal enabled:hover:bg-ds-tonal-hover",
  outlined: "border-ds-outline bg-transparent text-ds-fg enabled:hover:bg-ds-fg/10",
  text: "bg-transparent text-ds-primary-strong enabled:hover:bg-ds-primary-strong/10",
};

export const buttonSizeClasses: Record<ButtonSize, string> = {
  sm: "h-8 px-4",
  md: "h-10 px-6",
  lg: "h-12 px-6",
};
