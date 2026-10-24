<script setup lang="ts">
defineOptions({ inheritAttrs: false });

interface NavigationDrawerHeadingProps {
  /** 纯文本内容；存在默认插槽时被插槽覆盖。 */
  label?: string;
}

withDefaults(defineProps<NavigationDrawerHeadingProps>(), {
  label: undefined,
});
</script>

<template>
  <div
    v-bind="$attrs"
    class="ds-navigation-drawer-heading px-3 pt-6 pb-2 font-ds text-base font-medium text-ds-fg"
  >
    <slot>{{ label }}</slot>
  </div>
</template>
