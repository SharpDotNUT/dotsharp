<script setup lang="ts">
import {
  cloneVNode,
  computed,
  createVNode,
  Fragment,
  provide,
  toRef,
  useSlots,
  type VNode,
} from "vue";
import type { IconifyIcon } from "@iconify/vue";
import Icon from "../icon/Icon.vue";
import NavigationRailItem from "./NavigationRailItem.vue";
import {
  navigationRailContextKey,
  type NavigationRailValue,
  type NavigationRailVariant,
} from "./context";

defineOptions({ inheritAttrs: false });

interface NavigationRailProps {
  /** `static`：图标+文字常显、不可展开；`expandable`：折叠只留图标，展开时文字出现在右侧。 */
  variant?: NavigationRailVariant;
  /** 仅 `expandable`：展开时在最近的定位容器内覆盖内容，而不是挤开内容。 */
  overlay?: boolean;
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
  variant: "static",
  overlay: false,
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
  variant: toRef(props, "variant"),
});

const isExpandable = computed(() => props.variant === "expandable");
const isOverlay = computed(() => isExpandable.value && props.overlay && expanded.value);

/** 静态变体的菜单按钮不改变自身宽度，只通知使用方（例如打开 modal drawer）。 */
function onMenuClick(): void {
  if (isExpandable.value) expanded.value = !expanded.value;
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
  <nav
    v-bind="$attrs"
    :aria-label="label"
    :class="[
      'ds-navigation-rail flex h-full flex-col bg-ds-surface font-ds',
      isOverlay
        ? 'absolute inset-y-0 left-0 z-20 w-64 overflow-y-auto rounded-r-ds-lg shadow-xl'
        : [
            'relative shrink-0 overflow-y-auto transition-[width] duration-200 ease-out',
            expanded && isExpandable ? 'w-64' : 'w-20',
          ],
    ]"
  >
    <div v-if="menu && (menuIcon || $slots.menu)" class="flex w-20 shrink-0 justify-center pt-3">
      <button
        type="button"
        :aria-label="menuLabel"
        :aria-expanded="isExpandable ? expanded : undefined"
        class="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent text-ds-muted transition-colors hover:bg-ds-surface-hover hover:text-ds-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ds-focus"
        @click="onMenuClick"
      >
        <slot name="menu" :expanded="expanded">
          <Icon
            v-if="menuIcon"
            :icon="expanded && isExpandable && menuExpandedIcon ? menuExpandedIcon : menuIcon"
            size="24"
          />
        </slot>
      </button>
    </div>

    <div class="flex min-h-0 w-full flex-1 flex-col gap-1 overflow-y-auto px-2 py-2">
      <RailNodes :nodes="items" />
    </div>
  </nav>
</template>
