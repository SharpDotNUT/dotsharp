<script setup lang="ts">
import { Icon as IconifyIcon, type IconifyIcon as IconifyIconData } from "@iconify/vue";
import { computed } from "vue";

defineOptions({ inheritAttrs: false });

interface IconProps {
  /** 图标数据（推荐按需 import 的离线数据）或 Iconify 图标名。 */
  icon: IconifyIconData | string;
  size?: number | string;
  color?: string;
  /** 提供时作为无障碍名称（`role="img"` + `aria-label`）；否则视为装饰图标。 */
  label?: string;
  inline?: boolean;
}

const props = withDefaults(defineProps<IconProps>(), {
  size: "1em",
  color: undefined,
  label: undefined,
  inline: true,
});

/**
 * 图标数据是同步可用的，交给 Iconify 在首次渲染（含 SSR）就画出来；
 * 字符串图标名需要联网加载，保持 Iconify 默认行为（挂载后再渲染）。
 */
const ssr = computed(() => typeof props.icon === "object" && props.icon !== null);
</script>

<template>
  <IconifyIcon
    class="ds-icon shrink-0"
    :icon="icon"
    :ssr="ssr"
    :width="size"
    :height="size"
    :color="color"
    :inline="inline"
    :aria-hidden="label ? undefined : 'true'"
    :aria-label="label"
    :role="label ? 'img' : undefined"
    focusable="false"
    v-bind="$attrs"
  />
</template>
