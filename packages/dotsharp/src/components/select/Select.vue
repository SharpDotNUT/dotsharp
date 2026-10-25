<script setup lang="ts">
import {
  cloneVNode,
  computed,
  createVNode,
  Fragment,
  inject,
  nextTick,
  onBeforeUnmount,
  provide,
  ref,
  shallowRef,
  useAttrs,
  useId,
  useSlots,
  watch,
  type VNode,
} from "vue";
import chevronIcon from "@iconify-icons/material-symbols/arrow-drop-down";
import Icon from "../icon/Icon.vue";
import { vRipple } from "../../directives/ripple";
import { useFieldValidation } from "../../composables/useFieldValidation";
import { formItemContextKey, type FormValidateTrigger, type FormValidator } from "../form/context";
import Option from "./Option.vue";
import { selectContextKey, type SelectValue } from "./context";

defineOptions({ inheritAttrs: false });

interface SelectProps {
  /** 浮动标签；聚焦、展开或有选中值时上浮到描边缺口，空态时居中显示。 */
  label?: string;
  /** 没有可显示的选中项文本时显示的文字。有 `label` 且未上浮时不显示。 */
  placeholder?: string;
  disabled?: boolean;
  /**
   * 验证函数：接收当前值，返回 `false` 表示通过，返回 `true` 或错误文案表示不通过。
   */
  validator?: FormValidator<SelectValue>;
  /** 自动校验时机，默认 `["input", "blur"]`；传 `[]` 关闭自动校验。 */
  validateOn?: FormValidateTrigger | FormValidateTrigger[];
}

const props = withDefaults(defineProps<SelectProps>(), {
  label: undefined,
  placeholder: "",
  disabled: false,
  validator: undefined,
  validateOn: undefined,
});

const model = defineModel<SelectValue>("value", { default: 0 });

const slots = useSlots();
const attrs = useAttrs();
const uid = useId();

/** `class` / `style` 落在根元素上，其余属性与事件全部透传给触发器按钮。 */
const rootAttrs = computed(() => {
  const out: Record<string, unknown> = {};
  if (attrs.class) out.class = attrs.class;
  if (attrs.style) out.style = attrs.style;
  return out;
});

const triggerAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = attrs;
  return rest;
});

const triggerRef = ref<HTMLButtonElement | null>(null);
const panelRef = ref<HTMLElement | null>(null);

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

const messageId = `ds-select-message-${uid}`;
const triggerId = `ds-select-trigger-${uid}`;
const labelId = `ds-select-label-${uid}`;

/** `FormItem` 的标签在没有显式无障碍名称时充当控件的可访问名称。 */
const itemLabelAttrs = computed(() => {
  const labelId = formItem?.labelId.value;
  if (props.label || !labelId || "aria-label" in attrs || "aria-labelledby" in attrs) return {};
  return { "aria-labelledby": labelId };
});

const open = ref(false);
const activeEl = shallowRef<HTMLElement | null>(null);
const panelId = `ds-select-panel-${uid}`;

/** 弹层几何；`null` 表示尚未测量，此时保持不可见，避免在错误位置闪一下。 */
const position = shallowRef<{ top: number; left: number; width: number; maxHeight: number } | null>(
  null,
);

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

function flatten(nodes: VNode[]): VNode[] {
  return nodes.flatMap((node) =>
    node.type === Fragment && Array.isArray(node.children)
      ? flatten(node.children as VNode[])
      : [node],
  );
}

/**
 * 子项索引只能在 Select 里确定：展开 Fragment 后按声明顺序给每个 Option 注入 index。
 * computed 在模板里才被求值，因此 `slots.default()` 仍处于渲染上下文中，依赖得以追踪。
 */
const items = computed<VNode[]>(() => {
  let index = 0;
  return flatten(slots.default?.() ?? []).map((node) =>
    node.type === Option ? cloneVNode(node, { index: index++ }) : node,
  );
});

/** 收起态只显示选中项的 `label`，因此用了插槽的 Option 也必须提供 `label`。 */
const selectedLabel = computed(() => {
  for (const node of items.value) {
    if (node.type !== Option) continue;
    const value = (node.props?.value as SelectValue | undefined) ?? (node.props?.index as number);
    if (value === model.value) return (node.props?.label as string | undefined) ?? "";
  }
  return "";
});

