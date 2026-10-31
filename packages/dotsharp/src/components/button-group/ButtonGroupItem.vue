<script setup lang="ts">
import { computed, inject } from "vue";
import type { IconifyIcon } from "@iconify/vue";
import checkIcon from "@iconify-icons/material-symbols/check";
import Icon from "../icon/Icon.vue";
import { vRipple } from "../../directives/ripple";
import {
  buttonSizeClasses,
  buttonVariantClasses,
  type ButtonSize,
  type ButtonVariant,
} from "../button/shared";
import { buttonGroupContextKey, type ButtonGroupValue } from "./context";

defineOptions({ inheritAttrs: false });

interface ButtonGroupItemProps {
  /** 纯文本内容；存在默认插槽时被插槽覆盖。 */
  label?: string;
  /** 未选中时的前置图标；选中后固定显示勾选图标。 */
  icon?: IconifyIcon | string;
  value?: ButtonGroupValue;
  /** 覆盖 ButtonGroup 的层级。 */
  variant?: ButtonVariant;
  /** 覆盖 ButtonGroup 的尺寸。 */
  size?: ButtonSize;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  /** 由 ButtonGroup 注入的内部索引，无需手写。 */
  index?: number;
  /** 由 ButtonGroup 注入：是否为最后一个子项。 */
  last?: boolean;
}

const props = withDefaults(defineProps<ButtonGroupItemProps>(), {
  label: undefined,
  icon: undefined,
  value: undefined,
  variant: undefined,
  size: undefined,
  disabled: false,
  type: "button",
  index: 0,
  last: false,
});

const group = inject(buttonGroupContextKey, null);

const resolvedValue = computed<ButtonGroupValue>(() => props.value ?? props.index);
const selected = computed(() => group?.isSelected(resolvedValue.value) ?? false);
const selectable = computed(() => Boolean(group?.selection));
const variant = computed<ButtonVariant>(() => props.variant ?? group?.variant ?? "filled");
const size = computed<ButtonSize>(() => props.size ?? group?.size ?? "md");

/**
 * 选中态的圆角，两种形状共用同一个令牌（`--ds-radius`，8px）：
 * standard 下选中的子项从完整胶囊收成更小的圆角；connected 下不论位于哪一端，
 * 四个角都统一成这个圆角，不会出现「一端全圆、一端小圆」的不对称。
 */
const selectedRadiusClasses = "rounded-ds";

/** 未选中时：standard 都是完整胶囊；connected 只保留两端的大圆角，中间收成 4px。 */
const radiusClass = computed(() => {
  if (selected.value) return selectedRadiusClasses;
  if (!group || group.shape === "standard") return "rounded-full";
  if (props.index === 0) return props.last ? "rounded-full" : "rounded-l-full rounded-r-ds-sm";
  return props.last ? "rounded-l-ds-sm rounded-r-full" : "rounded-ds-sm";
});

function select(): void {
  if (props.disabled) return;
  group?.toggle(resolvedValue.value);
}
</script>

<template>
  <button
    v-ripple
    :type="type"
    :aria-pressed="selectable ? selected : undefined"
    :disabled="disabled"
    :class="[
      'ds-button-group-item inline-flex cursor-pointer items-center justify-center gap-2 border border-transparent font-ds text-sm leading-none font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ds-focus disabled:cursor-not-allowed disabled:opacity-50',
      radiusClass,
      selected ? 'bg-ds-primary-strong text-ds-primary' : buttonVariantClasses[variant],
      buttonSizeClasses[size],
    ]"
    @click="select"
    v-bind="$attrs"
  >
    <Icon v-if="selected" :icon="checkIcon" size="1.125em" />
    <Icon v-else-if="icon" :icon="icon" size="1.125em" />
    <span v-if="label !== undefined || $slots.default" class="truncate"
      ><slot>{{ label }}</slot></span
    >
  </button>
</template>
