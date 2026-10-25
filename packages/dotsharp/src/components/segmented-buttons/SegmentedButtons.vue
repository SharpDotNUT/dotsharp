<script setup lang="ts">
import {
  cloneVNode,
  computed,
  createVNode,
  Fragment,
  provide,
  ref,
  useSlots,
  watch,
  type VNode,
} from "vue";
import SegmentedButton from "./SegmentedButton.vue";
import { segmentedContextKey, type SegmentedValue } from "./context";

defineOptions({ inheritAttrs: false });

const model = defineModel<SegmentedValue>("value", { default: 0 });

/** 当前获得焦点的子项；决定 roving tabindex，并驱动方向键的自动激活。 */
const focusValue = ref<SegmentedValue>(model.value);

function setFocus(value: SegmentedValue): void {
  focusValue.value = value;
}

provide(segmentedContextKey, { model, focusValue, setFocus });

const slots = useSlots();
const rootRef = ref<HTMLElement | null>(null);

watch(model, (value) => {
  focusValue.value = value;
});

function flatten(nodes: VNode[]): VNode[] {
  return nodes.flatMap((node) =>
    node.type === Fragment && Array.isArray(node.children)
      ? flatten(node.children as VNode[])
      : [node],
  );
}

/**
 * 子项索引只能在 SegmentedButtons 里确定：展开 Fragment 后按声明顺序给每个
 * SegmentedButton 注入 index。computed 在模板里才被求值，因此 `slots.default()`
 * 仍处于渲染上下文中，依赖得以追踪。
 */
const items = computed<VNode[]>(() => {
  let index = 0;
  return flatten(slots.default?.() ?? []).map((node) =>
    node.type === SegmentedButton ? cloneVNode(node, { index: index++ }) : node,
  );
});

/**
 * 数组子节点的容器：函数式组件直接返回数组会被当成文本，必须包一层 Fragment。
 */
const ButtonNodes = (props: { nodes: VNode[] }) => createVNode(Fragment, null, props.nodes);

/**
 * 分段按钮是一组切换按钮：方向键在可用子项之间移动焦点并立即选中，
 * 与单选组的行为一致（单选分段按钮不可取消选中）。
 */
function onKeydown(event: KeyboardEvent): void {
  if (event.defaultPrevented) return;
  if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;

  const root = rootRef.value;
  const buttons = root?.querySelectorAll<HTMLElement>(":scope > button:not([disabled])");
  if (!root || !buttons || buttons.length < 2) return;

  event.preventDefault();

  const rtl = getComputedStyle(root).direction === "rtl";
  const focused =
    document.activeElement instanceof HTMLElement
      ? document.activeElement
      : (event.target as HTMLElement | null);
  const current = focused ? Array.from(buttons).indexOf(focused) : -1;

  let nextIndex = 0;
  if (event.key === "End") nextIndex = buttons.length - 1;
  else if (event.key !== "Home") {
    const step = event.key === "ArrowRight" ? 1 : -1;
    const direction = rtl ? -step : step;
    nextIndex = current === -1 ? 0 : (current + direction + buttons.length) % buttons.length;
  }

  buttons[nextIndex]?.focus();
  if (focusValue.value !== model.value) model.value = focusValue.value;
}
</script>

<template>
  <div
    ref="rootRef"
    role="group"
    v-bind="$attrs"
    class="ds-segmented-buttons inline-flex overflow-hidden rounded-full border border-ds-outline font-ds"
    @keydown="onKeydown"
  >
    <ButtonNodes :nodes="items" />
  </div>
</template>
