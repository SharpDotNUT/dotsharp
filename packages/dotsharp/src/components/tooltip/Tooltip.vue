<script setup lang="ts">
import {
  Comment,
  Fragment,
  cloneVNode,
  computed,
  createVNode,
  nextTick,
  onBeforeUnmount,
  ref,
  shallowRef,
  useId,
  useSlots,
  watch,
  type VNode,
} from "vue";
import type { TooltipPlacement, TooltipVariant } from "./types";

defineOptions({ inheritAttrs: false });

interface TooltipProps {
  /** `plain`：一行深色文字提示；`rich`：带标题、正文与可选操作的卡片。 */
  variant?: TooltipVariant;
  /** 纯工具提示的文字，`plain` 变体使用。 */
  label?: string;
  /** 富工具提示的标题。 */
  title?: string;
  /** 富工具提示的正文；`#content` 插槽优先。 */
  text?: string;
  /** 富工具提示底部操作的文字；`#action` 插槽优先。 */
  actionLabel?: string;
  /** 首选方位；空间不足时自动翻到对面。 */
  placement?: TooltipPlacement;
  disabled?: boolean;
  /** 悬停多久后出现（毫秒）；键盘聚焦立即出现。 */
  showDelay?: number;
}

const props = withDefaults(defineProps<TooltipProps>(), {
  variant: "plain",
  label: undefined,
  title: undefined,
  text: undefined,
  actionLabel: undefined,
  placement: "top",
  disabled: false,
  showDelay: 500,
});

const emit = defineEmits<{ action: [] }>();

/** 受控的展开状态；悬停、聚焦与 Escape 都会同步写回。 */
const open = defineModel<boolean>("open", { default: false });

const slots = useSlots();
const rootRef = ref<HTMLElement | null>(null);
const panelRef = ref<HTMLElement | null>(null);

const panelId = `ds-tooltip-${useId()}`;
const titleId = `${panelId}-title`;

const isRich = computed(() => props.variant === "rich");
const hasTitle = computed(() => isRich.value && Boolean(props.title));
const hasAction = computed(() => isRich.value && Boolean(props.actionLabel || slots.action));
const hasContent = computed(() =>
  isRich.value
    ? Boolean(props.title || props.text || slots.content || slots.action)
    : Boolean(props.label || slots.content),
);

/** `plain` 用 `aria-describedby` 把文字挂到触发元素上。 */
const describedBy = computed(() =>
  !isRich.value && (props.label || slots.content) ? panelId : undefined,
);

/**
 * 单个触发元素直接克隆并补 `aria-describedby`（描述会真正落在可聚焦元素上）；
 * 多元素或文本插槽退回包裹元素。
 */
const triggerNodes = computed<VNode[]>(() => {
  const nodes = slots.default?.() ?? [];
  if (!describedBy.value) return nodes;

  const elements = nodes.filter((node) => node.type !== Comment);
  if (elements.length !== 1) return nodes;

  const node = elements[0];
  const cloneable = typeof node.type === "string" || typeof node.type === "object";
  return cloneable ? [cloneVNode(node, { "aria-describedby": describedBy.value })] : nodes;
});

/**
 * 数组子节点的容器：函数式组件直接返回数组会被当成文本，必须包一层 Fragment。
 */
const TriggerNodes = (slotProps: { nodes: VNode[] }) =>
  createVNode(Fragment, null, slotProps.nodes);

/** 弹层几何；`null` 表示还没量到尺寸，此时先隐藏，避免在错误位置闪一下。 */
const position = shallowRef<{ top: number; left: number } | null>(null);

const panelStyle = computed(() => {
  const rect = position.value;
  if (!rect) return { visibility: "hidden" as const, top: "0px", left: "0px" };
  return { top: `${rect.top}px`, left: `${rect.left}px` };
});

const GAP = 6;
const EDGE = 8;

const OPPOSITE: Record<TooltipPlacement, TooltipPlacement> = {
  top: "bottom",
  bottom: "top",
  left: "right",
  right: "left",
};

function fits(
  placement: TooltipPlacement,
  trigger: DOMRect,
  width: number,
  height: number,
): boolean {
  switch (placement) {
    case "top":
      return trigger.top - GAP - height >= EDGE;
    case "bottom":
      return trigger.bottom + GAP + height <= window.innerHeight - EDGE;
    case "left":
      return trigger.left - GAP - width >= EDGE;
    case "right":
      return trigger.right + GAP + width <= window.innerWidth - EDGE;
  }
}

function clamp(value: number, max: number): number {
  return Math.min(Math.max(value, EDGE), Math.max(EDGE, max));
}

function place(): void {
  const trigger = rootRef.value;
  const panel = panelRef.value;
  if (!trigger || !panel) return;

  const rect = trigger.getBoundingClientRect();
  const width = panel.offsetWidth;
  const height = panel.offsetHeight;

  const placement =
    fits(props.placement, rect, width, height) ||
    !fits(OPPOSITE[props.placement], rect, width, height)
      ? props.placement
      : OPPOSITE[props.placement];

  let top = 0;
  let left = 0;

  switch (placement) {
    case "top":
      top = rect.top - GAP - height;
      left = rect.left + rect.width / 2 - width / 2;
      break;
    case "bottom":
      top = rect.bottom + GAP;
      left = rect.left + rect.width / 2 - width / 2;
      break;
    case "left":
      top = rect.top + rect.height / 2 - height / 2;
      left = rect.left - GAP - width;
      break;
    case "right":
      top = rect.top + rect.height / 2 - height / 2;
      left = rect.right + GAP;
      break;
  }

  position.value = {
    top: clamp(top, window.innerHeight - height - EDGE),
    left: clamp(left, window.innerWidth - width - EDGE),
  };
}

