<script setup lang="ts">
import { computed, useAttrs, useId } from "vue";
import checkIcon from "@iconify-icons/material-symbols/check";
import removeIcon from "@iconify-icons/material-symbols/remove";
import Icon from "../icon/Icon.vue";

defineOptions({ inheritAttrs: false });

interface CheckboxProps {
  /** 复选框右侧的文本；存在默认插槽时被插槽覆盖。 */
  label?: string;
  /** 不确定状态：显示横线，原生 `indeterminate` 同义。 */
  indeterminate?: boolean;
  disabled?: boolean;
}

const props = withDefaults(defineProps<CheckboxProps>(), {
  label: undefined,
  indeterminate: false,
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

const inputId = computed(() => (attrs.id as string | undefined) ?? `ds-checkbox-${uid}`);
const checked = computed(() => model.value && !props.indeterminate);
const active = computed(() => model.value || props.indeterminate);
</script>

<template>
  <label
    :class="[
      'ds-checkbox group inline-flex items-center gap-2 font-ds text-base leading-6 text-ds-fg',
      disabled ? 'cursor-not-allowed opacity-38' : 'cursor-pointer',
    ]"
    v-bind="rootAttrs"
  >
    <span
      :class="[
        'relative inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors',
        !disabled ? 'group-hover:bg-ds-fg/8' : '',
      ]"
    >
      <input
        :id="inputId"
        v-model="model"
        v-bind="controlAttrs"
        type="checkbox"
        :indeterminate="indeterminate"
        :disabled="disabled"
        class="peer absolute inset-0 z-10 m-0 h-full w-full cursor-pointer appearance-none opacity-0 disabled:cursor-not-allowed"
      />
      <span
        aria-hidden="true"
        :class="[
          'pointer-events-none flex h-[18px] w-[18px] box-border items-center justify-center rounded-[2px] border-2 transition-colors peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ds-focus',
          active
            ? 'border-ds-primary-strong bg-ds-primary-strong text-ds-primary'
            : 'border-ds-fg bg-transparent text-transparent',
        ]"
      >
        <Icon v-if="indeterminate" :icon="removeIcon" size="0.875em" />
        <Icon v-else-if="checked" :icon="checkIcon" size="0.875em" />
      </span>
    </span>

    <span v-if="label || $slots.default" class="min-w-0">
      <slot>{{ label }}</slot>
    </span>
  </label>
</template>
