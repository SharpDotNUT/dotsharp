<script setup lang="ts">
import {
  cloneVNode,
  computed,
  createVNode,
  Fragment,
  nextTick,
  onBeforeUnmount,
  onMounted,
  provide,
  ref,
  useSlots,
  watch,
  type VNode,
} from "vue";
import NavigationDrawerItem from "./NavigationDrawerItem.vue";
import { navigationDrawerContextKey, type NavigationDrawerValue } from "./context";

defineOptions({ inheritAttrs: false });

type NavigationDrawerVariant = "standard" | "modal";

interface NavigationDrawerProps {
  /** `standard`：嵌在应用布局里；`modal`：带遮罩浮层，由 `v-model:open` 控制。 */
  variant?: NavigationDrawerVariant;
  /** 无障碍名称，同时用作 `<nav>` 与 modal 对话框的 `aria-label`。 */
  label?: string;
}

const props = withDefaults(defineProps<NavigationDrawerProps>(), {
  variant: "standard",
  label: undefined,
});

const model = defineModel<NavigationDrawerValue>("value", { default: 0 });
const open = defineModel<boolean>("open", { default: false });

const slots = useSlots();

provide(navigationDrawerContextKey, { model });

const isModal = computed(() => props.variant === "modal");

const panelRef = ref<HTMLElement | null>(null);

let restoreFocus: HTMLElement | null = null;
let previousOverflow = "";

function close(): void {
  open.value = false;
}

function focusableElements(): HTMLElement[] {
  const panel = panelRef.value;
  if (!panel) return [];
  return [
    ...panel.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  ];
}

/** modal 打开期间：Escape 关闭，Tab 在面板内循环（焦点陷阱）。 */
function onKeydown(event: KeyboardEvent): void {
  if (!open.value || !isModal.value) return;

  if (event.key === "Escape") {
    event.preventDefault();
    open.value = false;
    return;
  }

  if (event.key !== "Tab") return;

  const items = focusableElements();
  const first = items[0];
  const last = items[items.length - 1];

  if (!first || !last) {
    event.preventDefault();
    panelRef.value?.focus();
    return;
  }

  if (event.shiftKey) {
    if (document.activeElement === first || document.activeElement === panelRef.value) {
      event.preventDefault();
      last.focus();
    }
  } else if (document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

watch(open, (isOpen) => {
  if (!isModal.value || typeof document === "undefined") return;

  if (isOpen) {
    restoreFocus = document.activeElement as HTMLElement | null;
    previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    nextTick(() => {
      const panel = panelRef.value;
      if (!panel) return;
      (panel.querySelector<HTMLElement>('[aria-current="page"]') ?? panel).focus();
    });
  } else {
    document.body.style.overflow = previousOverflow;
    restoreFocus?.focus();
    restoreFocus = null;
  }
});

onMounted(() => window.addEventListener("keydown", onKeydown));

onBeforeUnmount(() => {
  window.removeEventListener("keydown", onKeydown);
  if (typeof document !== "undefined" && isModal.value && open.value) {
    document.body.style.overflow = previousOverflow;
  }
});

function flatten(nodes: VNode[]): VNode[] {
  return nodes.flatMap((node) =>
    node.type === Fragment && Array.isArray(node.children)
      ? flatten(node.children as VNode[])
      : [node],
  );
}

/**
 * 子项索引只能在 NavigationDrawer 里确定：展开 Fragment 后按声明顺序给每个
 * NavigationDrawerItem 注入 index。computed 在模板里才被求值，因此
 * `slots.default()` 仍处于渲染上下文中，依赖得以追踪。
 */
const items = computed<VNode[]>(() => {
  let index = 0;
  return flatten(slots.default?.() ?? []).map((node) =>
    node.type === NavigationDrawerItem ? cloneVNode(node, { index: index++ }) : node,
  );
});

/** 数组子节点的容器：函数式组件直接返回数组会被当成文本，必须包一层 Fragment。 */
const DrawerNodes = (props: { nodes: VNode[] }) => createVNode(Fragment, null, props.nodes);
</script>

<template>
  <Teleport v-if="isModal" to="body">
    <Transition
      enter-from-class="opacity-0"
      enter-active-class="transition-opacity duration-[250ms] ease-out"
      leave-to-class="opacity-0"
      leave-active-class="transition-opacity duration-200 ease-in"
    >
      <div
        v-if="open"
        aria-hidden="true"
        class="ds-navigation-drawer__scrim fixed inset-0 z-40 bg-ds-scrim"
        @click="close"
      />
    </Transition>

    <Transition
      enter-from-class="-translate-x-full"
      enter-active-class="transition-transform duration-[250ms] ease-out"
      leave-to-class="-translate-x-full"
      leave-active-class="transition-transform duration-200 ease-in"
    >
      <aside
        v-if="open"
        ref="panelRef"
        v-bind="$attrs"
        role="dialog"
        aria-modal="true"
        :aria-label="label"
        tabindex="-1"
        class="ds-navigation-drawer ds-navigation-drawer--modal fixed inset-y-0 left-0 z-50 flex w-90 max-w-full flex-col overflow-y-auto rounded-r-ds-lg bg-ds-surface font-ds shadow-xl focus-visible:outline-none"
      >
        <nav :aria-label="label" class="flex min-h-full flex-col px-3 py-3">
          <DrawerNodes :nodes="items" />
        </nav>
      </aside>
    </Transition>
  </Teleport>

  <nav
    v-else
    v-bind="$attrs"
    :aria-label="label"
    class="ds-navigation-drawer flex h-full w-90 max-w-full shrink-0 flex-col overflow-y-auto bg-ds-surface px-3 py-3 font-ds"
  >
    <DrawerNodes :nodes="items" />
  </nav>
</template>
