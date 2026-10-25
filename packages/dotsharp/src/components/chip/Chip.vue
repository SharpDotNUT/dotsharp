<script setup lang="ts">
import type { IconifyIcon } from "@iconify/vue";
import checkIcon from "@iconify-icons/material-symbols/check";
import Icon from "../icon/Icon.vue";
import { vRipple } from "../../directives/ripple";

defineOptions({ inheritAttrs: false });

interface ChipProps {
  /** 纯文本内容；存在默认插槽时被插槽覆盖。 */
  label?: string;
  /** 未选中时的前置图标；选中后固定显示勾选图标。 */
  icon?: IconifyIcon | string;
  disabled?: boolean;
}

withDefaults(defineProps<ChipProps>(), {
  label: undefined,
  icon: undefined,
  disabled: false,
});

/** 过滤纸片的选中状态：点击切换，与 `v-model:selected` 双向绑定。 */
const selected = defineModel<boolean>("selected", { default: false });
</script>

<template>
  <button
    type="button"
    v-ripple
    :aria-pressed="selected"
    :disabled="disabled"
    :class="[
      'ds-chip box-border inline-flex h-8 cursor-pointer items-center justify-center gap-1.5 rounded-ds border px-4 font-ds text-sm leading-none whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ds-focus disabled:cursor-not-allowed disabled:opacity-38',
      selected
        ? 'border-transparent bg-ds-primary text-ds-primary-strong'
        : 'border-ds-outline bg-transparent text-ds-fg hover:bg-ds-fg/8',
    ]"
    v-bind="$attrs"
    @click="selected = !selected"
  >
    <Icon v-if="selected" :icon="checkIcon" size="1.25em" />
    <Icon v-else-if="icon" :icon="icon" size="1.25em" />
    <slot>{{ label }}</slot>
  </button>
</template>
