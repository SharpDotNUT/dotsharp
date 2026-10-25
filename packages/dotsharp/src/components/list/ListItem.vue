<script setup lang="ts">
import { computed, useAttrs } from "vue";
import type { IconifyIcon } from "@iconify/vue";
import Icon from "../icon/Icon.vue";

defineOptions({ inheritAttrs: false });

interface ListItemProps {
  /** 主文本；存在默认插槽时被插槽覆盖。 */
  label?: string;
  /** 主文本下方的辅助文字。 */
  description?: string;
  /** 前置图标；`#leading` 插槽优先。 */
  icon?: IconifyIcon | string;
  /** 有值时整行渲染成指向该地址的链接。 */
  href?: string;
  disabled?: boolean;
}

const props = withDefaults(defineProps<ListItemProps>(), {
  label: undefined,
  description: undefined,
  icon: undefined,
  href: undefined,
  disabled: false,
});

const attrs = useAttrs();

/** `class` / `style` 落在 `<li>` 上，其余属性透传给行内容（链接时即 `<a>`）。 */
const rootAttrs = computed(() => {
  const out: Record<string, unknown> = {};
  if (attrs.class) out.class = attrs.class;
  if (attrs.style) out.style = attrs.style;
  return out;
});

const contentAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = attrs;
  return rest;
});

const isLink = computed(() => props.href !== undefined);
const inactiveLink = computed(() => isLink.value && props.disabled);
</script>

<template>
  <li class="ds-list-item m-0! p-0!" v-bind="rootAttrs">
    <component
      :is="isLink ? 'a' : 'div'"
      :href="isLink ? href : undefined"
      :aria-disabled="inactiveLink ? 'true' : undefined"
      :tabindex="inactiveLink ? -1 : undefined"
      :class="[
        'flex min-h-14 w-full items-center gap-3 px-4 py-2 text-left text-inherit! no-underline!',
        isLink
          ? 'cursor-pointer transition-colors hover:bg-ds-surface-hover focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ds-focus'
          : '',
        inactiveLink ? 'pointer-events-none opacity-38' : '',
      ]"
      v-bind="contentAttrs"
    >
      <span
        v-if="icon || $slots.leading"
        class="flex h-6 w-6 shrink-0 items-center justify-center text-ds-muted"
      >
        <slot name="leading">
          <Icon v-if="icon" :icon="icon" size="1.5em" />
        </slot>
      </span>

      <div class="min-w-0 flex-1">
        <div class="truncate text-base leading-6">
          <slot>{{ label }}</slot>
        </div>
        <p v-if="description" class="m-0! truncate text-sm leading-5! text-ds-muted">
          {{ description }}
        </p>
      </div>

      <span v-if="$slots.trailing" class="ml-auto flex shrink-0 items-center">
        <slot name="trailing" />
      </span>
    </component>
  </li>
</template>
