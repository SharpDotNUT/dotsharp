<script setup lang="ts">
import { vRipple } from "../../directives/ripple";
import {
  buttonSizeClasses,
  buttonVariantClasses,
  type ButtonSize,
  type ButtonVariant,
} from "./shared";

defineOptions({ inheritAttrs: false });

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
</script>

<template>
  <button
    v-ripple
    class="ds-button inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border border-transparent font-ds text-sm leading-none font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ds-focus disabled:cursor-not-allowed disabled:opacity-50"
    :class="[buttonVariantClasses[variant], buttonSizeClasses[size]]"
    :type="type"
    :disabled="disabled"
    v-bind="$attrs"
  >
    <slot />
  </button>
</template>
