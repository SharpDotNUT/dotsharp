<script setup lang="ts">
defineOptions({ inheritAttrs: false });

interface ButtonProps {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}

withDefaults(defineProps<ButtonProps>(), {
  variant: "primary",
  size: "md",
  disabled: false,
  type: "button",
});
</script>

<template>
  <button
    class="ds-button"
    :class="[`ds-button--${variant}`, `ds-button--${size}`]"
    :type="type"
    :disabled="disabled"
    v-bind="$attrs"
  >
    <slot />
  </button>
</template>

<style scoped>
.ds-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 1px solid transparent;
  border-radius: var(--ds-radius);
  font-family: var(--ds-font);
  font-size: 14px;
  font-weight: 500;
  line-height: 1;
  cursor: pointer;
  transition:
    background-color 0.15s ease,
    border-color 0.15s ease,
    color 0.15s ease;
}

.ds-button:focus-visible {
  outline: 2px solid var(--ds-focus-ring);
  outline-offset: 2px;
}

.ds-button--primary {
  background-color: var(--ds-primary);
  color: var(--ds-on-primary);
}

.ds-button--primary:not(:disabled):hover {
  background-color: var(--ds-primary-hover);
}

.ds-button--secondary {
  background-color: var(--ds-surface);
  border-color: var(--ds-border);
  color: var(--ds-text);
}

.ds-button--secondary:not(:disabled):hover {
  background-color: var(--ds-surface-hover);
}

.ds-button--ghost {
  background-color: transparent;
  color: var(--ds-text);
}

.ds-button--ghost:not(:disabled):hover {
  background-color: var(--ds-surface);
}

.ds-button--sm {
  height: 30px;
  padding: 0 10px;
}

.ds-button--md {
  height: 36px;
  padding: 0 14px;
}

.ds-button--lg {
  height: 44px;
  padding: 0 20px;
}

.ds-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
