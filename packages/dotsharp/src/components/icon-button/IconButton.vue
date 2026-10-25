<script setup lang="ts">
import type { IconifyIcon } from "@iconify/vue";
import Icon from "../icon/Icon.vue";
import { vRipple } from "../../directives/ripple";

defineOptions({ inheritAttrs: false });

interface IconButtonProps {
  /** 图标数据（推荐按需 import 的离线数据）或 Iconify 图标名；默认插槽优先。 */
  icon?: IconifyIcon | string;
  /** 无障碍名称（`aria-label`）：图标按钮没有可见文字，读屏只能靠它。 */
  label: string;
  disabled?: boolean;
}

const props = withDefaults(defineProps<IconButtonProps>(), {
  icon: undefined,
  disabled: false,
});
</script>

<template>
  <button
    type="button"
    v-ripple
    v-bind="$attrs"
    :aria-label="label"
    :disabled="disabled"
    class="ds-icon-button inline-flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent text-[1.5rem] text-ds-fg transition-colors hover:bg-ds-surface-hover focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ds-focus disabled:pointer-events-none disabled:opacity-40"
  >
    <slot>
      <Icon v-if="icon" :icon="icon" />
    </slot>
  </button>
</template>
