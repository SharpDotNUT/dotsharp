<script setup lang="ts">
import { computed, ref, useAttrs, useId, useSlots } from "vue";
import type { IconifyIcon } from "@iconify/vue";
import Icon from "../icon/Icon.vue";
import { vRipple } from "../../directives/ripple";
import checkCircleIcon from "@iconify-icons/material-symbols/check-circle";
import closeIcon from "@iconify-icons/material-symbols/close";
import errorIcon from "@iconify-icons/material-symbols/error";
import visibilityIcon from "@iconify-icons/material-symbols/visibility";
import visibilityOffIcon from "@iconify-icons/material-symbols/visibility-off";

defineOptions({ inheritAttrs: false });

type InputVariant = "outlined" | "filled";
type InputShape = "default" | "pill";
type InputState = "default" | "success" | "error";

interface InputProps {
  /** 容器样式：outlined 为描边，filled 为浅色填充 + 底边。 */
  variant?: InputVariant;
  /** 容器形状：`pill` 为胶囊形搜索栏（无描边、浅色填充、高 40px），多行时忽略。 */
  shape?: InputShape;
  /** 浮动标签，位于描边的缺口处；建议同时不要再传 placeholder。 */
  label?: string;
  /** 标签始终位于描边缺口处；默认只在聚焦或有内容时上浮。 */
  floatLabel?: boolean;
  /** 原生 input 类型，如 text、email、password、number、search、tel。 */
  type?: string;
  /** 校验状态：影响描边、标签、辅助文字与右侧状态图标。 */
  state?: InputState;
  disabled?: boolean;
  readonly?: boolean;
  /** 渲染为多行 textarea。 */
  textarea?: boolean;
  rows?: number;
  /** 有内容时在尾部显示清除按钮。 */
  clearable?: boolean;
  /** `type="password"` 时是否显示明文切换按钮。 */
  revealable?: boolean;
  /** 前置图标（直接传图标数据）；`#leading` 插槽优先且支持任意内容。 */
  leadingIcon?: IconifyIcon | string;
  /** 尾部图标（直接传图标数据）；`#trailing` 插槽优先且支持任意内容。 */
  trailingIcon?: IconifyIcon | string;
  /** 字段下方的辅助文字。 */
  description?: string;
  /** `state="error"` 时替换辅助文字的错误信息。 */
  errorMessage?: string;
  maxlength?: number;
  /** 是否显示字数统计；设置 maxlength 时自动显示。 */
  showCount?: boolean;
}

const props = withDefaults(defineProps<InputProps>(), {
  variant: "outlined",
  shape: "default",
  label: undefined,
  floatLabel: false,
  type: "text",
  state: "default",
  disabled: false,
  readonly: false,
  textarea: false,
  rows: 3,
  clearable: false,
  revealable: true,
  leadingIcon: undefined,
  trailingIcon: undefined,
  description: undefined,
  errorMessage: undefined,
  maxlength: undefined,
  showCount: false,
});

const model = defineModel<string | number>({ default: "" });
const emit = defineEmits<{ clear: [] }>();

const attrs = useAttrs();
const slots = useSlots();
const uid = useId();

/** `class` / `style` 落在根元素上，其余属性与事件全部透传给原生控件。 */
const controlAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = attrs;
  return rest;
});

const rootAttrs = computed(() => {
  const out: Record<string, unknown> = { class: attrs.class };
  if (attrs.style) out.style = attrs.style;
  return out;
});

const inputId = computed(() => (attrs.id as string | undefined) ?? `ds-input-${uid}`);
const messageId = computed(() => `${inputId.value}-message`);
const hasValue = computed(() => String(model.value ?? "").length > 0);
const count = computed(() => Array.from(String(model.value ?? "")).length);
const hasLeading = computed(() => Boolean(slots.leading) || Boolean(props.leadingIcon));
/** 胶囊形只对单行有意义：多行文本回到 `variant` 的样式。 */
const pill = computed(() => props.shape === "pill" && !props.textarea);

const message = computed(() =>
  props.state === "error" ? (props.errorMessage ?? props.description) : props.description,
);
const showCount = computed(() => props.showCount || props.maxlength !== undefined);

