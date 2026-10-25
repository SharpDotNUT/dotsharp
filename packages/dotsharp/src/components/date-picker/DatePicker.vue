<script setup lang="ts">
import { computed, nextTick, ref, watch, type Ref } from "vue";
import calendarIcon from "@iconify-icons/material-symbols/calendar-today";
import editIcon from "@iconify-icons/material-symbols/edit";
import checkIcon from "@iconify-icons/material-symbols/check";
import chevronLeftIcon from "@iconify-icons/material-symbols/chevron-left";
import chevronRightIcon from "@iconify-icons/material-symbols/chevron-right";
import arrowDropDownIcon from "@iconify-icons/material-symbols/arrow-drop-down";
import arrowDropUpIcon from "@iconify-icons/material-symbols/arrow-drop-up";
import Button from "../button/Button.vue";
import Card from "../card/Card.vue";
import Icon from "../icon/Icon.vue";
import IconButton from "../icon-button/IconButton.vue";
import Input from "../input/Input.vue";
import { useBodyScrollLock } from "../../composables/useBodyScrollLock";
import { useOverlayPanel } from "../../composables/useOverlayPanel";
import { useI18n } from "../../i18n";
import type { DatePickerMode } from "./types";
import {
  addDays,
  addMonths,
  addYears,
  datePlaceholder,
  formatDateFull,
  formatDateInput,
  formatDateLong,
  formatMonthYear,
  monthNames,
  parseDateInput,
  sameDay,
  sameMonth,
  startOfDay,
  startOfMonth,
  toISODate,
  today,
  weekdayNames,
} from "./date";

defineOptions({ inheritAttrs: false });

type CalendarView = "days" | "months" | "years";

interface DatePickerProps {
  /** 头部的小标题，默认取当前语言的「选择日期」。 */
  title?: string;
  /** 是否显示头部（小标题 + 大号日期 + 模式切换按钮）；嵌入弹出层时通常关掉。 */
  header?: boolean;
  /** 是否显示 Cancel / OK；关闭时点击日期立即提交。 */
  actions?: boolean;
  /** 初始正文模式；头部右侧的按钮会在日历与输入之间切换。 */
  mode?: DatePickerMode;
  /** 是否以模态层呈现（配合 `v-model:open`）；为 `false` 时是界面里的卡片。 */
  modal?: boolean;
}

const props = withDefaults(defineProps<DatePickerProps>(), {
  title: undefined,
  header: true,
  actions: true,
  mode: "calendar",
  modal: false,
});

const value = defineModel<Date | null>({ default: null });
const open = defineModel<boolean>("open", { default: false });

const emit = defineEmits<{ confirm: [value: Date | null]; cancel: [] }>();

const i18n = useI18n();
const order = i18n.order;
const intlLocale = i18n.intlLocale;

/** 未提交的草稿；只有 OK 才写回 `v-model`。 */
const draft = ref<Date | null>(value.value ? startOfDay(value.value) : null);
const body = ref<DatePickerMode>(props.mode);
const text = ref(draft.value ? formatDateInput(draft.value, order.value) : "");
const invalid = ref(false);

const viewDate = ref<Date>(startOfMonth(draft.value ?? today()));
const view = ref<CalendarView>("days");
const focusedDate = ref<Date | null>(draft.value);

const todayDate = today();
const firstDayIndex = computed(() => i18n.firstDayOfWeek.value % 7);

const panelRef = ref<HTMLElement | null>(null);
const gridRef = ref<HTMLElement | null>(null);

const modalOpen = computed(() => props.modal && open.value);

const headerText = computed(() => {
  if (body.value === "input") return i18n.t("enterDate");
  if (!draft.value) return i18n.t("selectDate");
  return formatDateLong(draft.value, intlLocale.value);
});

const monthYear = computed(() => formatMonthYear(viewDate.value, intlLocale.value));

const monthOptions = computed(() => {
  const names = monthNames(intlLocale.value);
  return names.map((name, index) => ({ name, index }));
});

const weekdayLabels = computed(() => {
  const names = weekdayNames(intlLocale.value, "narrow");
  return Array.from({ length: 7 }, (_, index) => names[(firstDayIndex.value + index) % 7]!);
});