let showTimer: ReturnType<typeof setTimeout> | undefined;
let hideTimer: ReturnType<typeof setTimeout> | undefined;

function clearTimers(): void {
  if (showTimer !== undefined) clearTimeout(showTimer);
  if (hideTimer !== undefined) clearTimeout(hideTimer);
  showTimer = undefined;
  hideTimer = undefined;
}

function reveal(immediate = false): void {
  if (props.disabled || !hasContent.value) return;
  clearTimers();

  const delay = immediate ? 0 : Math.max(0, props.showDelay);
  if (delay === 0) open.value = true;
  else showTimer = setTimeout(() => (open.value = true), delay);
}

function dismiss(delay = 0): void {
  clearTimers();
  if (delay === 0) open.value = false;
  else hideTimer = setTimeout(() => (open.value = false), delay);
}

/** 鼠标从触发元素移向富提示时，留出一点时间跨过间隙。 */
const HIDE_DELAY = 120;

function onTriggerEnter(): void {
  reveal();
}

function onTriggerLeave(): void {
  dismiss(HIDE_DELAY);
}

function onPanelEnter(): void {
  clearTimers();
}

function onPanelLeave(): void {
  dismiss(HIDE_DELAY);
}

function onFocusIn(): void {
  reveal(true);
}

function onFocusOut(event: FocusEvent): void {
  const next = event.relatedTarget as Node | null;
  if (next && panelRef.value?.contains(next)) return;
  dismiss();
}

function onAction(): void {
  emit("action");
  dismiss();
}

/** 面板里有焦点时关闭（Escape / 点击操作），把焦点还给触发元素。 */
function restoreFocus(): void {
  if (typeof document === "undefined") return;

  const panel = panelRef.value;
  const root = rootRef.value;
  const active = document.activeElement;
  if (!panel || !root || !(active instanceof HTMLElement) || !panel.contains(active)) return;

  root
    .querySelector<HTMLElement>(
      'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])',
    )
    ?.focus();
}

function onDocumentKeydown(event: KeyboardEvent): void {
  if (event.key !== "Escape" || !open.value) return;
  dismiss();
}

let listening = false;

function listen(on: boolean): void {
  if (typeof window === "undefined" || on === listening) return;
  listening = on;

  if (on) {
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    window.addEventListener("keydown", onDocumentKeydown);
  } else {
    window.removeEventListener("resize", place);
    window.removeEventListener("scroll", place, true);
    window.removeEventListener("keydown", onDocumentKeydown);
  }
}

watch(
  open,
  async (value) => {
    if (value) {
      position.value = null;
      await nextTick();
      if (!open.value) return;
      place();
      listen(true);
    } else {
      listen(false);
      restoreFocus();
      clearTimers();
    }
  },
  { immediate: true },
);

watch(
  () => props.disabled,
  (disabled) => {
    if (disabled) dismiss();
  },
);

onBeforeUnmount(() => {
  clearTimers();
  listen(false);
});
</script>

<template>
  <span
    ref="rootRef"
    v-bind="$attrs"
    :aria-describedby="describedBy"
    class="ds-tooltip inline-flex"
    @pointerenter="onTriggerEnter"
    @pointerleave="onTriggerLeave"
    @focusin="onFocusIn"
    @focusout="onFocusOut"
  >
    <TriggerNodes :nodes="triggerNodes" />
  </span>

  <Transition
    enter-active-class="transition-opacity duration-100 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition-opacity duration-75 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="open"
      :id="panelId"
      ref="panelRef"
      :role="isRich ? 'dialog' : 'tooltip'"
      :aria-labelledby="hasTitle ? titleId : undefined"
      :style="panelStyle"
      :class="[
        'ds-tooltip__panel fixed z-50 box-border font-ds',
        isRich
          ? 'max-w-80 rounded-ds-lg bg-ds-elevated p-3 text-ds-fg shadow-[0_1px_2px_0_rgba(0,0,0,0.3),0_2px_6px_2px_rgba(0,0,0,0.15)]'
          : 'pointer-events-none max-w-[12.5rem] rounded-ds-sm bg-ds-fg px-2 py-1 text-center text-xs leading-4 text-ds-bg shadow-[0_1px_2px_0_rgba(0,0,0,0.3),0_2px_6px_2px_rgba(0,0,0,0.15)]',
      ]"
      @pointerenter="onPanelEnter"
      @pointerleave="onPanelLeave"
    >
      <template v-if="isRich">
        <div v-if="title" :id="titleId" class="text-base leading-6 font-medium">{{ title }}</div>
        <div :class="['text-sm leading-5 text-ds-muted', title ? 'mt-1' : '']">
          <slot name="content">{{ text }}</slot>
        </div>
        <div v-if="hasAction" class="mt-2">
          <slot name="action">
            <button
              type="button"
              class="ds-tooltip__action -ml-2 cursor-pointer rounded-ds-sm border-0 bg-transparent px-2 py-1 font-ds text-sm font-medium text-ds-primary-strong hover:bg-ds-surface-hover focus-visible:outline-2 focus-visible:outline-ds-focus"
              @click="onAction"
            >
              {{ actionLabel }}
            </button>
          </slot>
        </div>
      </template>
      <template v-else>
        <slot name="content">{{ label }}</slot>
      </template>
    </div>
  </Transition>
</template>
