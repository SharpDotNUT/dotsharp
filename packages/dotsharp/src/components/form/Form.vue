<script setup lang="ts">
import { provide } from "vue";
import { formContextKey } from "./context";
import { useFormValidation } from "../../composables/useFormValidation";

defineOptions({ inheritAttrs: false });

const emit = defineEmits<{ submit: [valid: boolean] }>();

const { register, unregister, validate, clearValidate } = useFormValidation();

provide(formContextKey, { register, unregister });

function onSubmit(): void {
  emit("submit", validate());
}

defineExpose({ validate, clearValidate });
</script>

<template>
  <form
    v-bind="$attrs"
    novalidate
    class="ds-form flex flex-col gap-4 font-ds"
    @submit.prevent="onSubmit"
  >
    <slot />
  </form>
</template>
