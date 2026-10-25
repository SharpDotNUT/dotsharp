<script setup lang="ts">
import { ref } from "vue";
import type { IconifyIcon } from "@iconify/vue";
import chevronIcon from "@iconify-icons/material-symbols/arrow-drop-down";
import Icon from "../icon/Icon.vue";
import Menu from "../menu/Menu.vue";
import type { MenuValue } from "../menu/context";
import type { MenuPlacement } from "../menu/types";
import { buttonSizeClasses, type ButtonSize, type ButtonVariant } from "../button/shared";
import { vRipple } from "../../directives/ripple";

defineOptions({ inheritAttrs: false });

interface SplitButtonProps {
  /** 主按钮文本；存在默认插槽时由菜单项占用插槽，文本不会被覆盖。 */
  label?: string;
  /** 主按钮的前置图标。 */
  icon?: IconifyIcon | string;
  /** 尾部分段（展开菜单）的无障碍名称，必填。 */
  menuLabel: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** 菜单相对尾部分段的展开方向。 */
  placement?: MenuPlacement;
  disabled?: boolean;
  /** 只禁用尾部分段：主操作可用，但不能再展开菜单。 */
  menuDisabled?: boolean;
  type?: "button" | "submit" | "reset";
}

const props = withDefaults(defineProps<SplitButtonProps>(), {
  label: undefined,
  icon: undefined,
  variant: "filled",
  size: "md",
  placement: "bottom-end",
  disabled: false,
  menuDisabled: false,
  type: "button",
});

const emit = defineEmits<{ select: [value: MenuValue] }>();

const open = ref(false);
const arrowRef = ref<HTMLButtonElement | null>(null);

/** 容器承载底色 / 边框 / 文字色，两段按钮只负责悬浮层，缝隙处不会透出别的颜色。 */
const containerClasses: Record<ButtonVariant, string> = {
  elevated: "bg-ds-elevated text-ds-primary-strong shadow-sm",
  filled: "bg-ds-primary text-ds-on-primary",
  tonal: "bg-ds-tonal text-ds-on-tonal",
  outlined: "border border-ds-outline bg-transparent text-ds-fg",
  text: "bg-transparent text-ds-primary-strong",
};

const hoverClasses: Record<ButtonVariant, string> = {
  elevated: "enabled:hover:bg-ds-elevated-hover",
  filled: "enabled:hover:bg-ds-primary-hover",
  tonal: "enabled:hover:bg-ds-tonal-hover",
  outlined: "enabled:hover:bg-ds-fg/10",
  text: "enabled:hover:bg-ds-primary-strong/10",
};

const heightClasses: Record<ButtonSize, string> = {
  sm: "h-8",
  md: "h-10",
  lg: "h-12",
};

const arrowSizeClasses: Record<ButtonSize, string> = {
  sm: "w-8",
  md: "w-10",
  lg: "w-12",
};

function onSelect(value: MenuValue): void {
  emit("select", value);
}
</script>

<template>
  <div
    v-bind="$attrs"
    class="ds-split-button inline-flex items-stretch overflow-hidden rounded-full font-ds text-sm leading-none font-medium transition-colors"
    :class="containerClasses[variant]"
  >
    <button
      :type="type"
      v-ripple
      :disabled="disabled"
      class="ds-split-button__main inline-flex min-w-0 cursor-pointer items-center justify-center gap-2 border-0 bg-transparent disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ds-focus"
      :class="[buttonSizeClasses[size], hoverClasses[variant]]"
    >
      <Icon v-if="icon" :icon="icon" size="1.125em" />
      <span class="truncate">{{ label }}</span>
    </button>

    <span aria-hidden="true" class="my-2 w-px shrink-0 self-stretch bg-current opacity-30" />

    <button
      ref="arrowRef"
      type="button"
      v-ripple
      :disabled="disabled || menuDisabled"
      :aria-label="menuLabel"
      aria-haspopup="menu"
      :aria-expanded="open"
      class="ds-split-button__arrow inline-flex shrink-0 cursor-pointer items-center justify-center border-0 bg-transparent px-0 text-[1.5rem] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ds-focus"
      :class="[heightClasses[size], arrowSizeClasses[size], hoverClasses[variant]]"
      @click.stop="open = !open"
      @keydown.down.prevent="open = true"
    >
      <Icon :icon="chevronIcon" />
    </button>

    <Menu v-model:open="open" :anchor="arrowRef" :placement="placement" @select="onSelect">
      <slot />
    </Menu>
  </div>
</template>
