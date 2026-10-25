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
  shallowRef,
  toRef,
  useSlots,
  watch,
  type VNode,
} from "vue";
import Tab from "./Tab.vue";
import { tabsContextKey, type TabsValue } from "./context";

defineOptions({ inheritAttrs: false });

interface TabsProps {
  variant?: boolean;
}

const props = withDefaults(defineProps<TabsProps>(), {
  variant: false,
});

const model = defineModel<TabsValue>("value", { default: 0 });

const slots = useSlots();

const listRef = ref<HTMLElement | null>(null);

/** 指示条的几何尺寸（相对 tablist），由 Tabs 统一渲染，才能在两枚 Tab 之间平滑过渡。 */
const indicator = shallowRef({ left: 0, width: 0, visible: false });
const animated = ref(false);

const elements = new Map<TabsValue, HTMLElement>();

let frame = 0;

function scheduleMeasure(): void {
  if (typeof window === "undefined") return;
  if (frame) cancelAnimationFrame(frame);
  frame = requestAnimationFrame(() => {
    frame = 0;
    measure();
  });
}

/** 默认样式是居中的短胶囊（宽度不占满 Tab），变体样式是整条下划线。 */
function indicatorGeometry(left: number, tabWidth: number): { left: number; width: number } {
  if (props.variant) return { left, width: tabWidth };

  const pill = Math.max(Math.min(40, tabWidth - 24), 16);
  return { left: left + (tabWidth - pill) / 2, width: pill };
}

function measure(): void {
  const list = listRef.value;
  const el = elements.get(model.value);

  if (!list || !el) {
    indicator.value = { left: 0, width: 0, visible: false };
    return;
  }

  const geometry = indicatorGeometry(el.offsetLeft, el.offsetWidth);
  indicator.value = {
    ...geometry,
    visible: el.offsetWidth > 0,
  };

  // 首次定位不播放动画，否则指示条会在挂载时从 0 宽度滑入。
  if (!animated.value) {
    requestAnimationFrame(() => {
      animated.value = true;
    });
  }
}

function register(value: TabsValue, el: HTMLElement | null): void {
  if (el) elements.set(value, el);
  else elements.delete(value);
  scheduleMeasure();
}

provide(tabsContextKey, { model, variant: toRef(props, "variant"), register });

watch([() => model.value, () => props.variant], () => nextTick(measure));

function flatten(nodes: VNode[]): VNode[] {
  return nodes.flatMap((node) =>
    node.type === Fragment && Array.isArray(node.children)
      ? flatten(node.children as VNode[])
      : [node],
  );
}

/**
 * 子项索引只能在 Tabs 里确定：展开 Fragment 后按声明顺序给每个 Tab 注入 index。
 * computed 在模板里才被求值，因此 `slots.default()` 仍处于渲染上下文中，依赖得以追踪。
 */
const items = computed<VNode[]>(() => {
  let index = 0;
  return flatten(slots.default?.() ?? []).map((node) =>
    node.type === Tab ? cloneVNode(node, { index: index++ }) : node,
  );
});

/**
 * 数组子节点的容器：函数式组件直接返回数组会被当成文本，必须包一层 Fragment。
 */
const TabNodes = (props: { nodes: VNode[] }) => createVNode(Fragment, null, props.nodes);

let observer: ResizeObserver | null = null;

onMounted(() => {
  measure();

  if (typeof ResizeObserver !== "undefined" && listRef.value) {
    observer = new ResizeObserver(scheduleMeasure);
    observer.observe(listRef.value);
  }
});

onBeforeUnmount(() => {
  observer?.disconnect();
  observer = null;
  if (frame) cancelAnimationFrame(frame);
});
</script>

<template>
  <div
    ref="listRef"
    role="tablist"
    v-bind="$attrs"
    class="ds-tabs relative flex items-stretch overflow-hidden border-b border-ds-line font-ds"
  >
    <TabNodes :nodes="items" />
    <span
      aria-hidden="true"
      class="ds-tabs__indicator pointer-events-none absolute left-0 bg-ds-primary-strong"
      :class="[
        variant ? 'bottom-0 h-0.5' : '-bottom-1 h-2 rounded-full',
        animated ? 'transition-[transform,width,opacity] duration-200 ease-out' : 'transition-none',
        indicator.visible ? 'opacity-100' : 'opacity-0',
      ]"
      :style="{ width: `${indicator.width}px`, transform: `translateX(${indicator.left}px)` }"
    />
  </div>
</template>
