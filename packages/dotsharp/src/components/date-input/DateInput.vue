<script setup lang="ts">
import { computed, nextTick, ref, useId, watch } from "vue";
import calendarIcon from "@iconify-icons/material-symbols/calendar-today";
import Icon from "../icon/Icon.vue";
import Input from "../input/Input.vue";
import DatePicker from "../date-picker/DatePicker.vue";
import { datePlaceholder, formatDateInput, parseDateInput } from "../date-picker/date";
import type { DatePickerMode } from "../date-picker/types";
import { useAnchoredPopup } from "../../composables/useAnchoredPopup";
import { useFieldValidation } from "../../composables/useFieldValidation";
import type { FormValidateTrigger, FormValidator } from "../form/context";
import { useI18n } from "../../i18n";

interface DateInputProps {
  /** 浮动标签；默认取当前语言的「日期」。 */
  label?: string;
  /** 容器样式，与 `Input` 一致。 */
  variant?: "outlined" | "filled";
  disabled?: boolean;
  readonly?: boolean;
  /** 字段下方的辅助文字；默认显示数字顺序（如 `MM/DD/YYYY`）。 */
  description?: string;
  /** 是否显示日历按钮；`false` 时只是一个可输入的日期字段。 */
  picker?: boolean;
  /** 日历以模态对话框打开，而不是贴着输入框的弹出层。 */
  modal?: boolean;
  /** 模态选择器的初始正文模式。 */
  pickerMode?: DatePickerMode;
  /** 模态选择器的标题。 */
  title?: string;
  /**
   * 验证函数：接收当前值（`Date | null`），返回 `false` 表示通过，
   * 返回 `true` 或错误文案表示不通过。
   */
  validator?: FormValidator<Date | null>;
  /** 自动校验时机，默认 `["input", "blur"]`；传 `[]` 关闭自动校验。 */
  validateOn?: FormValidateTrigger | FormValidateTrigger[];
}

const props = withDefaults(defineProps<DateInputProps>(), {
  label: undefined,
  variant: "outlined",
  disabled: false,
  readonly: false,
  description: undefined,
  picker: true,
  modal: false,
  pickerMode: "calendar",
  title: undefined,
  validator: undefined,
  validateOn: undefined,
});

const value = defineModel<Date | null>({ default: null });

const i18n = useI18n();
const order = i18n.order;
const uid = useId();

const text = ref(value.value ? formatDateInput(value.value, order.value) : "");
const invalid = ref(false);

const {
  invalid: isInvalid,
  message: validationMessage,
  trigger: triggerValidation,
  validate: validateField,
  clearValidate: clearField,
} = useFieldValidation({
  value: () => value.value,
  validator: () => props.validator,
  triggers: () => props.validateOn,
});

const inputRef = ref<{ validate: () => boolean; clearValidate: () => void } | null>(null);

/**
 * 内部 `Input` 只负责显示：解析失败与字段校验结果都映射成它的一次校验。
 * 它不自动触发，显示由下面的 watch 跟随字段状态同步。
 */
const inputValidator = (): boolean | string => {
  if (invalid.value) return i18n.t("invalidDate");
  if (!isInvalid.value) return false;
  return validationMessage.value ?? true;
};

watch([isInvalid, validationMessage, invalid], () => {
  void nextTick(() => inputRef.value?.validate());
});

function validate(): boolean {
  const valid = validateField();
  inputRef.value?.validate();
  return valid;
}

function clearValidate(): void {
  clearField();
  inputRef.value?.clearValidate();
}

defineExpose({ validate, clearValidate });

const rootRef = ref<HTMLElement | null>(null);
const popupRef = ref<HTMLElement | null>(null);
const popupId = `ds-date-input-popup-${uid}`;
const popupOpen = ref(false);
const pickerOpen = ref(false);

const resolvedLabel = computed(() => props.label ?? i18n.t("date"));
const placeholder = computed(() => datePlaceholder(order.value));
const hint = computed(() => props.description ?? datePlaceholder(order.value, true));
const canPick = computed(() => props.picker && !props.disabled && !props.readonly);

watch(value, (next) => {
  invalid.value = false;
  text.value = next ? formatDateInput(next, order.value) : "";
});

watch(order, () => {
  invalid.value = false;
  text.value = value.value ? formatDateInput(value.value, order.value) : "";
});

/** 失焦/回车时把输入的数字日期写回模型；非法输入保持文本并显示错误。 */
function commitText(): Date | null {
  if (props.disabled || props.readonly) return value.value;

  const raw = text.value.trim();
  if (!raw) {
    invalid.value = false;
    if (value.value) value.value = null;
    return null;
  }

  const parsed = parseDateInput(raw, order.value);
  if (!parsed) {
    invalid.value = true;
    return value.value;
  }

  invalid.value = false;
  value.value = parsed;
  text.value = formatDateInput(parsed, order.value);
  return parsed;
}

function onBlur(): void {
  const next = commitText();
  triggerValidation("blur", next);
}

function onPickerChange(next: Date | null): void {
  triggerValidation("input", next);
}

const { panelStyle, show, hide } = useAnchoredPopup({
  anchor: rootRef,
  panel: popupRef,
  open: popupOpen,
  // 弹出层 Teleport 到 body 末尾，不在输入框的 Tab 顺序里，打开时把焦点送进日历。
  initialFocus: '[role="gridcell"][tabindex="0"]',
});

function togglePicker(): void {
  if (!canPick.value) return;
  commitText();
  if (props.modal) pickerOpen.value = true;
  else if (popupOpen.value) hide();
  else void show();
}
</script>

<template>
  <div ref="rootRef" class="ds-date-input relative font-ds">
    <Input
      ref="inputRef"
      v-model="text"
      :label="resolvedLabel"
      float-label
      :variant="variant"
      :disabled="disabled"
      :readonly="readonly"
      :description="hint"
      :placeholder="placeholder"
      :validator="inputValidator"
      :validate-on="[]"
      @blur="onBlur"
      @keydown.enter.prevent="commitText"
    >
      <template v-if="canPick" #trailing>
        <button
          type="button"
          class="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent text-ds-muted transition-colors hover:bg-ds-fg/10 hover:text-ds-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ds-focus"
          :aria-label="i18n.t('calendar')"
          :aria-haspopup="modal ? 'dialog' : undefined"
          :aria-expanded="modal ? undefined : popupOpen"
          :aria-controls="modal ? undefined : popupId"
          @click="togglePicker"
        >
          <Icon :icon="calendarIcon" size="20" />
        </button>
      </template>
    </Input>

    <DatePicker
      v-if="picker && modal"
      v-model="value"
      v-model:open="pickerOpen"
      modal
      :mode="pickerMode"
      :title="title ?? i18n.t('selectDate')"
      @update:model-value="onPickerChange"
    />

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
          v-if="picker && !modal && popupOpen"
          :id="popupId"
          ref="popupRef"
          :style="panelStyle"
          class="ds-date-input__popup fixed z-50"
        >
          <DatePicker
            v-model="value"
            :header="false"
            @confirm="hide(true)"
            @cancel="hide(true)"
            @update:model-value="onPickerChange"
          />
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
