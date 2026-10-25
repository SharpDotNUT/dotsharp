<script setup lang="ts">
import { computed, inject, nextTick, ref, useId, watch, type ComponentPublicInstance } from "vue";
import { useFieldValidation } from "../../composables/useFieldValidation";
import { formItemContextKey, type FormValidateTrigger, type FormValidator } from "../form/context";
import type { OptInputsAccept, OptInputsLetterCase } from "./shared";
import { applyOptChars, normalizeOptValue, removeOptChar, sanitizeOptChars } from "./shared";

defineOptions({ inheritAttrs: false });

interface OptInputsProps {
  /** 输入框数量。 */
  length?: number;
  /** 允许的字符：`numeric` 数字、`alpha` 英文字母、`alphanumeric` 数字与字母、`any` 任意单一字符。 */
  accept?: OptInputsAccept;
  /** 字母大小写：`uppercase` / `lowercase` 自动转换，`none` 保持原样。 */
  letterCase?: OptInputsLetterCase;
  /** 掩码显示：输入内容以圆点呈现，模型里仍是原始字符。 */
  mask?: boolean;
  /** 是否允许剪贴板粘贴；关闭后粘贴会被直接阻止。 */
  allowPaste?: boolean;
  disabled?: boolean;
  /** 整组的可见标签，同时作为分组与每一格的可访问名称。 */
  label?: string;
  /**
   * 验证函数：接收当前值，返回 `false` 表示通过，返回 `true` 或错误文案表示不通过。
   */
  validator?: FormValidator<string>;
  /** 自动校验时机，默认 `["input", "blur"]`；传 `[]` 关闭自动校验。 */
  validateOn?: FormValidateTrigger | FormValidateTrigger[];
}

const props = withDefaults(defineProps<OptInputsProps>(), {
  length: 6,
  accept: "numeric",
  letterCase: "none",
  mask: false,
  allowPaste: true,
  disabled: false,
  label: undefined,
  validator: undefined,
  validateOn: undefined,
});

const model = defineModel<string>({ default: "" });
const emit = defineEmits<{ complete: [value: string] }>();

const uid = useId();
const labelId = `ds-opt-inputs-label-${uid}`;
const messageId = `ds-opt-inputs-message-${uid}`;

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

defineExpose({ validate, clearValidate });

/** 过滤非法字符并截断后的值；外部写入也会先经过这里。 */
const normalized = computed(() =>
  normalizeOptValue(model.value, props.accept, props.length, props.letterCase),
);

/**
 * 记录上一次是否已填满，保证 `complete` 只在“刚好填满”的那次触发；
 * 删除后再补满会再次触发。
 */
const completed = ref(false);

watch(
  normalized,
  (value) => {
    if (model.value !== value) model.value = value;
    completed.value = value.length === props.length && props.length > 0;
  },
  { immediate: true },
);

const chars = computed(() => Array.from(normalized.value));
const filled = computed(() => chars.value.length);

const inputs = ref<(HTMLInputElement | null)[]>([]);

function setInputRef(index: number, el: Element | ComponentPublicInstance | null): void {
  inputs.value[index] = (el as HTMLInputElement | null) ?? null;
}

function cellValue(index: number): string {
  return chars.value[index] ?? "";
}

function cellLabel(index: number): string {
  const position = `character ${index + 1} of ${props.length}`;
  return props.label ? `${props.label}, ${position}` : position;
}

function focusCell(index: number): void {
  const bounded = Math.max(0, Math.min(index, props.length - 1));
  const el = inputs.value[bounded];
  if (!el) return;
  el.focus();
  el.select();
}

function commit(value: string): void {
  const next = value.slice(0, props.length);
  const wasComplete = completed.value;

  model.value = next;
  completed.value = next.length === props.length && props.length > 0;
  triggerValidation("input", next);

  if (!wasComplete && completed.value) emit("complete", next);
}

/** 从 `start` 开始写入字符；起点越界时视为追加到第一个空位。 */
function write(start: number, accepted: string[]): void {
  commit(applyOptChars(normalized.value, start, accepted, props.length));
}

