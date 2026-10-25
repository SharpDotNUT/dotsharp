<script setup lang="ts">
import {
  Comment,
  Fragment,
  cloneVNode,
  computed,
  createVNode,
  inject,
  nextTick,
  onBeforeUnmount,
  onMounted,
  provide,
  ref,
  shallowRef,
  useId,
  useSlots,
  watch,
  type VNode,
} from "vue";
import MenuItem from "./MenuItem.vue";
import { menuContextKey, type MenuValue } from "./context";
import type { MenuPlacement } from "./types";

defineOptions({ inheritAttrs: false });

interface MenuProps {
  /** 菜单贴靠的元素；省略时使用 `#trigger` 插槽里的触发元素。 */
  anchor?: HTMLElement | null;
  /** 相对锚点的展开方向；二级菜单用 `right-start`。 */
  placement?: MenuPlacement;
  /** 视口坐标（上下文菜单）；给出时忽略 `anchor`。 */
  x?: number;
  y?: number;
  /** 展开时是否把焦点移入第一个可用菜单项。 */
  autoFocus?: boolean;
}

const props = withDefaults(defineProps<MenuProps>(), {
  anchor: null,
  placement: "bottom-start",
  x: undefined,
  y: undefined,
  autoFocus: true,
});

const emit = defineEmits<{ select: [value: MenuValue] }>();

const open = defineModel<boolean>("open", { default: false });

const slots = useSlots();
const uid = useId();
const panelId = `ds-menu-${uid}`;

/** 二级菜单会注入父级菜单的 context；`null` 表示这是菜单树的根。 */
const parent = inject(menuContextKey, null);
const isSubmenu = parent !== null;

/** 子菜单复用根菜单的面板集合，点击外部时整棵树只需要一份判断。 */
const panels = parent?.panels ?? new Set<HTMLElement>();
const hovered = ref<symbol | null>(null);

/** 打开前的焦点位置，用于没有锚点的菜单（上下文菜单）关闭后交还焦点。 */
let previousActive: HTMLElement | null = null;

function setHover(id: symbol | null): void {
  hovered.value = id;
}

function restoreFocus(): void {
  const trigger = triggerRef.value?.firstElementChild;
  const target = [
    trigger instanceof HTMLElement ? trigger : null,
    previousActive,
    props.anchor,
  ].find((el) => el && el.isConnected && el !== document.body);
  target?.focus();
}

/**
 * 选中一项，由根级 Menu 统一上报。
 * `close` 为 `false` 时不收起菜单——可勾选项切换勾选态后菜单应保持展开。
 */
function select(value: MenuValue, close = true): void {
  if (parent) {
    parent.select(value, close);
    return;
  }
  emit("select", value);
  if (!close) return;
  open.value = false;
  restoreFocus();
}

provide(menuContextKey, { select, hovered, setHover, panels });

/* ------------------------------- 触发器 ------------------------------- */

const triggerRef = ref<HTMLElement | null>(null);

const hasTrigger = computed(() => Boolean(slots.trigger));

function callHandler(handler: unknown, event: Event): void {
  if (Array.isArray(handler)) {
    for (const item of handler) {
      if (typeof item === "function") item(event);
    }
  } else if (typeof handler === "function") {
    (handler as (event: Event) => void)(event);
  }
}

/**
 * 单个触发元素直接克隆并补上菜单语义（`aria-haspopup` / `aria-expanded` 必须落在可聚焦元素上）；
 * 多元素或文本插槽退回原样渲染，点击仍由外层容器接管。
 */
const triggerNodes = computed<VNode[]>(() => {
  const nodes = (slots.trigger?.() ?? []).filter((node) => node.type !== Comment);
  if (nodes.length !== 1) return nodes;

  const node = nodes[0];
  if (!node) return nodes;
  const cloneable = typeof node.type === "string" || typeof node.type === "object";
  if (!cloneable) return nodes;

  return [
    cloneVNode(node, {
      "aria-haspopup": "menu",
      "aria-expanded": open.value ? "true" : "false",
      "aria-controls": open.value ? panelId : undefined,
      onKeydown: (event: KeyboardEvent) => {
        callHandler(node.props?.onKeydown, event);
        if (event.defaultPrevented) return;
        if (event.key === "ArrowDown" || event.key === "ArrowUp") {
          event.preventDefault();
          open.value = true;
        }
      },
    }),
  ];
});

