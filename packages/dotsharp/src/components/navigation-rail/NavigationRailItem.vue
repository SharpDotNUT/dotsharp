<script setup lang="ts">
import { computed, inject } from "vue";
import type { IconifyIcon } from "@iconify/vue";
import Icon from "../icon/Icon.vue";
import { vRipple } from "../../directives/ripple";
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

/** 只有可展开 rail 展开时才切成横向布局；折叠态默认是图标在上、文字在下。 */
const expandedLayout = computed(
  () => (rail?.expandable.value ?? false) && (rail?.expanded.value ?? false),
);

/** 折叠态是否在图标下方显示文字；关闭时折叠态只剩图标。 */
const showsCollapsedLabel = computed(() => rail?.collapsedLabel.value ?? true);

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
      'ds-navigation-rail-item group relative col-span-full border-0 font-ds no-underline transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ds-focus',
      showsCollapsedLabel ? 'flex h-16 items-center' : 'grid h-12 grid-cols-subgrid items-center',
      selected ? 'text-ds-secondary' : 'text-ds-muted',
    ]"
    @click="select"
    v-bind="$attrs"
  >
    <!-- 模式一：折叠态不显示文字，行高按内容取 48px。胶囊与行同高、上下不留边距，折叠时是个圆角胶囊；
         展开时左边界贴到 rail 边缘、左角改直角，左右边界一起拉到整行 -->
    <template v-if="!showsCollapsedLabel">
      <span
        v-ripple
        :class="[
          'absolute inset-y-0 transition-[left,right,border-radius,background-color] duration-200 ease-out',
          expandedLayout ? 'inset-x-0 rounded-r-full' : 'inset-x-5 rounded-full',
          selected ? 'bg-ds-tonal' : 'group-hover:bg-ds-surface-hover',
        ]"
      />
      <span class="relative col-start-1 flex items-center justify-center">
        <Icon
          v-if="resolvedIcon"
          :icon="resolvedIcon"
          size="24"
          :class="selected ? 'text-ds-on-tonal' : undefined"
        />
      </span>
      <span
        v-if="expandedLayout"
        class="relative col-start-2 flex min-w-0 items-center pr-4 text-sm"
      >
        <span class="truncate"
          ><slot>{{ label }}</slot></span
        >
      </span>
      <span v-else class="sr-only"
        ><slot>{{ label }}</slot></span
      >
    </template>

    <!-- 模式二：折叠态在图标下方显示文字。胶囊包住图标（展开时连文字），宽度随内容、展开时撑满整行高度 -->
    <template v-else>
      <span
        v-ripple
        :class="[
          'absolute left-5 flex items-center rounded-full pl-4 pr-4 transition-[top,height,background-color] duration-200 ease-out',
          expandedLayout ? 'top-1 h-14' : 'top-1.5 h-8',
          selected ? 'bg-ds-tonal' : 'group-hover:bg-ds-surface-hover',
        ]"
      >
        <Icon
          v-if="resolvedIcon"
          :icon="resolvedIcon"
          size="24"
          :class="selected ? 'text-ds-on-tonal' : undefined"
        />
        <span v-if="expandedLayout" class="min-w-0 truncate pl-3 text-sm">
          <slot>{{ label }}</slot>
        </span>
      </span>
      <span
        v-if="!expandedLayout"
        class="absolute inset-x-0 top-[38px] truncate px-1 text-center text-xs"
      >
        <slot>{{ label }}</slot>
      </span>
    </template>
  </component>
</template>
