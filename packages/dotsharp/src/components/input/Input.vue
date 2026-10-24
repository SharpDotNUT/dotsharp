<script setup lang="ts">
defineOptions({ inheritAttrs: false });

interface InputProps {
  type?: string;
  placeholder?: string;
  disabled?: boolean;
  readonly?: boolean;
}

withDefaults(defineProps<InputProps>(), {
  type: "text",
  placeholder: undefined,
  disabled: false,
  readonly: false,
});

const model = defineModel<string>({ default: "" });
</script>

<template>
  <input
    class="ds-input"
    :type="type"
    :placeholder="placeholder"
    :disabled="disabled"
    :readonly="readonly"
    v-model="model"
    v-bind="$attrs"
  />
</template>

<style scoped>
.ds-input {
  box-sizing: border-box;
  width: 100%;
  height: 36px;
  padding: 0 12px;
  border: 1px solid var(--ds-border);
  border-radius: var(--ds-radius);
  background-color: var(--ds-bg);
  color: var(--ds-text);
  font-family: var(--ds-font);
  font-size: 14px;
  line-height: 1;
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease;
}

.ds-input::placeholder {
  color: var(--ds-text-muted);
}

.ds-input:focus {
  outline: none;
  border-color: var(--ds-primary);
  box-shadow: 0 0 0 3px var(--ds-focus-ring);
}

.ds-input:disabled {
  background-color: var(--ds-surface);
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
