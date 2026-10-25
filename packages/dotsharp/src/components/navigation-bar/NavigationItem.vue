<script setup lang="ts">
import { computed, inject } from "vue";
import type { IconifyIcon } from "@iconify/vue";
import Icon from "../icon/Icon.vue";
import { navigationContextKey, type NavigationValue } from "./context";

defineOptions({ inheritAttrs: false });

interface NavigationItemProps {
  /** 纯文本内容；存在默认插槽时被插槽覆盖。 */
  label?: string;
  /** 与 `Icon` 相同：图标数据或图标名，渲染在文字/插槽之前。 */
  icon?: IconifyIcon | string;
  value?: NavigationValue;
  /** 由 NavigationBar 注入的内部索引，无需手写。 */
  index?: number;
}

const props = withDefaults(defineProps<NavigationItemProps>(), {
  label: undefined,
  icon: undefined,
  value: undefined,
  index: 0,
});

const navigation = inject(navigationContextKey, null);

/** `medium` 下图标与文字横排，且高亮胶囊覆盖两者。 */
const medium = computed(() => navigation?.variant.value === "medium");

const resolvedValue = computed<NavigationValue>(() => props.value ?? props.index);
const selected = computed(() => navigation?.model.value === resolvedValue.value);

function select(): void {
  if (!navigation || selected.value) return;
  navigation.model.value = resolvedValue.value;
}
</script>

<template>
  <button
    type="button"
    :aria-current="selected ? 'page' : undefined"
    :class="[
      'ds-navigation-item group inline-flex min-w-0 flex-1 cursor-pointer items-center justify-center rounded-ds border-0 bg-transparent px-2 font-ds text-sm leading-none transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ds-focus',
      medium ? 'py-2' : 'flex-col gap-1 py-1.5',
      selected
        ? medium
          ? 'text-ds-primary-strong'
          : 'text-ds-fg'
        : 'text-ds-muted hover:text-ds-fg',
    ]"
    @click="select"
    v-bind="$attrs"
  >
    <template v-if="medium">
      <span
        :class="[
          'inline-flex min-w-0 max-w-full items-center justify-center gap-2 rounded-full px-4 py-2 transition-colors',
          selected ? 'bg-ds-primary-strong/10' : 'group-hover:bg-ds-surface-hover',
        ]"
      >
        <Icon
          v-if="icon"
          :icon="icon"
          size="1.5em"
          :class="selected ? 'text-ds-primary-strong' : undefined"
        />
        <span v-if="$slots.default || label" class="min-w-0 truncate">
          <slot>{{ label }}</slot>
        </span>
      </span>
    </template>
    <template v-else>
      <span
        :class="[
          'inline-flex items-center justify-center rounded-full px-4 py-1.5 transition-colors',
          selected ? 'bg-ds-primary-strong/10' : 'group-hover:bg-ds-surface-hover',
        ]"
      >
        <Icon
          v-if="icon"
          :icon="icon"
          size="1.5em"
          :class="selected ? 'text-ds-primary-strong' : undefined"
        />
      </span>
      <span v-if="$slots.default || label" class="max-w-full truncate">
        <slot>{{ label }}</slot>
      </span>
    </template>
  </button>
</template>
