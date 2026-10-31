<script setup lang="ts">
import {
  computed,
  inject,
  nextTick,
  onBeforeUnmount,
  ref,
  shallowRef,
  useAttrs,
  useId,
  useSlots,
  watch,
} from "vue";
import type { IconifyIcon } from "@iconify/vue";
import Icon from "../icon/Icon.vue";
import { vRipple } from "../../directives/ripple";
import { useFieldValidation } from "../../composables/useFieldValidation";
import { formItemContextKey, type FormValidateTrigger, type FormValidator } from "../form/context";
import closeIcon from "@iconify-icons/material-symbols/close";
import errorIcon from "@iconify-icons/material-symbols/error";
import visibilityIcon from "@iconify-icons/material-symbols/visibility";
import visibilityOffIcon from "@iconify-icons/material-symbols/visibility-off";

defineOptions({ inheritAttrs: false });

type InputVariant = "outlined" | "filled";
type InputShape = "default" | "pill";

interface InputProps {
  /** 容器样式：outlined 为描边，filled 为浅色填充 + 底边。 */
  variant?: InputVariant;
  /** 容器形状：`pill` 为胶囊形搜索栏（无描边、浅色填充、高 40px），多行时忽略。 */
  shape?: InputShape;
  /** 浮动标签，位于描边的缺口处；与 `placeholder` 同用时不重叠：后者只在标签上浮后出现。 */
  label?: string;
  /** 标签始终位于描边缺口处；默认只在聚焦或有内容时上浮。 */
  floatLabel?: boolean;
  /** 原生 input 类型，如 text、email、password、number、search、tel。 */
  type?: string;
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
  /**
   * 验证函数：接收当前值，返回 `false` 表示通过，返回 `true` 或错误文案表示不通过。
   * 不通过时描边、标签、辅助文字与图标切换到错误样式，文案优先使用返回的字符串。
   */
  validator?: FormValidator<string | number>;
  /** 自动校验时机，默认 `["input", "blur"]`；传 `[]` 关闭自动校验，只用 `validate()` / 表单提交。 */
  validateOn?: FormValidateTrigger | FormValidateTrigger[];
  maxlength?: number;
  /** 是否显示字数统计；设置 maxlength 时自动显示。 */
  showCount?: boolean;
  /**
   * 自动完成候选函数：接收当前输入文本，返回候选文本数组。
   * 返回空数组时收起候选栏；单行文本框才生效（`textarea` 忽略）。
   * 与原生 `autocomplete` 属性互不影响：后者仍可照常透传给原生控件。
   */
  suggest?: (input: string) => string[];
}

const props = withDefaults(defineProps<InputProps>(), {
  variant: "outlined",
  shape: "default",
  label: undefined,
  floatLabel: false,
  type: "text",
  disabled: false,
  readonly: false,
  textarea: false,
  rows: 3,
  clearable: false,
  revealable: true,
  leadingIcon: undefined,
  trailingIcon: undefined,
  description: undefined,
  validator: undefined,
  validateOn: undefined,
  maxlength: undefined,
  showCount: false,
  suggest: undefined,
});

const model = defineModel<string | number>({ default: "" });
const emit = defineEmits<{ clear: []; select: [value: string] }>();

const attrs = useAttrs();
const slots = useSlots();
const uid = useId();