const focused = ref(false);
const hasValue = computed(() => Boolean(selectedLabel.value));
/** 标签在聚焦、展开或有选中值时上浮；`Safari` 点击按钮不聚焦，所以 `open` 也参与判断。 */
const labelFloated = computed(
  () => Boolean(props.label) && (hasValue.value || open.value || focused.value),
);

/** 描边由 `fieldset` 画出，才能用 `legend` 切出标签缺口；悬停与聚焦状态交给 group 变体。 */
const outlineClasses = computed(() => {
  if (isInvalid.value) {
    return "border-ds-error group-focus-within:border-ds-error group-focus-within:border-2";
  }
  if (open.value) {
    return "border-ds-primary-strong group-focus-within:border-ds-primary-strong group-focus-within:border-2";
  }
  return "border-ds-outline group-hover:border-ds-fg group-focus-within:border-ds-primary-strong group-focus-within:border-2";
});

const labelClasses = computed(() => [
  "pointer-events-none absolute left-4 max-w-[calc(100%-2rem)] truncate transition-all duration-150",
  labelFloated.value ? "top-0 -translate-y-1/2 text-xs" : "top-1/2 -translate-y-1/2 text-base",
  isInvalid.value ? "text-ds-error" : "text-ds-muted group-focus-within:text-ds-primary-strong",
]);

const legendClasses = computed(() => (labelFloated.value ? "max-w-full" : "max-w-0"));

const GAP = 4;
const EDGE = 8;
const MAX_HEIGHT = 320;