const weekdayTitles = computed(() => {
  const names = weekdayNames(intlLocale.value, "long");
  return Array.from({ length: 7 }, (_, index) => names[(firstDayIndex.value + index) % 7]!);
});

interface DayCell {
  date: Date;
  iso: string;
  day: number;
  inMonth: boolean;
  selected: boolean;
  isToday: boolean;
  label: string;
}

/** 固定 6 行，卡片高度不随月份跳动。 */
const weeks = computed<DayCell[][]>(() => {
  const first = startOfMonth(viewDate.value);
  const offset = (first.getDay() - firstDayIndex.value + 7) % 7;
  const start = addDays(first, -offset);
  const cells: DayCell[] = Array.from({ length: 42 }, (_, index) => {
    const date = addDays(start, index);
    return {
      date,
      iso: toISODate(date),
      day: date.getDate(),
      inMonth: date.getMonth() === first.getMonth(),
      selected: sameDay(date, draft.value),
      isToday: sameDay(date, todayDate),
      label: formatDateFull(date, intlLocale.value),
    };
  });
  return Array.from({ length: 6 }, (_, week) => cells.slice(week * 7, week * 7 + 7));
});

/** 当前视图里唯一可 Tab 进入的日期：优先焦点日期，其次已选日期，最后当月 1 号。 */
const tabbableIso = computed(() => {
  const focused = focusedDate.value;
  if (focused && sameMonth(focused, viewDate.value)) return toISODate(focused);
  const chosen = draft.value;
  if (chosen && sameMonth(chosen, viewDate.value)) return toISODate(chosen);
  return toISODate(startOfMonth(viewDate.value));
});

const yearPageStart = computed(() => Math.floor(viewDate.value.getFullYear() / 12) * 12);
const yearOptions = computed(() =>
  Array.from({ length: 12 }, (_, index) => yearPageStart.value + index),
);

function syncText(): void {
  text.value = draft.value ? formatDateInput(draft.value, order.value) : "";
}

watch(value, (next) => {
  draft.value = next ? startOfDay(next) : null;
  invalid.value = false;
  syncText();
});

watch(order, syncText);

watch(
  () => props.mode,
  (mode) => {
    body.value = mode;
  },
);

watch(modalOpen, (isOpen) => {
  if (!isOpen) return;
  draft.value = value.value ? startOfDay(value.value) : null;
  syncText();
  invalid.value = false;
  body.value = props.mode;
  view.value = "days";
  viewDate.value = startOfMonth(draft.value ?? today());
  focusedDate.value = draft.value;
});

function toggleMode(): void {
  body.value = body.value === "calendar" ? "input" : "calendar";
  if (body.value === "input") syncText();
}

function selectDay(date: Date): void {
  draft.value = startOfDay(date);
  focusedDate.value = draft.value;
  viewDate.value = startOfMonth(date);
  if (!props.actions) commit();
}

function selectMonth(month: number): void {
  viewDate.value = new Date(viewDate.value.getFullYear(), month, 1);
  view.value = "days";
}

function selectYear(year: number): void {
  viewDate.value = new Date(year, viewDate.value.getMonth(), 1);
  view.value = "days";
}

/** 头部按钮：日历 → 月份列表 → 年份网格 → 日历。 */
function cycleView(): void {
  view.value = view.value === "days" ? "months" : view.value === "months" ? "years" : "days";
}

/** 箭头在三种视图下分别移动一个月、一年、十二年。 */
function navigate(step: -1 | 1): void {
  if (view.value === "days") viewDate.value = addMonths(viewDate.value, step);
  else if (view.value === "months") viewDate.value = addYears(viewDate.value, step);
  else viewDate.value = addYears(viewDate.value, step * 12);
}

function validateInput(): void {
  const raw = text.value.trim();
  invalid.value = raw.length > 0 && !parseDateInput(raw, order.value);
}

function commit(): void {
  if (body.value === "input") {
    const raw = text.value.trim();
    if (!raw) {
      draft.value = null;
    } else {
      const parsed = parseDateInput(raw, order.value);
      if (!parsed) {
        invalid.value = true;
        return;
      }
      draft.value = parsed;
    }
  }

  invalid.value = false;
  value.value = draft.value ? startOfDay(draft.value) : null;
  syncText();
  emit("confirm", value.value);
  if (props.modal) open.value = false;
}

