<script setup lang="ts">
import { computed, inject, ref, useId } from "vue";
import type { IconifyIcon } from "@iconify/vue";
import checkIcon from "@iconify-icons/material-symbols/check";
import Icon from "../icon/Icon.vue";
import { selectContextKey, type SelectValue } from "./context";

defineOptions({ inheritAttrs: false });

interface OptionProps {
  /**
   * 选项文本。默认插槽优先渲染；使用插槽时 `label` 仍必须提供，
   * 因为收起态的触发器只用 `label` 描述当前选中项。
   */
  label?: string;
  /** 与 `Icon` 相同：图标数据或图标名，渲染在文字/插槽之前。 */
  icon?: IconifyIcon | string;
  value?: SelectValue;
  /** 由 Select 注入的内部索引，无需手写。 */
  index?: number;
  disabled?: boolean;
}

const props = withDefaults(defineProps<OptionProps>(), {
  label: undefined,
  icon: undefined,
  value: undefined,
  index: 0,
  disabled: false,
});

const select = inject(selectContextKey, null);

const uid = useId();
const el = ref<HTMLElement | null>(null);

const optionId = `ds-select-option-${uid}`;
const resolvedValue = computed<SelectValue>(() => props.value ?? props.index);
const selected = computed(() => select?.model.value === resolvedValue.value);
const active = computed(() => Boolean(el.value) && select?.activeEl.value === el.value);

function choose(): void {
  if (props.disabled) return;
  select?.select(resolvedValue.value);
}

function highlight(): void {
  if (props.disabled) return;
  select?.setActive(el.value);
}
</script>

<template>
  <div
    :id="optionId"
    ref="el"
    role="option"
    :aria-selected="selected"
    :aria-disabled="disabled || undefined"
    :class="[
      'ds-option flex min-h-12 items-center gap-3 px-4 text-base leading-6 outline-none transition-colors',
      disabled ? 'cursor-not-allowed text-ds-muted opacity-38' : 'cursor-pointer',
      selected ? 'bg-ds-tonal text-ds-on-tonal' : active ? 'bg-ds-fg/8 text-ds-fg' : 'text-ds-fg',
    ]"
    @pointerdown.prevent
    @pointerenter="highlight"
    @click="choose"
    v-bind="$attrs"
  >
    <Icon v-if="icon" :icon="icon" size="1.5em" />
    <span class="min-w-0 flex-1 truncate"
      ><slot>{{ label }}</slot></span
    >
    <Icon v-if="selected" :icon="checkIcon" size="1.5em" />
  </div>
</template>