/** `class` / `style` 落在根元素上，其余属性与事件全部透传给原生控件。 */
const controlAttrs = computed(() => {
  const { class: _class, style: _style, placeholder: _placeholder, ...rest } = attrs;
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
/** 焦点是否落在输入框内部（含清除 / 明文按钮），与标签上浮用的 `focus-within` 保持一致。 */
const focused = ref(false);
/** 胶囊形只对单行有意义：多行文本回到 `variant` 的样式。 */
const pill = computed(() => props.shape === "pill" && !props.textarea);

/**
 * 标签是否已经上浮：上浮后它离开输入区，`placeholder` 才有位置显示。
 * 胶囊形不渲染可见标签，`filled` / 多行 / `floatLabel` 的标签始终在顶部。
 */
const labelFloated = computed(() => {
  if (!props.label || pill.value) return true;
  if (props.variant === "filled" || props.textarea || props.floatLabel) return true;
  return focused.value || hasValue.value;
});

/** 有 `label` 时，`placeholder` 只在标签上浮后出现，未聚焦的空状态下只显示标签，两者不重叠。 */
const placeholder = computed(() => {
  if (!labelFloated.value) return undefined;
  const value = attrs.placeholder;
  return typeof value === "string" ? value : undefined;
});

const formItem = inject(formItemContextKey, null);

const {
  invalid: isInvalid,
  message: validationMessage,
  trigger: triggerValidation,
  validate,
  clearValidate,
} = useFieldValidation({
  value: () => model.value,
  validator: () => props.validator,
  triggers: () => props.validateOn,
});

const message = computed(() =>
  isInvalid.value ? (validationMessage.value ?? props.description) : props.description,
);
const showCount = computed(() => props.showCount || props.maxlength !== undefined);

/** `FormItem` 的标签在没有自己的 `label` 时充当控件的可访问名称。 */
const itemLabelAttrs = computed(() => {
  const labelId = formItem?.labelId.value;
  if (props.label || !labelId || "aria-label" in attrs || "aria-labelledby" in attrs) return {};
  return { "aria-labelledby": labelId };
});

const revealed = ref(false);
const resolvedType = computed(() =>
  props.type === "password" && revealed.value ? "text" : props.type,
);
const canReveal = computed(() => props.type === "password" && props.revealable && !props.disabled);
const canClear = computed(
  () => props.clearable && hasValue.value && !props.disabled && !props.readonly,
);
defineExpose({ validate, clearValidate });

const statusIcon = computed(() => (isInvalid.value ? errorIcon : null));

const controlRef = ref<HTMLInputElement | HTMLTextAreaElement | null>(null);

function clear() {
  model.value = "";
  closePanel();
  emit("clear");
  controlRef.value?.focus();
}

/*
 * 自动完成：候选栏与 Select 的弹层同一套规格（body 下 fixed 定位、elevated 底色、4px 圆角、
 * elevation 2 阴影、48px 行高）。`suggest` 是同步函数，模型每次变化都重新求值；
 * 面板只在聚焦或输入时打开，程序化赋值不会弹出来。
 */
const boxRef = ref<HTMLElement | null>(null);
const panelRef = ref<HTMLElement | null>(null);
const panelId = `${inputId.value}-suggest`;
const open = ref(false);
const activeIndex = ref(-1);
/** 弹层几何；`null` 表示尚未测量，此时保持不可见，避免在错误位置闪一下。 */
const position = shallowRef<{ top: number; left: number; width: number; maxHeight: number } | null>(
  null,
);

const canSuggest = computed(
  () => Boolean(props.suggest) && !props.textarea && !props.disabled && !props.readonly,
);

const suggestions = computed<string[]>(() => {
  if (!canSuggest.value) return [];
  const list = props.suggest?.(String(model.value ?? ""));
  return Array.isArray(list) ? list : [];
});

const panelStyle = computed(() => {
  const rect = position.value;
  if (!rect) return { visibility: "hidden" as const };
  return {
    top: `${rect.top}px`,
    left: `${rect.left}px`,
    width: `${rect.width}px`,
    maxHeight: `${rect.maxHeight}px`,
  };
});

const GAP = 4;
const EDGE = 8;
const MAX_HEIGHT = 320;

/** 输入框的视口矩形决定弹层位置；下方放不下且上方更宽裕时改为向上展开。 */
function place(): void {
  const box = boxRef.value;
  const panel = panelRef.value;
  if (!box || !panel) return;

  // 先解除 max-height 再量，否则第二次测量只能拿到被裁剪后的高度。
  const previous = panel.style.maxHeight;
  panel.style.maxHeight = "none";
  const natural = panel.offsetHeight;
  panel.style.maxHeight = previous;

  const rect = box.getBoundingClientRect();
  const below = window.innerHeight - rect.bottom - GAP - EDGE;
  const above = rect.top - GAP - EDGE;
  const up = natural > below && above > below;
  const maxHeight = Math.max(Math.min(natural, up ? above : below, MAX_HEIGHT), 48);
  const height = Math.min(natural, maxHeight);

  position.value = {
    top: up ? rect.top - GAP - height : rect.bottom + GAP,
    left: Math.max(EDGE, Math.min(rect.left, window.innerWidth - rect.width - EDGE)),
    width: rect.width,
    maxHeight,
  };
}

function listen(on: boolean): void {
  if (typeof document === "undefined") return;
  if (on) {
    document.addEventListener("pointerdown", onPointerDown, true);
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
  } else {
    document.removeEventListener("pointerdown", onPointerDown, true);
    window.removeEventListener("resize", place);
    window.removeEventListener("scroll", place, true);
  }
}

function onPointerDown(event: Event): void {
  const target = event.target as Node | null;
  if (!target) return;
  if (boxRef.value?.contains(target) || panelRef.value?.contains(target)) return;
  closePanel();
}

async function openPanel(): Promise<void> {
  if (!canSuggest.value || open.value || !suggestions.value.length) return;

  activeIndex.value = -1;
  open.value = true;
  position.value = null;
  await nextTick();
  if (!open.value) return;

  place();
  listen(true);
}

function closePanel(): void {
  if (!open.value) return;
  open.value = false;
  activeIndex.value = -1;
  listen(false);
}

function onInput(event: Event): void {
  activeIndex.value = -1;
  if (suggestions.value.length) void openPanel();
  else closePanel();
  // 受控组件里 `model` 可能比 DOM 晚一拍，直接读事件里的值，保证校验的是刚输入的内容。
  const target = event.target as HTMLInputElement | HTMLTextAreaElement | null;
  triggerValidation("input", target?.value);
}

function onBlur(event: Event): void {
  closePanel();
  const target = event.target as HTMLInputElement | HTMLTextAreaElement | null;
  triggerValidation("blur", target?.value);
}

function onFocus(): void {
  if (suggestions.value.length) void openPanel();
}

/** 焦点仍在容器内（例如点到清除按钮）时不收起标签，与 CSS 的 `focus-within` 一致。 */
function onFocusOut(event: FocusEvent): void {
  const next = event.relatedTarget as Node | null;
  if (next && boxRef.value?.contains(next)) return;
  focused.value = false;
}

function choose(value: string): void {
  model.value = value;
  closePanel();
  emit("select", value);
  controlRef.value?.focus();
}

function reveal(index: number): void {
  const panel = panelRef.value;
  const el = panel?.querySelector<HTMLElement>(`[data-index="${index}"]`);
  if (!panel || !el) return;
  const top = el.offsetTop;
  const bottom = top + el.offsetHeight;
  if (top < panel.scrollTop) panel.scrollTop = top - 4;
  else if (bottom > panel.scrollTop + panel.clientHeight) {
    panel.scrollTop = bottom - panel.clientHeight + 4;
  }
}

function move(step: 1 | -1): void {
  const length = suggestions.value.length;
  if (!length) return;
  activeIndex.value =
    activeIndex.value < 0
      ? step === 1
        ? 0
        : length - 1
      : (activeIndex.value + step + length) % length;
  reveal(activeIndex.value);
}

function onKeydown(event: KeyboardEvent): void {
  if (!canSuggest.value || event.defaultPrevented) return;

  if (!open.value) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      void openPanel();
    }
    return;
  }

  switch (event.key) {
    case "Escape":
      event.preventDefault();
      closePanel();
      break;
    case "Tab":
      closePanel();
      break;
    case "ArrowDown":
      event.preventDefault();
      move(1);
      break;
    case "ArrowUp":
      event.preventDefault();
      move(-1);
      break;
    case "Enter":
      if (activeIndex.value >= 0) {
        event.preventDefault();
        const value = suggestions.value[activeIndex.value];
        if (value !== undefined) choose(value);
      }
      break;
  }
}

