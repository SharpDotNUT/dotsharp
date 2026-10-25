<script setup lang="ts">
import {
  cloneVNode,
  computed,
  createVNode,
  Fragment,
  provide,
  ref,
  toRef,
  useId,
  useSlots,
  type VNode,
} from "vue";
import type { IconifyIcon } from "@iconify/vue";
import Icon from "../icon/Icon.vue";
import NavigationRailItem from "./NavigationRailItem.vue";
import { useOverlayPanel } from "../../composables/useOverlayPanel";
import {
  navigationRailContextKey,
  type NavigationRailPresentation,
  type NavigationRailValue,
} from "./context";

defineOptions({ inheritAttrs: false });

/** M3 Expressive 展开态宽度区间（dp ≈ px）。 */
const MIN_EXPANDED_WIDTH = 220;
const MAX_EXPANDED_WIDTH = 360;

interface NavigationRailProps {
  /** 允许由菜单按钮展开：折叠 96px，展开 220–360px。 */
  expandable?: boolean;
  /** `standard`：展开时挤开内容；`modal`：展开时覆盖最近定位容器内的内容并带遮罩。 */
  presentation?: NavigationRailPresentation;
  /** 展开态宽度，夹在 220–360px 之间。 */
  expandedWidth?: number;
  /** 是否显示内置的菜单按钮；没有图标也没有 `menu` 插槽时不渲染。 */
  menu?: boolean;
  /** 内置菜单按钮的无障碍名称。 */
  menuLabel?: string;
  /** 折叠状态下的菜单图标数据。 */
  menuIcon?: IconifyIcon | string;
  /** 展开状态下的菜单图标数据，省略时沿用 `menuIcon`。 */
  menuExpandedIcon?: IconifyIcon | string;
  /** 无障碍名称，写入 `<nav>` 的 `aria-label`。 */
  label?: string;
}

const props = withDefaults(defineProps<NavigationRailProps>(), {
  expandable: false,
  presentation: "standard",
  expandedWidth: 256,
  menu: true,
  menuLabel: "Toggle navigation",
  menuIcon: undefined,
  menuExpandedIcon: undefined,
  label: undefined,
});

const emit = defineEmits<{ menu: [] }>();

const model = defineModel<NavigationRailValue>("value", { default: 0 });
const expanded = defineModel<boolean>("expanded", { default: false });

const slots = useSlots();

provide(navigationRailContextKey, {
  model,
  expanded,
  expandable: toRef(props, "expandable"),
});

const listId = useId();
const railRef = ref<HTMLElement | null>(null);

const railWidth = computed(() =>
  Math.min(Math.max(props.expandedWidth ?? 256, MIN_EXPANDED_WIDTH), MAX_EXPANDED_WIDTH),
);

const isExpanded = computed(() => props.expandable && expanded.value);
const isModal = computed(
  () => props.expandable && props.presentation === "modal" && expanded.value,
);

const railStyle = computed(() =>
  isExpanded.value ? { width: `${railWidth.value}px` } : undefined,
);

function close(): void {
  expanded.value = false;
}

useOverlayPanel({
  active: isModal,
  panel: railRef,
  initialFocus: '[aria-current="page"]',
  onDismiss: close,
});

/** 不可展开时菜单按钮不改变宽度，只通知使用方（例如打开 modal drawer）。 */
function onMenuClick(): void {
  if (props.expandable) expanded.value = !expanded.value;
  else emit("menu");
}

function flatten(nodes: VNode[]): VNode[] {
  return nodes.flatMap((node) =>
    node.type === Fragment && Array.isArray(node.children)
      ? flatten(node.children as VNode[])
      : [node],
  );
}

/**
 * 子项索引只能在 NavigationRail 里确定：展开 Fragment 后按声明顺序给每个
 * NavigationRailItem 注入 index。computed 在模板里才被求值，因此
 * `slots.default()` 仍处于渲染上下文中，依赖得以追踪。
 */
const items = computed<VNode[]>(() => {
  let index = 0;
  return flatten(slots.default?.() ?? []).map((node) =>
    node.type === NavigationRailItem ? cloneVNode(node, { index: index++ }) : node,
  );
});

/** 数组子节点的容器：函数式组件直接返回数组会被当成文本，必须包一层 Fragment。 */
const RailNodes = (props: { nodes: VNode[] }) => createVNode(Fragment, null, props.nodes);
</script>

<template>
  <Transition
    enter-from-class="opacity-0"
    enter-active-class="transition-opacity duration-200 ease-out"
    leave-to-class="opacity-0"
    leave-active-class="transition-opacity duration-150 ease-in"
  >
    <div
      v-if="isModal"
      aria-hidden="true"
      class="ds-navigation-rail__scrim absolute inset-0 z-10 bg-ds-scrim"
      @click="close"
    />
  </Transition>

  <nav
    ref="railRef"
    v-bind="$attrs"
    :aria-label="label"
    :role="isModal ? 'dialog' : undefined"
    :aria-modal="isModal ? 'true' : undefined"
    :tabindex="isModal ? -1 : undefined"
    :style="railStyle"
    :class="[
      'ds-navigation-rail flex h-full flex-col bg-ds-surface font-ds',
      isModal
        ? 'absolute inset-y-0 left-0 z-20 overflow-y-auto rounded-r-ds-lg shadow-xl'
        : 'relative shrink-0 transition-[width] duration-200 ease-out',
      isExpanded ? undefined : 'w-24',
    ]"
  >
    <div v-if="menu && (menuIcon || $slots.menu)" class="flex w-24 shrink-0 justify-center pt-3">
      <button
        type="button"
        :aria-label="menuLabel"
        :aria-expanded="expandable ? expanded : undefined"
        :aria-controls="expandable ? listId : undefined"
        class="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent text-ds-muted transition-colors hover:bg-ds-surface-hover hover:text-ds-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ds-focus"
        @click="onMenuClick"
      >
        <slot name="menu" :expanded="expanded">
          <Icon
            v-if="menuIcon"
            :icon="isExpanded && menuExpandedIcon ? menuExpandedIcon : menuIcon"
            size="24"
          />
        </slot>
      </button>
    </div>

    <div :id="listId" class="flex min-h-0 w-full flex-1 flex-col gap-1 overflow-y-auto px-2 py-1">
      <RailNodes :nodes="items" />
    </div>
  </nav>
</template>
