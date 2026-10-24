<script setup lang="ts">
import { computed, inject } from "vue";
import type { IconifyIcon } from "@iconify/vue";
import Icon from "../icon/Icon.vue";
import { navigationRailContextKey, type NavigationRailValue } from "./context";

defineOptions({ inheritAttrs: false });

interface NavigationRailItemProps {
  /** 纯文本内容；存在默认插槽时被插槽覆盖。 */
  label?: string;
  /** 与 `Icon` 相同：图标数据或图标名，渲染在文字/插槽之前，尺寸 24px。 */
  icon?: IconifyIcon | string;
  value?: NavigationRailValue;
  /** 由 NavigationRail 注入的内部索引，无需手写。 */
  index?: number;
}

const props = withDefaults(defineProps<NavigationRailItemProps>(), {
  label: undefined,
  icon: undefined,
  value: undefined,
  index: 0,
});

const rail = inject(navigationRailContextKey, null);

const isExpandable = computed(() => rail?.variant.value === "expandable");
/** 只有可展开变体展开时才切成横向布局；静态变体始终是图标在上、文字在下。 */
const expandedLayout = computed(() => isExpandable.value && (rail?.expanded.value ?? false));
const showLabel = computed(() => !isExpandable.value || (rail?.expanded.value ?? false));

const resolvedValue = computed<NavigationRailValue>(() => props.value ?? props.index);
const selected = computed(() => rail?.model.value === resolvedValue.value);

function select(): void {
  if (!rail || selected.value) return;
  rail.model.value = resolvedValue.value;
}
</script>

<template>
  <button
    type="button"
    :aria-current="selected ? 'page' : undefined"
    :class="[
      'ds-navigation-rail-item group flex w-full cursor-pointer items-center border-0 font-ds transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ds-focus',
      expandedLayout
        ? 'h-14 flex-row rounded-full pr-4 text-sm font-medium'
        : 'flex-col gap-1 px-1 py-2 text-xs',
      expandedLayout
        ? selected
          ? 'bg-ds-primary/10 text-ds-primary'
          : 'bg-transparent text-ds-muted hover:bg-ds-surface-hover hover:text-ds-fg'
        : selected
          ? 'text-ds-fg'
          : 'bg-transparent text-ds-muted hover:text-ds-fg',
    ]"
    @click="select"
    v-bind="$attrs"
  >
    <template v-if="expandedLayout">
      <span class="inline-flex h-14 w-16 shrink-0 items-center justify-center">
        <Icon
          v-if="icon"
          :icon="icon"
          size="24"
          :class="selected ? 'text-ds-primary' : undefined"
        />
      </span>
      <span v-if="$slots.default || label" class="min-w-0 truncate">
        <slot>{{ label }}</slot>
      </span>
    </template>
    <template v-else>
      <span
        :class="[
          'inline-flex h-8 w-14 items-center justify-center rounded-full transition-colors',
          selected ? 'bg-ds-primary/10' : 'group-hover:bg-ds-surface-hover',
        ]"
      >
        <Icon
          v-if="icon"
          :icon="icon"
          size="24"
          :class="selected ? 'text-ds-primary' : undefined"
        />
      </span>
      <span v-if="showLabel && ($slots.default || label)" class="max-w-full truncate">
        <slot>{{ label }}</slot>
      </span>
    </template>
  </button>
</template>
