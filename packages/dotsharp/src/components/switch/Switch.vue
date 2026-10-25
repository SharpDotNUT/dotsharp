<script setup lang="ts">
import { computed, useAttrs, useId } from "vue";
import checkIcon from "@iconify-icons/material-symbols/check";
import Icon from "../icon/Icon.vue";

defineOptions({ inheritAttrs: false });

interface SwitchProps {
  /** 开关右侧的文本；存在默认插槽时被插槽覆盖。 */
  label?: string;
  disabled?: boolean;
}

const props = withDefaults(defineProps<SwitchProps>(), {
  label: undefined,
  disabled: false,
});

const model = defineModel<boolean>({ default: false });

const attrs = useAttrs();
const uid = useId();

/** `class` / `style` 落在根元素上，其余属性与事件全部透传给原生 `<input>`。 */
const rootAttrs = computed(() => {
  const out: Record<string, unknown> = {};
  if (attrs.class) out.class = attrs.class;
  if (attrs.style) out.style = attrs.style;
  return out;
});

const controlAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = attrs;
  return rest;
});

const inputId = computed(() => (attrs.id as string | undefined) ?? `ds-switch-${uid}`);
</script>

<template>
  <label
    :class="[
      'ds-switch group inline-flex items-center gap-3 font-ds text-base leading-6 text-ds-fg',
      disabled ? 'cursor-not-allowed opacity-38' : 'cursor-pointer',
    ]"
    v-bind="rootAttrs"
  >
    <span class="relative inline-flex h-8 w-[52px] shrink-0 items-center">
      <input
        :id="inputId"
        v-model="model"
        v-bind="controlAttrs"
        type="checkbox"
        role="switch"
        :disabled="disabled"
        class="peer absolute inset-0 z-10 m-0 h-full w-full cursor-pointer appearance-none opacity-0 disabled:cursor-not-allowed"
      />
      <span
        aria-hidden="true"
        :class="[
          'absolute inset-0 box-border rounded-full border-2 transition-colors peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ds-focus',
          model
            ? 'border-transparent bg-ds-primary-strong'
            : 'border-ds-outline bg-ds-surface-hover',
        ]"
      />
      <span
        aria-hidden="true"
        :class="[
          'absolute flex items-center justify-center rounded-full transition-all duration-200 ease-out',
          model
            ? 'left-[24px] h-6 w-6 bg-ds-primary text-ds-primary-strong'
            : 'left-2 h-4 w-4 bg-ds-outline',
        ]"
      >
        <Icon v-if="model" :icon="checkIcon" size="1em" />
      </span>
    </span>

    <span v-if="label || $slots.default" class="min-w-0">
      <slot>{{ label }}</slot>
    </span>
  </label>
</template>
