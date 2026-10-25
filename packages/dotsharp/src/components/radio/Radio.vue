<script setup lang="ts">
import { computed, inject, useAttrs } from "vue";
import { radioContextKey, type RadioValue } from "./context";

defineOptions({ inheritAttrs: false });

interface RadioProps {
  /** 单选按钮右侧的文本；存在默认插槽时被插槽覆盖。 */
  label?: string;
  value?: RadioValue;
  /** 由 RadioGroup 注入的内部索引，无需手写。 */
  index?: number;
  disabled?: boolean;
}

const props = withDefaults(defineProps<RadioProps>(), {
  label: undefined,
  value: undefined,
  index: 0,
  disabled: false,
});

const group = inject(radioContextKey, null);
const attrs = useAttrs();

const resolvedValue = computed<RadioValue>(() => props.value ?? props.index);
const selected = computed(() => group?.model.value === resolvedValue.value);
const disabled = computed(() => props.disabled || Boolean(group?.disabled.value));
const name = computed(() => group?.name.value);

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

function choose(): void {
  if (!group || disabled.value) return;
  group.model.value = resolvedValue.value;
  group.notify("input", resolvedValue.value);
}
</script>

<template>
  <label
    :class="[
      'ds-radio group inline-flex items-center gap-2 font-ds text-base leading-6 text-ds-fg',
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
        v-bind="controlAttrs"
        type="radio"
        :name="name"
        :value="resolvedValue"
        :checked="selected"
        :disabled="disabled"
        class="peer absolute inset-0 z-10 m-0 h-full w-full cursor-pointer appearance-none opacity-0 disabled:cursor-not-allowed"
        @change="choose"
        @blur="group?.notify('blur')"
      />
      <span
        aria-hidden="true"
        :class="[
          'pointer-events-none flex h-5 w-5 box-border items-center justify-center rounded-full border-2 transition-colors peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ds-focus',
          selected ? 'border-ds-primary-strong' : 'border-ds-outline',
        ]"
      >
        <span
          :class="[
            'h-2.5 w-2.5 rounded-full bg-ds-primary-strong transition-transform duration-150',
            selected ? 'scale-100' : 'scale-0',
          ]"
        />
      </span>
    </span>

    <span v-if="label || $slots.default" class="min-w-0">
      <slot>{{ label }}</slot>
    </span>
  </label>
</template>
