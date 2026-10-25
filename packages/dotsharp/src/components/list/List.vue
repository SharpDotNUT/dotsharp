<script setup lang="ts">
defineOptions({ inheritAttrs: false });
</script>

<template>
  <ul
    role="list"
    v-bind="$attrs"
    class="ds-list m-0 list-none divide-y divide-ds-line overflow-hidden rounded-ds bg-ds-surface p-0 font-ds text-ds-fg"
  >
    <slot />
  </ul>
</template>