function toggle(): void {
  open.value = !open.value;
}

/* -------------------------------- 定位 -------------------------------- */

const panelRef = ref<HTMLElement | null>(null);

/** 弹层几何；`null` 表示尚未测量，此时保持不可见，避免在错误位置闪一下。 */
const position = shallowRef<{ top: number; left: number; maxHeight: number } | null>(null);

const panelStyle = computed(() => {
  const rect = position.value;
  if (!rect) return { visibility: "hidden" as const, top: "0px", left: "0px" };
  return {
    top: `${rect.top}px`,
    left: `${rect.left}px`,
    maxHeight: `${rect.maxHeight}px`,
  };
});

const GAP = 4;
const EDGE = 8;

function clamp(value: number, max: number): number {
  return Math.min(Math.max(value, EDGE), Math.max(EDGE, max));
}

function anchorElement(): HTMLElement | null {
  return props.anchor ?? triggerRef.value;
}

function place(): void {
  const panel = panelRef.value;
  if (!panel) return;

  // 先解除上一次的 max-height 再量，否则拿到的只是被裁剪后的尺寸。
  const previous = panel.style.maxHeight;
  panel.style.maxHeight = "none";
  const width = panel.offsetWidth;
  const height = panel.offsetHeight;
  panel.style.maxHeight = previous;

  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  if (props.x !== undefined || props.y !== undefined) {
    const x = props.x ?? 0;
    const y = props.y ?? 0;
    const top = y + height > viewportHeight - EDGE ? Math.max(EDGE, y - height) : y;
    position.value = {
      top,
      left: clamp(x + width > viewportWidth - EDGE ? x - width : x, viewportWidth - width),
      maxHeight: Math.max(viewportHeight - top - EDGE, 48),
    };
    return;
  }

  const anchor = anchorElement();
  if (!anchor) {
    position.value = { top: EDGE, left: EDGE, maxHeight: viewportHeight - EDGE * 2 };
    return;
  }

  const rect = anchor.getBoundingClientRect();

  if (props.placement === "right-start") {
    const flip = rect.right + GAP + width > viewportWidth - EDGE && rect.left - GAP - width >= EDGE;
    const left = flip ? rect.left - GAP - width : rect.right + GAP;
    const top = Math.max(EDGE, Math.min(rect.top, viewportHeight - height - EDGE));
    position.value = {
      top,
      left: clamp(left, viewportWidth - width),
      maxHeight: Math.max(viewportHeight - top - EDGE, 48),
    };
    return;
  }

  const left = clamp(
    props.placement === "bottom-end" ? rect.right - width : rect.left,
    viewportWidth - width,
  );
  const below = viewportHeight - rect.bottom - GAP - EDGE;
  const above = rect.top - GAP - EDGE;
  const flip = height > below && above > below;
  const top = flip ? Math.max(EDGE, rect.top - GAP - Math.min(height, above)) : rect.bottom + GAP;

  position.value = {
    top,
    left,
    maxHeight: Math.max(Math.min(height, flip ? above : below), 48),
  };
}

/* ------------------------------ 打开与关闭 ------------------------------ */

function listen(register: boolean): void {
  if (typeof document === "undefined") return;
  if (register) {
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
  if (triggerRef.value?.contains(target)) return;
  if (props.anchor?.contains(target)) return;
  for (const panel of panels) {
    if (panel.contains(target)) return;
  }
  open.value = false;
}

const FOCUSABLE = '[role^="menuitem"]:not([aria-disabled="true"]):not([disabled])';

function enabledItems(): HTMLElement[] {
  const panel = panelRef.value;
  if (!panel) return [];
  return Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE));
}

function focusAt(items: HTMLElement[], index: number): void {
  const target = items[Math.min(Math.max(index, 0), items.length - 1)];
  target?.focus();
}

