<script setup lang="ts">
import { computed, useSlots } from "vue";
import type { IconifyIcon } from "@iconify/vue";
import Icon from "../icon/Icon.vue";
import { vRipple } from "../../directives/ripple";
import type { FabSize, FabVariant } from "./shared";

defineOptions({ inheritAttrs: false });

interface FabProps {
  /** 前置图标；存在 `label` 或默认插槽时变成扩展 FAB。 */
  icon?: IconifyIcon | string;
  /** 纯文本标签；存在默认插槽时被插槽覆盖。给出标签即扩展 FAB。 */
  label?: string;
  variant?: FabVariant;
  size?: FabSize;
  /** 加一层更深的阴影，用于悬浮在内容之上、需要明显分离的场合。 */
  lowered?: boolean;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}

const props = withDefaults(defineProps<FabProps>(), {
  icon: undefined,
  label: undefined,
  variant: "primary",
  size: "md",
  lowered: false,
  disabled: false,
  type: "button",
});

const slots = useSlots();

/** 有无文字决定方形还是胶囊；默认插槽同理。 */
const extended = computed(() => props.label !== undefined || Boolean(slots.default));

const variantClasses: Record<FabVariant, string> = {
  primary: "bg-ds-primary text-ds-on-primary enabled:hover:bg-ds-primary-hover",
  secondary: "bg-ds-tonal text-ds-on-tonal enabled:hover:bg-ds-tonal-hover",
  surface: "bg-ds-elevated text-ds-primary-strong enabled:hover:bg-ds-elevated-hover",
};

/** 方形 FAB 的边长；扩展 FAB 只固定高度，宽度由内容撑开。 */
const squareSizeClasses: Record<FabSize, string> = {
  sm: "size-10",
  md: "size-14",
  lg: "size-24",
};

const extendedSizeClasses: Record<FabSize, string> = {
  sm: "h-10 px-4",
  md: "h-14 px-5",
  lg: "h-24 px-8",
};

const iconSizes: Record<FabSize, string> = {
  sm: "20px",
  md: "24px",
  lg: "36px",
};

const textClasses: Record<FabSize, string> = {
  sm: "text-sm",
  md: "text-sm",
  lg: "text-2xl",
};

const paddingClasses: Record<FabSize, string> = {
  sm: "gap-1.5",
  md: "gap-3",
  lg: "gap-4",
};
</script>

<template>
  <button
    v-ripple
    :type="type"
    :disabled="disabled"
    v-bind="$attrs"
    :class="[
      'ds-fab inline-flex shrink-0 cursor-pointer items-center justify-center rounded-ds-lg border-0 font-ds leading-none font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ds-focus disabled:cursor-not-allowed disabled:opacity-50',
      variantClasses[variant],
      extended ? extendedSizeClasses[size] : squareSizeClasses[size],
      extended ? paddingClasses[size] : '',
      textClasses[size],
      lowered ? 'shadow-lg' : 'shadow-md',
    ]"
  >
    <Icon v-if="icon" :icon="icon" :size="iconSizes[size]" />
    <span v-if="extended" class="truncate"
      ><slot>{{ label }}</slot></span
    >
  </button>
</template>
