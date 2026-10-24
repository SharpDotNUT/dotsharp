<script setup lang="ts">
defineOptions({ inheritAttrs: false });

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}

withDefaults(defineProps<ButtonProps>(), {
  variant: "primary",
  size: "md",
  disabled: false,
  type: "button",
});

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-ds-primary text-ds-on-primary enabled:hover:bg-ds-primary-hover",
  secondary: "border-ds-line bg-ds-surface text-ds-fg enabled:hover:bg-ds-surface-hover",
  ghost: "bg-transparent text-ds-fg enabled:hover:bg-ds-surface",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-[30px] px-[10px]",
  md: "h-9 px-3.5",
  lg: "h-11 px-5",
};
</script>

<template>
  <button
    class="ds-button inline-flex cursor-pointer items-center justify-center gap-2 rounded-ds border border-transparent font-ds text-sm leading-none font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ds-focus disabled:cursor-not-allowed disabled:opacity-50"
    :class="[variantClasses[variant], sizeClasses[size]]"
    :type="type"
    :disabled="disabled"
    v-bind="$attrs"
  >
    <slot />
  </button>
</template>
