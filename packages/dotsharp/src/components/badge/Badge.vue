<script setup lang="ts">
import { computed } from "vue";
import { formatBadgeValue } from "./shared";

defineOptions({ inheritAttrs: false });

interface BadgeProps {
  /** 显示的计数或短文本；省略（或空字符串）时渲染成 6px 小圆点。 */
  value?: string | number;
  /** 数字上限，超出时显示 `${max}+`。 */
  max?: number;
  /** 无障碍名称，例如“3 条未读”；省略时由可见文字表达。 */
  label?: string;
}

const props = withDefaults(defineProps<BadgeProps>(), {
  value: undefined,
  max: 99,
  label: undefined,
});

const text = computed(() => formatBadgeValue(props.value, props.max));
const isDot = computed(() => text.value === "");
</script>

<template>
  <span
    v-bind="$attrs"
    role="status"
    :aria-label="label"
    :class="[
      'ds-badge inline-flex shrink-0 items-center justify-center rounded-full bg-ds-error font-ds font-medium text-ds-on-error',
      isDot ? 'h-1.5 w-1.5' : 'h-4 min-w-4 px-1 text-[11px] leading-none whitespace-nowrap',
    ]"
  >
    <template v-if="!isDot">{{ text }}</template>
  </span>
</template>
