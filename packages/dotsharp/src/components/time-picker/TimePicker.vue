<script setup lang="ts">
import { computed, ref, watch } from "vue";
import Button from "../button/Button.vue";
import Card from "../card/Card.vue";
import ClockDial from "./ClockDial.vue";
import { useBodyScrollLock } from "../../composables/useBodyScrollLock";
import { useOverlayPanel } from "../../composables/useOverlayPanel";
import { useI18n } from "../../i18n";
import type { TimeFormat, TimeValue } from "./types";
import {
  hourText,
  isPm,
  normalizeTime,
  pad2,
  setHour12,
  stepHour,
  stepMinute,
  withPeriod,
} from "./time";

defineOptions({ inheritAttrs: false });

type FieldName = "hour" | "minute" | "second";

interface TimePickerProps {
  /** 头部的小标题，默认取当前语言的「选择时间」。 */
  title?: string;
  /** 是否显示头部（小标题）；嵌入弹出层时通常关掉。 */
  header?: boolean;
  /** 是否显示 Cancel / OK；关闭时选完分钟立即提交。 */
  actions?: boolean;
  /** 是否以模态层呈现（配合 `v-model:open`）；为 `false` 时是界面里的卡片。 */
  modal?: boolean;
  /** 12 或 24 小时制；省略时取当前语言的默认值。 */
  format?: TimeFormat;
  /** 竖排（移动端）或横排（宽屏）。 */
  layout?: "vertical" | "horizontal";
  /** 是否显示秒输入；表盘仍只管小时与分钟。 */
  seconds?: boolean;
}

const props = withDefaults(defineProps<TimePickerProps>(), {
  title: undefined,
  header: true,
  actions: true,
  modal: false,
  format: undefined,
  layout: "vertical",
  seconds: false,
});

const value = defineModel<TimeValue | null>({ default: null });
const open = defineModel<boolean>("open", { default: false });

const emit = defineEmits<{ confirm: [value: TimeValue | null]; cancel: [] }>();

const i18n = useI18n();
const format = computed(() => props.format ?? i18n.timeFormat.value);

/** 未提交的草稿；只有 OK 才写回 `v-model`。空模型从 00:00 开始，避免 SSR 与浏览器时间不同。 */
function draftOf(next: TimeValue | null): TimeValue {
  const base = normalizeTime(next) ?? { hour: 0, minute: 0 };
  return props.seconds ? { ...base, second: base.second ?? 0 } : base;
}

const draft = ref<TimeValue>(draftOf(value.value));
/** 当前编辑的字段；表盘跟着它在小时/分钟之间切换。 */
const activeField = ref<FieldName>("hour");
const dialMode = computed<"hours" | "minutes">(() =>
  activeField.value === "hour" ? "hours" : "minutes",
);

/** 三个输入框各自的文本，边打字边保留用户输入，失焦时再补零。 */
const hourField = ref("");
const minuteField = ref("");
const secondField = ref("");

const hourRef = ref<HTMLInputElement | null>(null);
const minuteRef = ref<HTMLInputElement | null>(null);
const secondRef = ref<HTMLInputElement | null>(null);

const panelRef = ref<HTMLElement | null>(null);
const modalOpen = computed(() => props.modal && open.value);

const pm = computed(() => isPm(draft.value.hour));
const hourWidth = computed(() => (props.seconds ? "w-16" : "w-20"));
const periodWidth = computed(() => (props.seconds ? "w-12" : "w-14"));

function syncFields(): void {
  hourField.value = hourText(draft.value, format.value);
  minuteField.value = pad2(draft.value.minute);
  secondField.value = pad2(draft.value.second ?? 0);
}

syncFields();

watch(value, (next) => {
  draft.value = draftOf(next);
  syncFields();
});

watch(format, syncFields);
watch(
  () => props.seconds,
  () => {
    draft.value = draftOf(draft.value);
    syncFields();
  },
);