function cancel(): void {
  draft.value = value.value ? startOfDay(value.value) : null;
  invalid.value = false;
  syncText();
  emit("cancel");
  if (props.modal) open.value = false;
}

function onBackdrop(): void {
  if (props.modal) cancel();
}

function moveFocus(next: Date): void {
  const target = startOfDay(next);
  focusedDate.value = target;
  if (!sameMonth(target, viewDate.value)) viewDate.value = startOfMonth(target);
  void nextTick(() => {
    gridRef.value?.querySelector<HTMLElement>(`[data-date="${toISODate(target)}"]`)?.focus();
  });
}

/** 日历键盘：方向键逐日/逐周，PageUp/PageDown 逐月，Home/End 到本周首尾。 */
function onGridKeydown(event: KeyboardEvent): void {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    (event.target as HTMLElement | null)?.click();
    return;
  }

  const current = focusedDate.value ?? draft.value ?? viewDate.value;
  let next: Date | null = null;

  switch (event.key) {
    case "ArrowLeft":
      next = addDays(current, -1);
      break;
    case "ArrowRight":
      next = addDays(current, 1);
      break;
    case "ArrowUp":
      next = addDays(current, -7);
      break;
    case "ArrowDown":
      next = addDays(current, 7);
      break;
    case "PageUp":
      next = addMonths(current, -1);
      break;
    case "PageDown":
      next = addMonths(current, 1);
      break;
    case "Home": {
      const offset = (current.getDay() - firstDayIndex.value + 7) % 7;
      next = addDays(current, -offset);
      break;
    }
    case "End": {
      const offset = (current.getDay() - firstDayIndex.value + 7) % 7;
      next = addDays(current, 6 - offset);
      break;
    }
    default:
      return;
  }

  event.preventDefault();
  moveFocus(next);
}

