<script setup lang="ts">
import {
  cloneVNode,
  computed,
  createVNode,
  Fragment,
  nextTick,
  onBeforeUnmount,
  ref,
  useSlots,
  watch,
  type VNode,
} from "vue";
import type { IconifyIcon } from "@iconify/vue";
import addIcon from "@iconify-icons/material-symbols/add";
import closeIcon from "@iconify-icons/material-symbols/close";
import Fab from "./Fab.vue";
import type { FabSize, FabVariant } from "./shared";

defineOptions({ inheritAttrs: false });

interface FabMenuProps {
  /** 触发按钮的无障碍名称（`aria-label`）。 */
  label: string;
  /** 收起状态下触发按钮的图标，默认加号；展开后固定换成关闭图标。 */
  icon?: IconifyIcon | string;
  variant?: FabVariant;
  size?: FabSize;
}

const props = withDefaults(defineProps<FabMenuProps>(), {
  icon: undefined,
  variant: "primary",
  size: "md",
});

const open = defineModel<boolean>("open", { default: false });

const slots = useSlots();
const rootRef = ref<HTMLElement | null>(null);
const panelRef = ref<HTMLElement | null>(null);
const triggerRef = ref<HTMLElement | null>(null);

const triggerIcon = computed(() => (open.value ? closeIcon : (props.icon ?? addIcon)));

function flatten(nodes: VNode[]): VNode[] {
  return nodes.flatMap((node) =>
    node.type === Fragment && Array.isArray(node.children)
      ? flatten(node.children as VNode[])
      : [node],
  );
}

/**
 * 菜单项就是扩展 FAB：给每个 Fab 补上 `menuitem` 语义，并在选中后收起菜单。
 * `cloneVNode` 会合并 props 里的 `onClick`，使用方自己的处理器照常触发。
 */
const items = computed<VNode[]>(() =>
  flatten(slots.default?.() ?? []).map((node) => {
    if (node.type !== Fab) return node;
    return cloneVNode(node, {
      role: "menuitem",
      tabindex: -1,
      onClick: () => close(),
    });
  }),
);

const ItemNodes = (props: { nodes: VNode[] }) => createVNode(Fragment, null, props.nodes);

function focusTrigger(): void {
  const target = triggerRef.value?.firstElementChild;
  if (target instanceof HTMLElement) target.focus();
}

function close(restoreFocus = true): void {
  open.value = false;
  if (restoreFocus) focusTrigger();
}

function toggle(): void {
  open.value = !open.value;
}

function listen(register: boolean): void {
  if (typeof document === "undefined") return;
  if (register) {
    document.addEventListener("pointerdown", onPointerDown, true);
    document.addEventListener("keydown", onKeydown, true);
  } else {
    document.removeEventListener("pointerdown", onPointerDown, true);
    document.removeEventListener("keydown", onKeydown, true);
  }
}

function onPointerDown(event: Event): void {
  const target = event.target as Node | null;
  if (target && rootRef.value?.contains(target)) return;
  close(false);
}

function onKeydown(event: KeyboardEvent): void {
  if (event.key === "Escape" && open.value) {
    event.preventDefault();
    close();
  }
}

/** 菜单是一次性浮层：方向键在菜单项之间循环，`Tab` 之后交给文档顺序。 */
function onPanelKeydown(event: KeyboardEvent): void {
  if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
  const items = Array.from(
    panelRef.value?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? [],
  );
  if (!items.length) return;
  event.preventDefault();
  const current = items.indexOf(document.activeElement as HTMLElement);
  let next = 0;
  if (event.key === "End") next = items.length - 1;
  else if (event.key !== "Home") {
    const step = event.key === "ArrowDown" ? 1 : -1;
    next = current === -1 ? 0 : (current + step + items.length) % items.length;
  }
  items[next]?.focus();
}

watch(open, async (value) => {
  if (value) {
    await nextTick();
    if (!open.value) return;
    panelRef.value?.querySelector<HTMLElement>('[role="menuitem"]')?.focus();
    listen(true);
    return;
  }
  listen(false);
});

onBeforeUnmount(() => listen(false));
</script>

<template>
  <div
    ref="rootRef"
    v-bind="$attrs"
    class="ds-fab-menu relative inline-flex flex-col items-end gap-3"
  >
    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="opacity-0 translate-y-2 scale-95"
      enter-to-class="opacity-100 translate-y-0 scale-100"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="opacity-100 translate-y-0 scale-100"
      leave-to-class="opacity-0 translate-y-2 scale-95"
    >
      <div
        v-if="open"
        ref="panelRef"
        role="menu"
        :aria-label="label"
        class="flex flex-col items-end gap-3"
        @keydown="onPanelKeydown"
      >
        <ItemNodes :nodes="items" />
      </div>
    </Transition>

    <span ref="triggerRef" class="contents">
      <Fab
        :icon="triggerIcon"
        :variant="variant"
        :size="size"
        :aria-label="label"
        aria-haspopup="menu"
        :aria-expanded="open"
        @click="toggle"
      />
    </span>
  </div>
</template>
