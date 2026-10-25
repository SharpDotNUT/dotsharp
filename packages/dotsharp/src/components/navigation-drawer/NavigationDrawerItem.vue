<script setup lang="ts">
import { computed, inject } from "vue";
import type { IconifyIcon } from "@iconify/vue";
import Icon from "../icon/Icon.vue";
import { navigationDrawerContextKey, type NavigationDrawerValue } from "./context";

defineOptions({ inheritAttrs: false });

interface NavigationDrawerItemProps {
  /** 纯文本内容；存在默认插槽时被插槽覆盖。 */
  label?: string;
  /** 与 `Icon` 相同：图标数据或图标名，渲染在文字/插槽之前，尺寸 24px。 */
  icon?: IconifyIcon | string;
  /** 行尾计数或短文本，例如未读数。 */
  badge?: string | number;
  value?: NavigationDrawerValue;
  /** 由 NavigationDrawer 注入的内部索引，无需手写。 */
  index?: number;
  /** 有值时根元素渲染成 `<a>`，用于真实链接导航。 */
  href?: string;
  disabled?: boolean;
}

const props = withDefaults(defineProps<NavigationDrawerItemProps>(), {
  label: undefined,
  icon: undefined,
  badge: undefined,
  value: undefined,
  index: 0,
  href: undefined,
  disabled: false,
});

const drawer = inject(navigationDrawerContextKey, null);

const resolvedValue = computed<NavigationDrawerValue>(() => props.value ?? props.index);
const selected = computed(() => drawer?.model.value === resolvedValue.value);

const isLink = computed(() => props.href !== undefined);

function select(): void {
  if (props.disabled || !drawer || selected.value) return;
  drawer.model.value = resolvedValue.value;
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
      'ds-navigation-drawer-item flex h-14 w-full cursor-pointer items-center gap-3 rounded-full border-0 px-4 text-left font-ds text-sm no-underline transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ds-focus',
      selected
        ? 'bg-ds-tonal text-ds-on-tonal font-medium'
        : 'bg-transparent text-ds-muted font-normal hover:bg-ds-surface-hover hover:text-ds-fg',
    ]"
    @click="select"
    v-bind="$attrs"
  >
    <Icon v-if="icon" :icon="icon" size="24" />
    <span v-if="$slots.default || label" class="min-w-0 flex-1 truncate">
      <slot>{{ label }}</slot>
    </span>
    <span v-if="badge !== undefined" class="shrink-0 text-sm">{{ badge }}</span>
  </component>
</template>