watch(modalOpen, (isOpen) => {
  if (!isOpen) return;
  draft.value = draftOf(value.value);
  activeField.value = "hour";
  syncFields();
});

function setHour(hour: number): void {
  draft.value = { ...draft.value, hour };
}

function setMinute(minute: number): void {
  draft.value = { ...draft.value, minute };
}

function setSecond(second: number): void {
  draft.value = { ...draft.value, second };
}

/** 表盘改值后要把输入框的文本一起刷新（打字时不能刷新，会吞掉刚敲的数字）。 */
function onDialHour(hour: number): void {
  setHour(hour);
  syncFields();
}

function onDialMinute(minute: number): void {
  setMinute(minute);
  syncFields();
}

function setPeriod(next: boolean): void {
  setHour(withPeriod(draft.value.hour, next));
  syncFields();
}

/** 点选小时自动切到分钟，和 Material 的拨盘一致。 */
function onSelect(): void {
  if (activeField.value === "hour") {
    activeField.value = "minute";
  } else if (!props.actions) {
    commit();
  }
}

function fieldText(field: FieldName) {
  if (field === "hour") return hourField;
  if (field === "minute") return minuteField;
  return secondField;
}

function selectField(event: FocusEvent): void {
  (event.target as HTMLInputElement | null)?.select();
}

function focusNext(field: FieldName): void {
  if (field === "hour") {
    activeField.value = "minute";
    minuteRef.value?.focus();
    minuteRef.value?.select();
    return;
  }
  if (field === "minute" && props.seconds) {
    secondRef.value?.focus();
    secondRef.value?.select();
  }
}

function onFieldFocus(field: FieldName): void {
  activeField.value = field;
}

/** 输入框直接编辑：过滤非数字，两位后跳到下一个字段。 */
function onFieldInput(field: FieldName, event: Event): void {
  const input = event.target as HTMLInputElement;
  const digits = input.value.replace(/\D/g, "").slice(0, 2);
  if (input.value !== digits) input.value = digits;
  fieldText(field).value = digits;
  if (!digits) return;

  const number = Number(digits);
  if (field === "hour") {
    if (format.value === "12h") {
      if (number < 1 || number > 12) return;
      setHour(setHour12(number, pm.value));
    } else {
      if (number > 23) return;
      setHour(number);
    }
  } else {
    if (number > 59) return;
    if (field === "minute") setMinute(number);
    else setSecond(number);
  }

  if (digits.length === 2) focusNext(field);
}

function onFieldKeydown(field: FieldName, event: KeyboardEvent): void {
  if (event.key === "Enter") {
    event.preventDefault();
    commit();
    return;
  }

  const delta = event.key === "ArrowUp" ? 1 : event.key === "ArrowDown" ? -1 : 0;
  if (!delta) return;

  event.preventDefault();
  if (field === "hour") setHour(stepHour(draft.value.hour, delta));
  else if (field === "minute") setMinute(stepMinute(draft.value.minute, delta));
  else setSecond(stepMinute(draft.value.second ?? 0, delta));
  syncFields();
}

/** 失焦时把不完整或越界的文本恢复成草稿里的值。 */
function onFieldBlur(): void {
  syncFields();
}

function commit(): void {
  value.value = { ...draft.value };
  syncFields();
  emit("confirm", value.value);
  if (props.modal) open.value = false;
}

function cancel(): void {
  draft.value = draftOf(value.value);
  syncFields();
  emit("cancel");
  if (props.modal) open.value = false;
}

function onBackdrop(): void {
  if (props.modal) cancel();
}

useBodyScrollLock(modalOpen);
useOverlayPanel({
  active: modalOpen,
  panel: panelRef,
  onDismiss: cancel,
  initialFocus: "input[data-ds-time-field]",
});
</script>

