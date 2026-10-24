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
import NavigationItem from "./NavigationItem.vue";
import { navigationContextKey, type NavigationValue, type NavigationVariant } from "./context";

defineOptions({ inheritAttrs: false });

interface NavigationBarProps {
  /** `compact`：图标在上、文字在下；`medium`：图标与文字左右排列。 */
  variant?: NavigationVariant;
  /** 导航栏最大宽度，数字按 px 处理；超出部分居中留白。 */
  maxWidth?: string | number;
}

const props = withDefaults(defineProps<NavigationBarProps>(), {
  variant: "compact",
  maxWidth: undefined,
});

const model = defineModel<NavigationValue>("value", { default: 0 });

const slots = useSlots();

provide(navigationContextKey, { model, variant: toRef(props, "variant") });

const maxWidthStyle = computed(() => {
  if (props.maxWidth === undefined) return undefined;
  return {
    maxWidth: typeof props.maxWidth === "number" ? `${props.maxWidth}px` : props.maxWidth,
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
 * 子项索引只能在 NavigationBar 里确定：展开 Fragment 后按声明顺序给每个
 * NavigationItem 注入 index。computed 在模板里才被求值，因此 `slots.default()`
 * 仍处于渲染上下文中，依赖得以追踪。
 */
const items = computed<VNode[]>(() => {
  let index = 0;
  return flatten(slots.default?.() ?? []).map((node) =>
    node.type === NavigationItem ? cloneVNode(node, { index: index++ }) : node,
  );
});

/** 数组子节点的容器：函数式组件直接返回数组会被当成文本，必须包一层 Fragment。 */
const NavigationNodes = (props: { nodes: VNode[] }) => createVNode(Fragment, null, props.nodes);
</script>

<template>
  <nav
    v-bind="$attrs"
    class="ds-navigation-bar mx-auto flex w-full items-stretch bg-ds-surface font-ds"
    :class="variant === 'medium' ? 'px-2 py-2' : 'px-1 py-1'"
    :style="maxWidthStyle"
  >
    <NavigationNodes :nodes="items" />
  </nav>
</template>