useBodyScrollLock(modalOpen);
useOverlayPanel({
  active: modalOpen,
  panel: panelRef,
  onDismiss: cancel,
  initialFocus: '[role="gridcell"][tabindex="0"]',
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
          :aria-label="modal ? (title ?? i18n.t('selectDate')) : undefined"
          variant="filled"
          :level="modal ? 1 : undefined"
          :padded="false"
          :class="['ds-date-picker w-[22rem] max-w-full text-left', modal ? 'shadow-xl' : '']"
          v-bind="$attrs"
        >
          <div v-if="header" class="px-6 pt-6 pb-4">
            <p class="text-sm leading-5 text-ds-muted">{{ title ?? i18n.t("selectDate") }}</p>
            <div class="mt-1 flex items-center justify-between gap-3">
              <p
                class="min-w-0 truncate text-3xl leading-10 text-ds-fg"
                :class="body === 'calendar' && !draft ? 'text-ds-muted' : ''"
              >
                {{ headerText }}
              </p>
              <IconButton
                :icon="body === 'calendar' ? editIcon : calendarIcon"
                :label="body === 'calendar' ? i18n.t('enterDate') : i18n.t('calendar')"
                @click="toggleMode"
              />
            </div>
          </div>
          <div v-if="header" class="border-t border-ds-line" />

          <div :class="header ? 'px-6 pt-4' : 'px-6 pt-5'">
            <div v-if="body === 'calendar'">
              <div class="flex items-center justify-between gap-2">
                <button
                  type="button"
                  class="inline-flex min-w-0 cursor-pointer items-center gap-1 rounded-ds-sm border-0 bg-transparent px-1 py-1 text-lg leading-6 font-medium text-ds-fg transition-colors hover:bg-ds-fg/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ds-focus"
                  :aria-expanded="view !== 'days'"
                  @click="cycleView"
                >
                  <span class="truncate">{{ monthYear }}</span>
                  <Icon
                    :icon="view === 'days' ? arrowDropDownIcon : arrowDropUpIcon"
                    size="1.25em"
                  />
                </button>

                <div class="flex shrink-0 items-center gap-1">
                  <IconButton
                    :icon="chevronLeftIcon"
                    :label="i18n.t('previousMonth')"
                    @click="navigate(-1)"
                  />
                  <IconButton
                    :icon="chevronRightIcon"
                    :label="i18n.t('nextMonth')"
                    @click="navigate(1)"
                  />
                </div>
              </div>

              <template v-if="view === 'days'">
                <div class="mt-2 grid grid-cols-7" aria-hidden="true">
                  <span
                    v-for="(label, index) in weekdayLabels"
                    :key="`weekday-${index}`"
                    class="flex h-8 items-center justify-center text-xs leading-4 text-ds-muted"
                    :title="weekdayTitles[index]"
                  >
                    {{ label }}
                  </span>
                </div>

                <div
                  ref="gridRef"
                  role="grid"
                  :aria-label="monthYear"
                  class="grid grid-cols-7 gap-y-0.5"
                  @keydown="onGridKeydown"
                >
                  <div
                    v-for="(week, weekIndex) in weeks"
                    :key="`week-${weekIndex}`"
                    role="row"
                    class="contents"
                  >
                    <div
                      v-for="cell in week"
                      :key="cell.iso"
                      role="gridcell"
                      :aria-selected="cell.selected"
                      :aria-current="cell.isToday ? 'date' : undefined"
                      :aria-label="cell.label"
                      :data-date="cell.iso"
                      :tabindex="cell.iso === tabbableIso ? 0 : -1"
                      :class="[
                        'relative mx-auto flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-0 text-sm tabular-nums transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ds-focus',
                        cell.selected
                          ? 'bg-ds-primary text-ds-on-primary hover:bg-ds-primary-hover'
                          : cell.inMonth
                            ? 'bg-transparent text-ds-fg hover:bg-ds-fg/10'
                            : 'bg-transparent text-ds-muted/60 hover:bg-ds-fg/10',
                        !cell.selected && cell.isToday ? 'ring-1 ring-ds-primary-strong' : '',
                      ]"
                      @click="selectDay(cell.date)"
                    >
                      {{ cell.day }}
                    </div>
                  </div>
                </div>
              </template>

              <div
                v-else-if="view === 'months'"
                class="mt-2 max-h-72 overflow-y-auto"
                role="listbox"
                :aria-label="i18n.t('chooseMonth')"
              >
                <button
                  v-for="month in monthOptions"
                  :key="month.index"
                  type="button"
                  role="option"
                  :aria-selected="month.index === viewDate.getMonth()"
                  :class="[
                    'flex h-12 w-full cursor-pointer items-center gap-2 rounded-ds-sm border-0 px-3 text-left text-base text-ds-fg transition-colors hover:bg-ds-fg/10 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ds-focus',
                    month.index === viewDate.getMonth()
                      ? 'bg-ds-tonal text-ds-on-tonal'
                      : 'bg-transparent',
                  ]"
                  @click="selectMonth(month.index)"
                >
                  <span class="flex w-6 shrink-0 items-center justify-center">
                    <Icon
                      v-if="month.index === viewDate.getMonth()"
                      :icon="checkIcon"
                      size="1.25em"
                    />
                  </span>
                  <span class="truncate">{{ month.name }}</span>
                </button>
              </div>

              <div
                v-else
                class="mt-3 grid grid-cols-3 gap-1.5 pb-2"
                role="listbox"
                :aria-label="i18n.t('chooseYear')"
              >
                <button
                  v-for="year in yearOptions"
                  :key="year"
                  type="button"
                  role="option"
                  :aria-selected="year === viewDate.getFullYear()"
                  :class="[
                    'h-10 cursor-pointer rounded-full border-0 text-sm tabular-nums transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ds-focus',
                    year === viewDate.getFullYear()
                      ? 'bg-ds-primary text-ds-on-primary hover:bg-ds-primary-hover'
                      : 'bg-transparent text-ds-fg hover:bg-ds-fg/10',
                  ]"
                  @click="selectYear(year)"
                >
                  {{ year }}
                </button>
              </div>
            </div>

            <div v-else class="pb-2">
              <Input
                v-model="text"
                :label="i18n.t('date')"
                float-label
                :state="invalid ? 'error' : 'default'"
                :error-message="i18n.t('invalidDate')"
                :description="datePlaceholder(order, true)"
                :placeholder="datePlaceholder(order)"
                @keydown.enter.prevent="commit"
                @blur="validateInput"
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