watch(
  () => props.disabled,
  (disabled) => {
    if (disabled) closePanel();
  },
);

watch(suggestions, (list) => {
  if (!list.length) closePanel();
  else if (activeIndex.value >= list.length) activeIndex.value = -1;
  // 候选数量变化会改变弹层高度，重新测量才能保证不越过视口。
  if (open.value) void nextTick(place);
});

onBeforeUnmount(() => listen(false));

/*
 * 描边缺口由 fieldset/legend 画出。浏览器把 fieldset 的可见顶边画在 legend 的垂直中心，
 * 而 legend 是 text-xs + leading-none（12px 行高），所以可见描边会比 fieldset 盒顶低 6px。
 * 因此有标签时 fieldset 上移 6px（-top-1.5），可见描边正好落在盒顶，标签和内容都不需要额外补偿；
 * 没有标签就没有 legend，fieldset 保持 top-0，否则描边会比盒顶高 6px，输入框看起来更高、文字偏下。
 *
 * 水平方向：容器 px-4(16px)，前置内容固定 w-6(24px) 且 gap-2(8px)，所以带前置内容时文字从 48px 开始。
 */
const labelOffsetClasses = computed(() => (hasLeading.value ? "left-12" : "left-4"));
const legendOffsetClasses = computed(() => (hasLeading.value ? "ml-11" : "ml-3"));

const outlineClasses = computed(() =>
  isInvalid.value
    ? "border-ds-error group-focus-within:border-ds-error group-focus-within:border-2"
    : "border-ds-outline group-focus-within:border-ds-primary-strong group-focus-within:border-2",
);

const filledClasses = computed(() =>
  isInvalid.value
    ? "border-ds-error group-focus-within:border-ds-error group-focus-within:border-b-2"
    : "border-ds-outline group-focus-within:border-ds-primary-strong group-focus-within:border-b-2",
);

