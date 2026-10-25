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
  /** 选中时替换 `icon` 的图标数据。 */
  activeIcon?: IconifyIcon | string;
  value?: NavigationRailValue;
  /** 由 NavigationRail 注入的内部索引，无需手写。 */
  index?: number;
  /** 有值时根元素渲染成 `<a>`，用于真实链接导航。 */
  href?: string;
  disabled?: boolean;
}

const props = withDefaults(defineProps<NavigationRailItemProps>(), {
  label: undefined,
  icon: undefined,
  activeIcon: undefined,
  value: undefined,
  index: 0,
  href: undefined,
  disabled: false,
});

const rail = inject(navigationRailContextKey, null);

/** 只有可展开 rail 展开时才切成横向布局；折叠态始终是图标在上、文字在下。 */
const expandedLayout = computed(
  () => (rail?.expandable.value ?? false) && (rail?.expanded.value ?? false),
);

const resolvedValue = computed<NavigationRailValue>(() => props.value ?? props.index);
const selected = computed(() => rail?.model.value === resolvedValue.value);

const resolvedIcon = computed(() =>
  selected.value && props.activeIcon ? props.activeIcon : props.icon,
);

const isLink = computed(() => props.href !== undefined);

function select(): void {
  if (props.disabled || !rail || selected.value) return;
  rail.model.value = resolvedValue.value;
}
</script>

<template>
  <component
    :is="isLink ? 'a' : 'button'"
    :href="isLink ? href : undefined"
    :type="isLink ? undefined : 'button'"
    :disabled="isLink ? undefined : disabled"
    :aria-disabled="isLink && disabled ? 'true' : undefined"
    :tabindex="isLink && disabled ? -1 : undefined"
    :aria-current="selected ? 'page' : undefined"
    :class="[
      'ds-navigation-rail-item group flex w-full cursor-pointer items-center border-0 font-ds no-underline transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ds-focus',
      expandedLayout ? 'h-16 w-full px-5' : 'min-h-16 flex-col justify-center gap-1 px-1 py-2',
      selected ? 'text-ds-secondary' : 'text-ds-muted',
    ]"
    @click="select"
    v-bind="$attrs"
  >
    <template v-if="expandedLayout">
      <span
        :class="[
          'flex h-14 w-full items-center gap-2 rounded-full px-4 transition-colors',
          selected ? 'bg-ds-tonal' : 'group-hover:bg-ds-surface-hover',
        ]"
      >
        <Icon
          v-if="resolvedIcon"
          :icon="resolvedIcon"
          size="24"
          :class="selected ? 'text-ds-on-tonal' : undefined"
        />
        <span class="min-w-0 truncate text-sm">
          <slot>{{ label }}</slot>
        </span>
      </span>
    </template>
    <template v-else>
      <span
        :class="[
          'inline-flex h-8 w-14 items-center justify-center rounded-full transition-colors',
          selected ? 'bg-ds-tonal' : 'group-hover:bg-ds-surface-hover',
        ]"
      >
        <Icon
          v-if="resolvedIcon"
          :icon="resolvedIcon"
          size="24"
          :class="selected ? 'text-ds-on-tonal' : undefined"
        />
      </span>
      <span class="max-w-full truncate text-xs">
        <slot>{{ label }}</slot>
      </span>
    </template>
  </component>
</template>