const revealed = ref(false);
const resolvedType = computed(() =>
  props.type === "password" && revealed.value ? "text" : props.type,
);
const canReveal = computed(() => props.type === "password" && props.revealable && !props.disabled);
const canClear = computed(
  () => props.clearable && hasValue.value && !props.disabled && !props.readonly,
);
const statusIcon = computed(() => {
  if (props.state === "success") return checkCircleIcon;
  if (props.state === "error") return errorIcon;
  return null;
});

const controlRef = ref<HTMLInputElement | HTMLTextAreaElement | null>(null);

function clear() {
  model.value = "";
  emit("clear");
  controlRef.value?.focus();
}

/*
 * 描边缺口由 fieldset/legend 画出。浏览器把 fieldset 的可见顶边画在 legend 的垂直中心，
 * 而 legend 是 text-xs + leading-none（12px 行高），所以可见描边会比 fieldset 盒顶低 6px。
 * 因此 fieldset 上移 6px（-top-1.5），可见描边正好落在盒顶，标签和内容都不需要额外补偿。
 *
 * 水平方向：容器 px-4(16px)，前置内容固定 w-6(24px) 且 gap-2(8px)，所以带前置内容时文字从 48px 开始。
 */
const labelOffsetClasses = computed(() => (hasLeading.value ? "left-12" : "left-4"));
const legendOffsetClasses = computed(() => (hasLeading.value ? "ml-11" : "ml-3"));

const outlineStateClasses: Record<InputState, string> = {
  default:
    "border-ds-outline group-focus-within:border-ds-primary-strong group-focus-within:border-2",
  success: "border-ds-success group-focus-within:border-2",
  error: "border-ds-error group-focus-within:border-2",
};

const filledStateClasses: Record<InputState, string> = {
  default:
    "border-ds-outline group-focus-within:border-ds-primary-strong group-focus-within:border-b-2",
  success: "border-ds-success group-focus-within:border-b-2",
  error: "border-ds-error group-focus-within:border-b-2",
};

/** 胶囊形没有描边，状态与聚焦改用 `ring`，不改变盒子尺寸。 */
const pillStateClasses: Record<InputState, string> = {
  default: "group-focus-within:ring-2 group-focus-within:ring-ds-primary-strong",
  success: "ring-1 ring-ds-success group-focus-within:ring-2",
  error: "ring-1 ring-ds-error group-focus-within:ring-2",
};

const labelStateClasses: Record<InputState, string> = {
  default: "text-ds-muted group-focus-within:text-ds-primary-strong",
  success: "text-ds-success",
  error: "text-ds-error",
};

const messageStateClasses: Record<InputState, string> = {
  default: "text-ds-muted",
  success: "text-ds-success",
  error: "text-ds-error",
};

const boxClasses = computed(() => {
  const classes = [props.disabled ? "opacity-60" : ""];
  if (pill.value) {
    classes.push("group relative rounded-full bg-ds-surface-hover", pillStateClasses[props.state]);
  } else if (props.variant === "filled") {
    classes.push(
      "group relative rounded-t-ds-sm border-b bg-ds-surface-hover",
      filledStateClasses[props.state],
    );
  } else {
    classes.push("group relative");
  }
  return classes;
});

const rowClasses = computed(() => {
  if (pill.value) return ["flex h-10 items-center gap-2 px-4"];

  const vertical =
    props.variant === "filled"
      ? props.label
        ? "box-border pt-6 pb-2"
        : "box-border py-2"
      : props.textarea
        ? "py-4"
        : "";
  return ["flex min-h-14 gap-2 px-4", props.textarea ? "items-start" : "items-center", vertical];
});

const labelWrapperClasses = computed(() =>
  props.variant === "filled"
    ? "pointer-events-none absolute inset-x-0 top-2 z-10"
    : "pointer-events-none absolute inset-0 z-10",
);

const labelClasses = computed(() => {
  const classes = [
    "pointer-events-none absolute max-w-[calc(100%-2rem)] truncate transition-all duration-150",
    labelOffsetClasses.value,
  ];
  if (props.variant === "filled") {
    classes.push("top-0 text-xs");
  } else if (props.textarea || props.floatLabel) {
    classes.push("top-0 -translate-y-1/2 text-xs");
  } else {
    classes.push(
      "top-1/2 -translate-y-1/2 text-base",
      "group-focus-within:top-0 group-focus-within:-translate-y-1/2 group-focus-within:text-xs",
      "group-data-[filled=true]:top-0 group-data-[filled=true]:-translate-y-1/2 group-data-[filled=true]:text-xs",
    );
  }
  classes.push(labelStateClasses[props.state]);
  return classes;
});