/** 触发器的视口矩形决定弹层位置；下方放不下且上方更宽裕时改为向上展开。 */
function place(): void {
  const trigger = triggerRef.value;
  const panel = panelRef.value;
  if (!trigger || !panel) return;

  // 先解除 max-height 再量，否则第二次测量只能拿到被裁剪后的高度。
  const previous = panel.style.maxHeight;
  panel.style.maxHeight = "none";
  const natural = panel.offsetHeight;
  panel.style.maxHeight = previous;

  const rect = trigger.getBoundingClientRect();
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

/** 弹层里的可用选项元素，按渲染顺序；禁用的选项不参与键盘移动。 */
function enabledOptions(): HTMLElement[] {
  const panel = panelRef.value;
  if (!panel) return [];
  return Array.from(
    panel.querySelectorAll<HTMLElement>('[role="option"]:not([aria-disabled="true"])'),
  );
}

function reveal(el: HTMLElement | null): void {
  const panel = panelRef.value;
  if (!panel || !el) return;
  const top = el.offsetTop;
  const bottom = top + el.offsetHeight;
  if (top < panel.scrollTop) panel.scrollTop = top - 4;
  else if (bottom > panel.scrollTop + panel.clientHeight) {
    panel.scrollTop = bottom - panel.clientHeight + 4;
  }
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
  if (triggerRef.value?.contains(target) || panelRef.value?.contains(target)) return;
  closePanel();
}

async function openPanel(): Promise<void> {
  if (props.disabled || open.value) return;

  open.value = true;
  position.value = null;
  await nextTick();
  if (!open.value) return;

  place();
  const options = enabledOptions();
  activeEl.value =
    options.find((el) => el.getAttribute("aria-selected") === "true") ?? options[0] ?? null;
  reveal(activeEl.value);
  listen(true);
}

function closePanel(): void {
  if (!open.value) return;
  open.value = false;
  activeEl.value = null;
  listen(false);
}

function toggle(): void {
  if (open.value) closePanel();
  else void openPanel();
}

function select(value: SelectValue): void {
  if (value !== model.value) {
    model.value = value;
    triggerValidation("input", value);
  }
  closePanel();
  triggerRef.value?.focus();
}

function setActive(el: HTMLElement | null): void {
  activeEl.value = el;
}

function move(step: 1 | -1): void {
  const options = enabledOptions();
  if (!options.length) return;
  const current = activeEl.value ? options.indexOf(activeEl.value) : -1;
  const next =
    current === -1
      ? step === 1
        ? 0
        : options.length - 1
      : (current + step + options.length) % options.length;
  activeEl.value = options[next] ?? null;
  reveal(activeEl.value);
}

function onKeydown(event: KeyboardEvent): void {
  if (props.disabled || event.defaultPrevented) return;
  const key = event.key;

  if (!open.value) {
    if (key === "ArrowDown" || key === "ArrowUp" || key === "Enter" || key === " ") {
      event.preventDefault();
      void openPanel();
    }
    return;
  }

  const options = enabledOptions();

  switch (key) {
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
    case "Home":
      event.preventDefault();
      activeEl.value = options[0] ?? null;
      reveal(activeEl.value);
      break;
    case "End":
      event.preventDefault();
      activeEl.value = options[options.length - 1] ?? null;
      reveal(activeEl.value);
      break;
    case "Enter":
    case " ":
      event.preventDefault();
      // 选项自己提交选中值并关闭弹层，键盘与鼠标走同一条路径。
      activeEl.value?.click();
      break;
  }
}

function onBlur(event: FocusEvent): void {
  const next = event.relatedTarget as Node | null;
  if (next && (triggerRef.value?.contains(next) || panelRef.value?.contains(next))) return;
  focused.value = false;
  closePanel();
  triggerValidation("blur");
}

watch(
  () => props.disabled,
  (disabled) => {
    if (disabled) closePanel();
  },
);

onBeforeUnmount(() => listen(false));

provide(selectContextKey, { model, activeEl, select, setActive });

/**
 * 数组子节点的容器：函数式组件直接返回数组会被当成文本，必须包一层 Fragment。
 */
const OptionNodes = (props: { nodes: VNode[] }) => createVNode(Fragment, null, props.nodes);
</script>

<template>
  <div
    v-bind="rootAttrs"
    class="ds-select relative inline-flex flex-col gap-1 align-middle font-ds"
  >
    <div class="group relative w-full" :class="disabled ? 'opacity-60' : ''">
      <fieldset
        class="pointer-events-none absolute right-0 bottom-0 left-0 m-0 box-border min-w-0 rounded-ds-sm border p-0 transition-colors"
        :class="[label ? '-top-1.5' : 'top-0', outlineClasses]"
        aria-hidden="true"
      >
        <legend
          v-if="label"
          class="ml-3 overflow-hidden whitespace-nowrap p-0 text-xs leading-none transition-[max-width] duration-150"
          :class="legendClasses"
        >
          <span class="invisible inline-block px-1">{{ label }}</span>
        </legend>
      </fieldset>

      <button
        :id="triggerId"
        ref="triggerRef"
        type="button"
        role="combobox"
        v-ripple
        aria-haspopup="listbox"
        :disabled="disabled"
        :aria-expanded="open"
        :aria-controls="open ? panelId : undefined"
        :aria-activedescendant="open ? activeEl?.id : undefined"
        :aria-invalid="isInvalid || undefined"
        :aria-describedby="validationMessage ? messageId : undefined"
        class="ds-select__trigger box-border flex min-h-14 w-full min-w-40 cursor-pointer items-center justify-between gap-2 rounded-ds-sm bg-ds-surface px-4 text-base leading-6 text-ds-fg transition-colors disabled:cursor-not-allowed"
        v-bind="{ ...triggerAttrs, ...itemLabelAttrs }"
        @click="toggle"
        @keydown="onKeydown"
        @focus="focused = true"
        @blur="onBlur"
      >
        <span
          class="min-w-0 flex-1 truncate text-left"
          :class="selectedLabel ? '' : 'text-ds-muted'"
          >{{ selectedLabel || (label && !labelFloated ? "" : placeholder) }}</span
        >
        <span class="flex w-6 shrink-0 items-center justify-center text-ds-muted">
          <Icon :icon="chevronIcon" size="1.5em" />
        </span>
      </button>

      <label v-if="label" :id="labelId" :for="triggerId" :class="labelClasses">
        {{ label }}
      </label>
    </div>

    <p v-if="validationMessage" :id="messageId" class="px-4 text-xs leading-4 text-ds-error">
      {{ validationMessage }}
    </p>

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
          ref="panelRef"
          :id="panelId"
          role="listbox"
          tabindex="-1"
          :style="panelStyle"
          class="ds-select__panel fixed z-50 overflow-y-auto rounded-ds-sm bg-ds-elevated py-2 font-ds text-ds-fg shadow-ds-2"
        >
          <OptionNodes :nodes="items" />
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