<template>
  <Teleport to="body" :disabled="!modal">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="!modal || open"
        ref="panelRef"
        tabindex="-1"
        :class="
          modal
            ? 'fixed inset-0 z-50 flex items-center justify-center bg-ds-scrim p-6 outline-none'
            : 'inline-block max-w-full align-top'
        "
        @click.self="onBackdrop"
      >
        <Card
          :role="modal ? 'dialog' : undefined"
          :aria-modal="modal ? 'true' : undefined"
          :aria-label="modal ? (title ?? i18n.t('selectTime')) : undefined"
          variant="filled"
          :level="modal ? 1 : undefined"
          :padded="false"
          :class="[
            'ds-time-picker max-w-full text-left',
            layout === 'horizontal' ? 'w-[38rem]' : 'w-[22rem]',
            modal ? 'shadow-ds-3' : '',
          ]"
          v-bind="$attrs"
        >
          <div
            :class="
              layout === 'horizontal'
                ? 'flex items-stretch gap-6 px-6 pt-6 pb-2'
                : header
                  ? 'px-6 pt-6'
                  : 'px-6 pt-5'
            "
          >
            <div :class="layout === 'horizontal' ? 'flex w-[16rem] shrink-0 flex-col' : 'min-w-0'">
              <p v-if="header" class="text-sm leading-5 text-ds-muted">
                {{ title ?? i18n.t("selectTime") }}
              </p>

              <div class="flex items-center gap-1" :class="header ? 'mt-3' : 'mt-0'">
                <input
                  ref="hourRef"
                  data-ds-time-field
                  :value="hourField"
                  type="text"
                  inputmode="numeric"
                  autocomplete="off"
                  spellcheck="false"
                  maxlength="2"
                  class="h-16 shrink-0 rounded-ds-sm border-0 bg-ds-fg/5 px-0 text-center text-4xl leading-none tabular-nums text-ds-fg outline-none transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ds-focus"
                  :class="[
                    hourWidth,
                    activeField === 'hour' ? 'bg-ds-tonal text-ds-on-tonal' : 'hover:bg-ds-fg/10',
                  ]"
                  :aria-label="i18n.t('hour')"
                  @focus="
                    onFieldFocus('hour');
                    selectField($event);
                  "
                  @blur="onFieldBlur"
                  @input="onFieldInput('hour', $event)"
                  @keydown="onFieldKeydown('hour', $event)"
                />

                <span
                  class="flex h-16 items-center px-0.5 text-3xl leading-none text-ds-fg"
                  aria-hidden="true"
                >
                  :
                </span>

                <input
                  ref="minuteRef"
                  data-ds-time-field
                  :value="minuteField"
                  type="text"
                  inputmode="numeric"
                  autocomplete="off"
                  spellcheck="false"
                  maxlength="2"
                  class="h-16 shrink-0 rounded-ds-sm border-0 bg-ds-fg/5 px-0 text-center text-4xl leading-none tabular-nums text-ds-fg outline-none transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ds-focus"
                  :class="[
                    hourWidth,
                    activeField === 'minute' ? 'bg-ds-tonal text-ds-on-tonal' : 'hover:bg-ds-fg/10',
                  ]"
                  :aria-label="i18n.t('minute')"
                  @focus="
                    onFieldFocus('minute');
                    selectField($event);
                  "
                  @blur="onFieldBlur"
                  @input="onFieldInput('minute', $event)"
                  @keydown="onFieldKeydown('minute', $event)"
                />

                <template v-if="seconds">
                  <span
                    class="flex h-16 items-center px-0.5 text-3xl leading-none text-ds-fg"
                    aria-hidden="true"
                  >
                    :
                  </span>

                  <input
                    ref="secondRef"
                    data-ds-time-field
                    :value="secondField"
                    type="text"
                    inputmode="numeric"
                    autocomplete="off"
                    spellcheck="false"
                    maxlength="2"
                    class="h-16 shrink-0 rounded-ds-sm border-0 bg-ds-fg/5 px-0 text-center text-4xl leading-none tabular-nums text-ds-fg outline-none transition-colors hover:bg-ds-fg/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ds-focus"
                    :class="[
                      hourWidth,
                      activeField === 'second'
                        ? 'bg-ds-tonal text-ds-on-tonal'
                        : 'hover:bg-ds-fg/10',
                    ]"
                    :aria-label="i18n.t('second')"
                    @focus="
                      onFieldFocus('second');
                      selectField($event);
                    "
                    @blur="onFieldBlur"
                    @input="onFieldInput('second', $event)"
                    @keydown="onFieldKeydown('second', $event)"
                  />
                </template>

                <div
                  v-if="format === '12h' && layout === 'vertical'"
                  class="ml-auto flex h-16 shrink-0 flex-col overflow-hidden rounded-ds-sm border border-ds-outline"
                  :class="periodWidth"
                >
                  <button
                    type="button"
                    class="flex-1 cursor-pointer border-0 text-xs leading-4 transition-colors"
                    :class="
                      !pm
                        ? 'bg-ds-tonal text-ds-on-tonal'
                        : 'bg-transparent text-ds-fg hover:bg-ds-fg/10'
                    "
                    :aria-pressed="!pm"
                    @click="setPeriod(false)"
                  >
                    {{ i18n.t("am") }}
                  </button>
                  <button
                    type="button"
                    class="flex-1 cursor-pointer border-0 border-t border-ds-outline text-xs leading-4 transition-colors"
                    :class="
                      pm
                        ? 'bg-ds-tonal text-ds-on-tonal'
                        : 'bg-transparent text-ds-fg hover:bg-ds-fg/10'
                    "
                    :aria-pressed="pm"
                    @click="setPeriod(true)"
                  >
                    {{ i18n.t("pm") }}
                  </button>
                </div>
              </div>

              <div v-if="format === '12h' && layout === 'horizontal'" class="mt-auto pt-3">
                <div
                  class="flex h-10 w-full overflow-hidden rounded-ds-sm border border-ds-outline"
                >
                  <button
                    type="button"
                    class="flex-1 cursor-pointer border-0 text-sm transition-colors"
                    :class="
                      !pm
                        ? 'bg-ds-tonal text-ds-on-tonal'
                        : 'bg-transparent text-ds-fg hover:bg-ds-fg/10'
                    "
                    :aria-pressed="!pm"
                    @click="setPeriod(false)"
                  >
                    {{ i18n.t("am") }}
                  </button>
                  <button
                    type="button"
                    class="flex-1 cursor-pointer border-0 border-l border-ds-outline text-sm transition-colors"
                    :class="
                      pm
                        ? 'bg-ds-tonal text-ds-on-tonal'
                        : 'bg-transparent text-ds-fg hover:bg-ds-fg/10'
                    "
                    :aria-pressed="pm"
                    @click="setPeriod(true)"
                  >
                    {{ i18n.t("pm") }}
                  </button>
                </div>
              </div>

              <div
                v-if="header && layout === 'vertical'"
                class="-mx-6 mt-4 border-t border-ds-line"
              />
            </div>

            <div :class="layout === 'horizontal' ? 'min-w-0 flex-1' : 'mt-4'">
              <ClockDial
                :mode="dialMode"
                :format="format"
                :hour="draft.hour"
                :minute="draft.minute"
                @update:hour="onDialHour"
                @update:minute="onDialMinute"
                @select="onSelect"
              />
            </div>
          </div>

          <div v-if="actions" class="flex items-center justify-end gap-1 px-6 pt-2 pb-4">
            <Button variant="text" @click="cancel">{{ i18n.t("cancel") }}</Button>
            <Button variant="text" @click="commit">{{ i18n.t("ok") }}</Button>
          </div>
        </Card>
      </div>
    </Transition>
  </Teleport>
</template>
