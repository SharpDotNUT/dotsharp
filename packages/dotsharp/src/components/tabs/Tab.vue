<script setup lang="ts">
import { computed, inject, onBeforeUnmount, onMounted, ref } from "vue";
import type { IconifyIcon } from "@iconify/vue";
import Icon from "../icon/Icon.vue";
import { tabsContextKey, type TabsValue } from "./context";

defineOptions({ inheritAttrs: false });

interface TabProps {
  label?: string;
  /** 与 `Icon` 相同：图标数据或图标名，渲染在文字/插槽之前。 */
  icon?: IconifyIcon | string;
  value?: TabsValue;
  /** 由 Tabs 注入的内部索引，无需手写。 */
  index?: number;
  disabled?: boolean;
}

const props = withDefaults(defineProps<TabProps>(), {
  label: undefined,
  icon: undefined,
  value: undefined,
  index: 0,
  disabled: false,
});

const tabs = inject(tabsContextKey, null);

const el = ref<HTMLButtonElement | null>(null);

const resolvedValue = computed<TabsValue>(() => props.value ?? props.index);
const selected = computed(() => tabs?.model.value === resolvedValue.value);
const focused = computed(() => tabs?.focusValue.value === resolvedValue.value);

onMounted(() => tabs?.register(resolvedValue.value, el.value));
onBeforeUnmount(() => tabs?.register(resolvedValue.value, null));

function select(): void {
  if (props.disabled || !tabs || selected.value) return;
  tabs.model.value = resolvedValue.value;
}
</script>

<template>
  <button
    ref="el"
    type="button"
    role="tab"
    :aria-selected="selected"
    :disabled="disabled"
    :tabindex="tabs ? (focused ? 0 : -1) : undefined"
    :class="[
      'ds-tab inline-flex cursor-pointer items-center justify-center border-0 bg-transparent font-ds text-sm leading-tight transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ds-focus disabled:cursor-not-allowed disabled:opacity-40',
      tabs?.variant.value
        ? 'flex-1 flex-row gap-2 px-5 py-3'
        : 'flex-1 flex-col gap-1 px-6 pt-2.5 pb-3',
      selected ? 'text-ds-fg' : 'text-ds-muted hover:text-ds-fg',
    ]"
    @click="select"
    @focus="tabs?.setFocus(resolvedValue)"
    v-bind="$attrs"
  >
    <Icon v-if="icon" :icon="icon" size="1.25em" />
    <slot>{{ label }}</slot>
  </button>
</template>
