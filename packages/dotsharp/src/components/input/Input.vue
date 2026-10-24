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
    v-model="model"
    class="ds-input box-border h-9 w-full rounded-ds border border-ds-line bg-ds-bg px-3 font-ds text-sm leading-none text-ds-fg transition-[border-color,box-shadow] placeholder:text-ds-muted focus:border-ds-primary focus:shadow-[0_0_0_3px_var(--ds-focus-ring)] focus:outline-none disabled:cursor-not-allowed disabled:bg-ds-surface disabled:opacity-60"
    :type="type"
    :placeholder="placeholder"
    :disabled="disabled"
    :readonly="readonly"
    v-bind="$attrs"
  />
</template>