/** 胶囊形没有描边，校验不通过与聚焦改用 `ring`，不改变盒子尺寸。 */
const pillClasses = computed(() =>
  isInvalid.value
    ? "ring-1 ring-ds-error group-focus-within:ring-2 group-focus-within:ring-ds-error"
    : "group-focus-within:ring-2 group-focus-within:ring-ds-primary-strong",
);

const labelStateClass = computed(() =>
  isInvalid.value ? "text-ds-error" : "text-ds-muted group-focus-within:text-ds-primary-strong",
);

const messageClass = computed(() => (isInvalid.value ? "text-ds-error" : "text-ds-muted"));

const boxClasses = computed(() => {
  const classes = [props.disabled ? "opacity-60" : ""];
  if (pill.value) {
    classes.push("group relative rounded-full bg-ds-surface-hover", pillClasses.value);
  } else if (props.variant === "filled") {
    classes.push(
      "group relative rounded-t-ds-sm border-b bg-ds-surface-hover",
      filledClasses.value,
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
  classes.push(labelStateClass.value);
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
    <div
      ref="boxRef"
      :class="boxClasses"
      :data-filled="hasValue ? 'true' : undefined"
      @focusin="focused = true"
      @focusout="onFocusOut"
    >
      <fieldset
        v-if="variant === 'outlined' && !pill"
        class="pointer-events-none absolute right-0 bottom-0 left-0 z-10 m-0 box-border min-w-0 rounded-ds-sm border p-0 transition-colors"
        :class="[label ? '-top-1.5' : 'top-0', outlineClasses]"
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
          v-bind="{ ...controlAttrs, ...itemLabelAttrs }"
          :id="inputId"
          :rows="rows"
          :placeholder="placeholder"
          :maxlength="maxlength"
          :disabled="disabled"
          :readonly="readonly"
          :aria-invalid="isInvalid || undefined"
          :aria-required="formItem?.required.value || undefined"
          :aria-describedby="message ? messageId : undefined"
          :class="controlClasses"
          @input="onInput"
          @blur="onBlur"
        />
        <input
          v-else
          ref="controlRef"
          v-model="model"
          :aria-label="pill && label ? label : undefined"
          v-bind="{ ...controlAttrs, ...itemLabelAttrs }"
          :id="inputId"
          :type="resolvedType"
          :placeholder="placeholder"
          :maxlength="maxlength"
          :disabled="disabled"
          :readonly="readonly"
          :aria-invalid="isInvalid || undefined"
          :aria-required="formItem?.required.value || undefined"
          :aria-describedby="message ? messageId : undefined"
          :role="canSuggest ? 'combobox' : undefined"
          :aria-autocomplete="canSuggest ? 'list' : undefined"
          :aria-expanded="canSuggest ? open : undefined"
          :aria-controls="open ? panelId : undefined"
          :aria-activedescendant="
            open && activeIndex >= 0 ? `${panelId}-option-${activeIndex}` : undefined
          "
          :class="controlClasses"
          @input="onInput"
          @focus="onFocus"
          @blur="onBlur"
          @keydown="onKeydown"
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
          class="flex shrink-0 items-center justify-center text-ds-error"
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
      <span v-if="message" :id="messageId" :class="messageClass">
        {{ message }}
      </span>
      <span v-if="showCount" class="ml-auto shrink-0 text-ds-muted tabular-nums">
        {{ count }}<template v-if="maxlength !== undefined"> / {{ maxlength }}</template>
      </span>
    </div>

    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-100 ease-out"
        enter-from-class="opacity-0 -translate-y-1"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition duration-75 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-1"
      >
        <div
          v-if="open"
          :id="panelId"
          ref="panelRef"
          role="listbox"
          tabindex="-1"
          :style="panelStyle"
          class="ds-input__suggest fixed z-50 overflow-y-auto rounded-ds-sm bg-ds-elevated py-2 font-ds text-base text-ds-fg shadow-ds-2"
          @pointerdown.prevent
        >
          <div
            v-for="(item, index) in suggestions"
            :id="`${panelId}-option-${index}`"
            :key="index"
            :data-index="index"
            role="option"
            v-ripple
            :aria-selected="index === activeIndex"
            :class="[
              'flex min-h-12 cursor-pointer items-center px-4 leading-6 transition-colors',
              index === activeIndex ? 'bg-ds-fg/8 text-ds-fg' : 'text-ds-fg',
            ]"
            @pointerenter="activeIndex = index"
            @click="choose(item)"
          >
            {{ item }}
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