function focusFirst(): void {
  if (!open.value) return;
  if (!position.value) place();
  const items = enabledItems();
  (items[0] ?? panelRef.value)?.focus();
}

defineExpose({ focusFirst });

async function activate(): Promise<void> {
  previousActive = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  position.value = null;
  await nextTick();
  if (!open.value) return;
  place();
  if (props.autoFocus) focusFirst();
  listen(true);
}

watch(open, (value) => {
  if (value) {
    void activate();
  } else {
    hovered.value = null;
    listen(false);
  }
});

watch(
  () => [props.x, props.y, props.anchor, props.placement],
  () => {
    if (open.value) place();
  },
);

watch(panelRef, (el, previous) => {
  if (previous) panels.delete(previous);
  if (el) panels.add(el);
});

onMounted(() => {
  if (open.value) void activate();
});

onBeforeUnmount(() => {
  listen(false);
  if (panelRef.value) panels.delete(panelRef.value);
});

/** 收起当前这一级：子菜单收起后焦点还给父菜单项，根菜单还给触发元素。 */
function dismissLevel(): void {
  open.value = false;
  if (isSubmenu) {
    props.anchor?.focus();
    return;
  }
  restoreFocus();
}

function onPanelKeydown(event: KeyboardEvent): void {
  if (event.defaultPrevented) return;
  const items = enabledItems();
  const current = items.indexOf(document.activeElement as HTMLElement);

  switch (event.key) {
    case "ArrowDown":
      event.preventDefault();
      focusAt(items, current < 0 || current === items.length - 1 ? 0 : current + 1);
      break;
    case "ArrowUp":
      event.preventDefault();
      focusAt(items, current <= 0 ? items.length - 1 : current - 1);
      break;
    case "Home":
      event.preventDefault();
      focusAt(items, 0);
      break;
    case "End":
      event.preventDefault();
      focusAt(items, items.length - 1);
      break;
    case "ArrowLeft":
      if (isSubmenu) {
        event.preventDefault();
        dismissLevel();
      }
      break;
    case "Escape":
      event.preventDefault();
      dismissLevel();
      break;
    case "Tab":
      open.value = false;
      break;
  }
}

/* -------------------------------- 子项 -------------------------------- */

function flatten(nodes: VNode[]): VNode[] {
  return nodes.flatMap((node) =>
    node.type === Fragment && Array.isArray(node.children)
      ? flatten(node.children as VNode[])
      : [node],
  );
}

/**
 * 子项索引只能在 Menu 里确定：展开 Fragment 后按声明顺序给每个 MenuItem 注入 index。
 * computed 在模板里才被求值，因此 `slots.default()` 仍处于渲染上下文中，依赖得以追踪。
 */
const items = computed<VNode[]>(() => {
  let index = 0;
  return flatten(slots.default?.() ?? []).map((node) =>
    node.type === MenuItem ? cloneVNode(node, { index: index++ }) : node,
  );
});

/**
 * 数组子节点的容器：函数式组件直接返回数组会被当成文本，必须包一层 Fragment。
 */
const TriggerNodes = (props: { nodes: VNode[] }) => createVNode(Fragment, null, props.nodes);
const ItemNodes = (props: { nodes: VNode[] }) => createVNode(Fragment, null, props.nodes);
</script>

<template>
  <span v-if="hasTrigger" ref="triggerRef" class="ds-menu__trigger inline-flex" @click="toggle">
    <TriggerNodes :nodes="triggerNodes" />
  </span>

  <Teleport to="body">
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
        role="menu"
        tabindex="-1"
        v-bind="$attrs"
        :style="panelStyle"
        class="ds-menu__panel fixed z-50 box-border min-w-28 max-w-[17.5rem] overflow-y-auto overscroll-contain rounded-ds-sm bg-ds-elevated py-2 font-ds text-ds-fg shadow-[0_1px_2px_0_rgba(0,0,0,0.3),0_2px_6px_2px_rgba(0,0,0,0.15)] outline-none"
        @keydown="onPanelKeydown"
      >
        <ItemNodes :nodes="items" />
      </div>
    </Transition>
  </Teleport>
</template>
