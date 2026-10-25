<script setup lang="ts">
import { vRipple } from "../../directives/ripple";

defineOptions({ inheritAttrs: false });

type ButtonVariant = "elevated" | "filled" | "tonal" | "outlined" | "text";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps {
  /** 视觉层级，对应 Material Design 3 的五种按钮。 */
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}

withDefaults(defineProps<ButtonProps>(), {
  variant: "filled",
  size: "md",
  disabled: false,
  type: "button",
});

const variantClasses: Record<ButtonVariant, string> = {
  elevated: "bg-ds-elevated text-ds-primary-strong shadow-sm enabled:hover:bg-ds-elevated-hover",
  filled: "bg-ds-primary text-ds-on-primary enabled:hover:bg-ds-primary-hover",
  tonal: "bg-ds-tonal text-ds-on-tonal enabled:hover:bg-ds-tonal-hover",
  outlined: "border-ds-outline bg-transparent text-ds-fg enabled:hover:bg-ds-fg/10",
  text: "bg-transparent text-ds-primary-strong enabled:hover:bg-ds-primary-strong/10",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-8 px-4",
  md: "h-10 px-6",
  lg: "h-12 px-6",
};
</script>

<template>
  <button
    v-ripple
    class="ds-button inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border border-transparent font-ds text-sm leading-none font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ds-focus disabled:cursor-not-allowed disabled:opacity-50"
    :class="[variantClasses[variant], sizeClasses[size]]"
    :type="type"
    :disabled="disabled"
    v-bind="$attrs"
  >
    <slot />
  </button>
</template>
