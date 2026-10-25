<script setup lang="ts">
import { computed, inject } from "vue";
import type { IconifyIcon } from "@iconify/vue";
import checkIcon from "@iconify-icons/material-symbols/check";
import Icon from "../icon/Icon.vue";
import { vRipple } from "../../directives/ripple";
import { segmentedContextKey, type SegmentedValue } from "./context";

defineOptions({ inheritAttrs: false });

interface SegmentedButtonProps {
  /** 纯文本内容；存在默认插槽时被插槽覆盖。 */
  label?: string;
  /** 未选中时的前置图标；选中后固定显示勾选图标。 */
  icon?: IconifyIcon | string;
  value?: SegmentedValue;
  /** 由 SegmentedButtons 注入的内部索引，无需手写。 */
  index?: number;
  disabled?: boolean;
}

const props = withDefaults(defineProps<SegmentedButtonProps>(), {
  label: undefined,
  icon: undefined,
  value: undefined,
  index: 0,
  disabled: false,
});

const group = inject(segmentedContextKey, null);

const resolvedValue = computed<SegmentedValue>(() => props.value ?? props.index);
const selected = computed(() => group?.model.value === resolvedValue.value);
const focused = computed(() => group?.focusValue.value === resolvedValue.value);

function select(): void {
  if (props.disabled || !group || selected.value) return;
  group.model.value = resolvedValue.value;
}

function focus(): void {
  group?.setFocus(resolvedValue.value);
}
</script>

<template>
  <button
    type="button"
    v-ripple
    :aria-pressed="selected"
    :disabled="disabled"
    :tabindex="group ? (focused ? 0 : -1) : undefined"
    :class="[
      'ds-segmented-button relative inline-flex h-10 min-w-0 flex-1 cursor-pointer items-center justify-center gap-1.5 border-0 bg-transparent px-4 font-ds text-sm leading-none transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ds-focus disabled:cursor-not-allowed disabled:opacity-38',
      selected ? 'bg-ds-primary text-ds-primary-strong' : 'text-ds-fg hover:bg-ds-fg/8',
    ]"
    @click="select"
    @focus="focus"
    v-bind="$attrs"
  >
    <span
      v-if="index > 0"
      aria-hidden="true"
      class="pointer-events-none absolute inset-y-0 left-0 w-px bg-ds-outline"
    />
    <Icon v-if="selected" :icon="checkIcon" size="1.25em" />
    <Icon v-else-if="icon" :icon="icon" size="1.25em" />
    <span class="truncate"
      ><slot>{{ label }}</slot></span
    >
  </button>
</template>