function onInput(index: number, event: Event): void {
  const input = event.target as HTMLInputElement;
  const accepted = sanitizeOptChars(input.value, props.accept, props.letterCase);

  if (!accepted.length) {
    input.value = cellValue(index);
    return;
  }

  const start = Math.min(index, filled.value);
  write(start, accepted);

  const nextIndex = Math.min(start + accepted.length, props.length - 1);
  void nextTick(() => focusCell(nextIndex));
}

function onKeydown(index: number, event: KeyboardEvent): void {
  if (props.disabled) return;

  switch (event.key) {
    case "Backspace": {
      event.preventDefault();

      if (index < filled.value) {
        commit(removeOptChar(normalized.value, index));
        void nextTick(() => focusCell(index));
      } else if (index > 0) {
        commit(removeOptChar(normalized.value, index - 1));
        void nextTick(() => focusCell(index - 1));
      }
      break;
    }
    case "Delete": {
      if (index >= filled.value) return;
      event.preventDefault();
      commit(removeOptChar(normalized.value, index));
      void nextTick(() => focusCell(index));
      break;
    }
    case "ArrowLeft":
      event.preventDefault();
      focusCell(index - 1);
      break;
    case "ArrowRight":
      event.preventDefault();
      focusCell(index + 1);
      break;
    case "Home":
      event.preventDefault();
      focusCell(0);
      break;
    case "End":
      event.preventDefault();
      focusCell(props.length - 1);
      break;
  }
}

/** 空位之后的格子会把焦点送回第一个空位，保证值始终是从左到右的连续串。 */
function onFocus(index: number): void {
  if (index > filled.value) {
    void nextTick(() => focusCell(filled.value));
    return;
  }
  inputs.value[index]?.select();
}

function onPaste(event: ClipboardEvent): void {
  if (!props.allowPaste || props.disabled) {
    event.preventDefault();
    return;
  }

  const accepted = sanitizeOptChars(
    event.clipboardData?.getData("text") ?? "",
    props.accept,
    props.letterCase,
  );
  event.preventDefault();
  if (!accepted.length) return;

  const target = event.target as HTMLElement | null;
  const index = Number(target?.dataset.index ?? 0);
  const start = Number.isFinite(index) ? index : 0;

  write(Math.min(start, filled.value), accepted);
  void nextTick(() => focusCell(Math.min(start + accepted.length, props.length - 1)));
}
</script>

<template>
  <div
    v-bind="$attrs"
    class="ds-opt-inputs inline-flex flex-col gap-1 font-ds"
    role="group"
    :aria-labelledby="label ? labelId : formItem?.labelId.value"
    :aria-invalid="isInvalid || undefined"
    :aria-required="formItem?.required.value || undefined"
    :aria-describedby="validationMessage ? messageId : undefined"
  >
    <span v-if="label" :id="labelId" class="text-xs leading-4 text-ds-muted">{{ label }}</span>

    <div class="inline-flex items-center gap-2" @paste="onPaste">
      <input
        v-for="index in length"
        :key="index"
        :ref="(el) => setInputRef(index - 1, el)"
        :value="cellValue(index - 1)"
        :type="mask ? 'password' : 'text'"
        :inputmode="accept === 'numeric' ? 'numeric' : undefined"
        :maxlength="1"
        :disabled="disabled"
        :aria-label="cellLabel(index - 1)"
        :autocomplete="mask ? 'new-password' : 'off'"
        spellcheck="false"
        :data-index="index - 1"
        class="ds-opt-inputs__cell box-border h-12 w-12 min-w-0 rounded-ds-sm border bg-transparent p-0 text-center font-ds text-xl leading-none text-ds-fg caret-ds-primary-strong outline-none transition-colors focus:border-ds-primary-strong focus:outline-2 focus:outline-offset-1 focus:outline-ds-focus disabled:cursor-not-allowed disabled:opacity-38"
        :class="
          isInvalid
            ? 'border-ds-error hover:border-ds-error'
            : 'border-ds-outline hover:border-ds-fg'
        "
        @input="onInput(index - 1, $event)"
        @keydown="onKeydown(index - 1, $event)"
        @focus="onFocus(index - 1)"
        @blur="triggerValidation('blur')"
      />
    </div>

    <p v-if="validationMessage" :id="messageId" class="text-xs leading-4 text-ds-error">
      {{ validationMessage }}
    </p>
  </div>
</template>
