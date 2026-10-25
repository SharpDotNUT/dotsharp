<script setup lang="ts">
import { computed, provide, toRef, useId } from "vue";
import { radioContextKey, type RadioValue } from "./context";

defineOptions({ inheritAttrs: false });

interface RadioGroupProps {
  /** 原生 `name`；省略时自动生成，确保组内互斥与方向键切换。 */
  name?: string;
  disabled?: boolean;
}

const props = withDefaults(defineProps<RadioGroupProps>(), {
  name: undefined,
  disabled: false,
});

const model = defineModel<RadioValue>("value", { default: 0 });

const uid = useId();

provide(radioContextKey, {
  model,
  name: computed(() => props.name ?? `ds-radio-group-${uid}`),
  disabled: toRef(props, "disabled"),
});
</script>

<template>
  <div role="radiogroup" v-bind="$attrs" class="ds-radio-group flex flex-col font-ds text-ds-fg">
    <slot />
  </div>
</template>
