<script setup lang="ts">
import { computed, nextTick, ref, useId, watch } from "vue";
import scheduleIcon from "@iconify-icons/material-symbols/schedule";
import Icon from "../icon/Icon.vue";
import Input from "../input/Input.vue";
import TimePicker from "../time-picker/TimePicker.vue";
import {
  formatTimeInput,
  normalizeTime,
  parseTimeInput,
  timePlaceholder,
} from "../time-picker/time";
import type { TimeFormat, TimeValue } from "../time-picker/types";
import { useAnchoredPopup } from "../../composables/useAnchoredPopup";
import { useFieldValidation } from "../../composables/useFieldValidation";
import type { FormValidateTrigger, FormValidator } from "../form/context";
import { useI18n } from "../../i18n";

interface TimeInputProps {
  /** 浮动标签；默认取当前语言的「时间」。 */
  label?: string;
  /** 容器样式，与 `Input` 一致。 */
  variant?: "outlined" | "filled";
  disabled?: boolean;
  readonly?: boolean;
  /** 字段下方的辅助文字；默认显示时钟格式（如 `hh:mm AM`）。 */
  description?: string;
  /** 是否显示时钟按钮；`false` 时只是一个可输入的时间字段。 */
  picker?: boolean;
  /** 选择器以模态对话框打开，而不是贴着输入框的弹出层。 */
  modal?: boolean;
  /** 模态选择器的标题。 */
  title?: string;
  /** 12 或 24 小时制；省略时取当前语言的默认值。 */
  format?: TimeFormat;
  /** 选择器竖排还是横排。 */
  layout?: "vertical" | "horizontal";
  /** 是否显示秒。 */
  seconds?: boolean;
  /**
   * 验证函数：接收当前值（`TimeValue | null`），返回 `false` 表示通过，
   * 返回 `true` 或错误文案表示不通过。
   */
  validator?: FormValidator<TimeValue | null>;
  /** 自动校验时机，默认 `["input", "blur"]`；传 `[]` 关闭自动校验。 */
  validateOn?: FormValidateTrigger | FormValidateTrigger[];
}

const props = withDefaults(defineProps<TimeInputProps>(), {
  label: undefined,
  variant: "outlined",
  disabled: false,
  readonly: false,
  description: undefined,
  picker: true,
  modal: false,
  title: undefined,
  format: undefined,
  layout: "vertical",
  seconds: false,
  validator: undefined,
  validateOn: undefined,
});

const value = defineModel<TimeValue | null>({ default: null });

const i18n = useI18n();
const uid = useId();
const format = computed(() => props.format ?? i18n.timeFormat.value);

function textOf(next: TimeValue | null): string {
  if (!next) return "";
  return formatTimeInput(next, format.value, { am: i18n.t("am"), pm: i18n.t("pm") }, props.seconds);
}

const text = ref(textOf(normalizeTime(value.value)));
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
  if (invalid.value) return i18n.t("invalidTime");
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
const popupId = `ds-time-input-popup-${uid}`;
const popupOpen = ref(false);
const pickerOpen = ref(false);

const resolvedLabel = computed(() => props.label ?? i18n.t("time"));
const placeholder = computed(() => timePlaceholder(format.value, false, props.seconds));
const hint = computed(
  () => props.description ?? timePlaceholder(format.value, true, props.seconds),
);
const canPick = computed(() => props.picker && !props.disabled && !props.readonly);

watch(value, (next) => {
  invalid.value = false;
  text.value = textOf(normalizeTime(next));
});

watch([format, () => props.seconds], () => {
  invalid.value = false;
  text.value = textOf(normalizeTime(value.value));
});

/** 失焦/回车时把输入的时钟写回模型；非法输入保持文本并显示错误。 */
function commitText(): TimeValue | null {
  if (props.disabled || props.readonly) return value.value;

  const raw = text.value.trim();
  if (!raw) {
    invalid.value = false;
    if (value.value) value.value = null;
    return null;
  }

  const parsed = parseTimeInput(raw, format.value, props.seconds);
  if (!parsed) {
    invalid.value = true;
    return value.value;
  }

  invalid.value = false;
  value.value = props.seconds ? { ...parsed, second: parsed.second ?? 0 } : parsed;
  text.value = textOf(value.value);
  return value.value;
}

function onBlur(): void {
  const next = commitText();
  triggerValidation("blur", next);
}

function onPickerChange(next: TimeValue | null): void {
  triggerValidation("input", next);
}

const { panelStyle, show, hide } = useAnchoredPopup({
  anchor: rootRef,
  panel: popupRef,
  open: popupOpen,
  initialFocus: '[role="spinbutton"]',
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
  <div ref="rootRef" class="ds-time-input relative font-ds">
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
          :aria-label="i18n.t('clock')"
          :aria-haspopup="modal ? 'dialog' : undefined"
          :aria-expanded="modal ? undefined : popupOpen"
          :aria-controls="modal ? undefined : popupId"
          @click="togglePicker"
        >
          <Icon :icon="scheduleIcon" size="20" />
        </button>
      </template>
    </Input>

    <TimePicker
      v-if="picker && modal"
      v-model="value"
      v-model:open="pickerOpen"
      modal
      :format="format"
      :layout="layout"
      :seconds="seconds"
      :title="title ?? i18n.t('selectTime')"
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
          class="ds-time-input__popup fixed z-50"
        >
          <TimePicker
            v-model="value"
            :header="false"
            :format="format"
            :layout="layout"
            :seconds="seconds"
            @confirm="hide(true)"
            @cancel="hide(true)"
            @update:model-value="onPickerChange"
          />
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