const legendClasses = computed(() => [
  legendOffsetClasses.value,
  "overflow-hidden whitespace-nowrap p-0 text-xs leading-none transition-[max-width] duration-150",
  props.textarea || props.floatLabel
    ? "max-w-full"
    : "max-w-0 group-focus-within:max-w-full group-data-[filled=true]:max-w-full",
]);

const controlClasses =
  "w-full min-w-0 flex-1 resize-none bg-transparent p-0 text-base leading-6 text-ds-fg caret-ds-primary-strong outline-none placeholder:text-ds-muted/60 disabled:cursor-not-allowed";

const actionClasses =
  "inline-flex box-border h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-full text-ds-muted transition-colors hover:bg-ds-fg/10 hover:text-ds-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ds-focus";
</script>

<template>
  <div class="ds-input flex w-full flex-col gap-1 font-ds" v-bind="rootAttrs">
    <div :class="boxClasses" :data-filled="hasValue ? 'true' : undefined">
      <fieldset
        v-if="variant === 'outlined' && !pill"
        class="pointer-events-none absolute -top-1.5 right-0 bottom-0 left-0 m-0 box-border min-w-0 rounded-ds-sm border p-0 transition-colors"
        :class="outlineStateClasses[state]"
        aria-hidden="true"
      >
        <legend v-if="label" :class="legendClasses">
          <span class="invisible inline-block px-1">{{ label }}</span>
        </legend>
      </fieldset>

      <div :class="rowClasses">
        <span v-if="hasLeading" class="flex w-6 shrink-0 items-center justify-center text-ds-muted">
          <slot name="leading">
            <Icon v-if="leadingIcon" :icon="leadingIcon" size="1.25em" />
          </slot>
        </span>

        <textarea
          v-if="textarea"
          ref="controlRef"
          v-model="model"
          v-bind="controlAttrs"
          :id="inputId"
          :rows="rows"
          :maxlength="maxlength"
          :disabled="disabled"
          :readonly="readonly"
          :aria-invalid="state === 'error' ? true : undefined"
          :aria-describedby="message ? messageId : undefined"
          :class="controlClasses"
        />
        <input
          v-else
          ref="controlRef"
          v-model="model"
          :aria-label="pill && label ? label : undefined"
          v-bind="controlAttrs"
          :id="inputId"
          :type="resolvedType"
          :maxlength="maxlength"
          :disabled="disabled"
          :readonly="readonly"
          :aria-invalid="state === 'error' ? true : undefined"
          :aria-describedby="message ? messageId : undefined"
          :class="controlClasses"
        />

        <span
          v-if="slots.trailing || trailingIcon"
          class="flex shrink-0 items-center justify-center text-ds-muted"
        >
          <slot name="trailing">
            <Icon v-if="trailingIcon" :icon="trailingIcon" size="1.25em" />
          </slot>
        </span>

        <span
          v-if="statusIcon"
          class="flex shrink-0 items-center justify-center"
          :class="state === 'success' ? 'text-ds-success' : 'text-ds-error'"
          aria-hidden="true"
        >
          <Icon :icon="statusIcon" size="1.25em" />
        </span>

        <button
          v-if="canClear"
          type="button"
          v-ripple
          :class="actionClasses"
          aria-label="Clear input"
          @click="clear"
        >
          <Icon :icon="closeIcon" size="1.25em" />
        </button>

        <button
          v-if="canReveal"
          type="button"
          v-ripple
          :class="actionClasses"
          :aria-label="revealed ? 'Hide password' : 'Show password'"
          :aria-pressed="revealed"
          @click="revealed = !revealed"
        >
          <Icon :icon="revealed ? visibilityOffIcon : visibilityIcon" size="1.25em" />
        </button>
      </div>

      <div v-if="label && !pill" :class="labelWrapperClasses">
        <label :for="inputId" :class="labelClasses">{{ label }}</label>
      </div>
    </div>

    <div
      v-if="message || showCount"
      class="flex items-start justify-between gap-3 px-4 text-xs leading-4"
    >
      <span v-if="message" :id="messageId" :class="messageStateClasses[state]">
        {{ message }}
      </span>
      <span v-if="showCount" class="ml-auto shrink-0 text-ds-muted tabular-nums">
        {{ count }}<template v-if="maxlength !== undefined"> / {{ maxlength }}</template>
      </span>
    </div>
  </div>
</template>
