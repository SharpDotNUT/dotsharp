<script setup lang="ts">
import { cloneVNode, computed, createVNode, Fragment, provide, useSlots, type VNode } from "vue";
import ButtonGroupItem from "./ButtonGroupItem.vue";
import {
  buttonGroupContextKey,
  type ButtonGroupSelection,
  type ButtonGroupShape,
  type ButtonGroupValue,
} from "./context";
import type { ButtonSize, ButtonVariant } from "../button/shared";

defineOptions({ inheritAttrs: false });

interface ButtonGroupProps {
  /** 省略即纯按钮组：子项只作普通按钮，不维护选中态。 */
  selection?: ButtonGroupSelection;
  shape?: ButtonGroupShape;
  /** 子项默认层级；子项自己的 `variant` 优先。 */
  variant?: ButtonVariant;
  /** 子项默认尺寸；子项自己的 `size` 优先。 */
  size?: ButtonSize;
}

const props = withDefaults(defineProps<ButtonGroupProps>(), {
  selection: undefined,
  shape: "standard",
  variant: "tonal",
  size: "md",
});

const model = defineModel<ButtonGroupValue | ButtonGroupValue[] | undefined>("value");

const selectedValues = computed<ButtonGroupValue[]>(() => {
  const value = model.value;
  if (Array.isArray(value)) return value;
  return value === undefined ? [] : [value];
});

function isSelected(value: ButtonGroupValue): boolean {
  return selectedValues.value.includes(value);
}

function toggle(value: ButtonGroupValue): void {
  if (props.selection === "multiple") {
    model.value = isSelected(value)
      ? selectedValues.value.filter((item) => item !== value)
      : [...selectedValues.value, value];
    return;
  }
  if (props.selection === "single") {
    // 单选组允许再次点击取消：按钮组是「筛选」语义，不是必须有一项的分段控件。
    model.value = isSelected(value) ? undefined : value;
  }
}

provide(buttonGroupContextKey, {
  get selection() {
    return props.selection;
  },
  get shape() {
    return props.shape;
  },
  get variant() {
    return props.variant;
  },
  get size() {
    return props.size;
  },
  isSelected,
  toggle,
});

const slots = useSlots();

function flatten(nodes: VNode[]): VNode[] {
  return nodes.flatMap((node) =>
    node.type === Fragment && Array.isArray(node.children)
      ? flatten(node.children as VNode[])
      : [node],
  );
}

/**
 * 子项索引只能在 ButtonGroup 里确定：展开 Fragment 后按声明顺序给每个
 * ButtonGroupItem 注入 index / last，用于 connected 形状的圆角与默认标识。
 */
const items = computed<VNode[]>(() => {
  const nodes = flatten(slots.default?.() ?? []);
  const total = nodes.filter((node) => node.type === ButtonGroupItem).length;
  let index = 0;
  return nodes.map((node) => {
    if (node.type !== ButtonGroupItem) return node;
    const current = index++;
    return cloneVNode(node, { index: current, last: current === total - 1 });
  });
});

/**
 * 数组子节点的容器：函数式组件直接返回数组会被当成文本，必须包一层 Fragment。
 */
const ItemNodes = (props: { nodes: VNode[] }) => createVNode(Fragment, null, props.nodes);
</script>

<template>
  <div
    role="group"
    v-bind="$attrs"
    class="ds-button-group inline-flex items-center"
    :class="shape === 'connected' ? 'gap-0.5' : 'gap-2'"
  >
    <ItemNodes :nodes="items" />
  </div>
</template>
