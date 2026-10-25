<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, useSlots, watch } from "vue";

defineOptions({ inheritAttrs: false });

type AppBarVariant = "small" | "medium-flexible" | "large-flexible";

interface AppBarProps {
  /** 标题纯文本；存在默认插槽时被插槽覆盖。 */
  title?: string;
  /** `small` 单行；`medium-flexible` / `large-flexible` 的标题另起一行，字号逐级变大。 */
  variant?: AppBarVariant;
  /** 副标题纯文本（仅 flexible 变体使用）；存在 `subtitle` 插槽时被插槽覆盖。 */
  subtitle?: string;
  /** 脱离文档流，固定在视口顶部（`position: fixed`）。 */
  fixed?: boolean;
  /** 与 `fixed` 搭配：在文档流里输出一个等高占位元素，内容不会被抽走。 */
  placeholder?: boolean;
}

const props = withDefaults(defineProps<AppBarProps>(), {
  title: undefined,
  variant: "small",
  subtitle: undefined,
  fixed: false,
  placeholder: false,
});

const slots = useSlots();

const barRef = ref<HTMLElement | null>(null);

/** 实测高度；未挂载（含 SSR）时为 `null`，占位元素退回按 `variant` 估算的类名高度。 */
const barHeight = ref<number | null>(null);

let observer: ResizeObserver | null = null;

const showPlaceholder = computed(() => props.fixed && props.placeholder);

const isFlexible = computed(() => props.variant !== "small");

const hasSubtitle = computed(
  () => isFlexible.value && (props.subtitle !== undefined || !!slots.subtitle),
);

/** M3 flexible app bar：有副标题时高度再长一档。 */
const barHeightClass = computed(() => {
  if (props.variant === "medium-flexible") return hasSubtitle.value ? "min-h-[8.5rem]" : "min-h-28";
  if (props.variant === "large-flexible") return hasSubtitle.value ? "min-h-38" : "min-h-30";
  return "min-h-16";
});

const placeholderFallbackClass = computed(() => {
  if (props.variant === "medium-flexible") return hasSubtitle.value ? "h-[8.5rem]" : "h-28";
  if (props.variant === "large-flexible") return hasSubtitle.value ? "h-38" : "h-30";
  return "h-16";
});

const placeholderStyle = computed(() =>
  barHeight.value === null ? undefined : { height: `${barHeight.value}px` },
);

const titleClass = computed(() => [
  "block truncate leading-tight",
  props.variant === "large-flexible"
    ? "text-[2.25rem]"
    : props.variant === "medium-flexible"
      ? "text-[1.75rem]"
      : "text-[1.375rem]",
]);

const subtitleClass = computed(() => [
  "block truncate leading-tight text-ds-muted",
  props.variant === "large-flexible" ? "text-base" : "text-sm",
]);

function disconnect(): void {
  observer?.disconnect();
  observer = null;
}

/**
 * 占位元素的高度只能实测：标题区可以放任意插槽内容，`variant` 的 min-height 只是下限。
 * ResizeObserver 在 observe 时会先回调一次，因此首帧即拿到高度。
 */
function observe(): void {
  disconnect();
  const el = barRef.value;
  if (!showPlaceholder.value || !el || typeof ResizeObserver === "undefined") return;

  observer = new ResizeObserver(() => {
    barHeight.value = Math.round(el.getBoundingClientRect().height);
  });
  observer.observe(el);
}

onMounted(observe);

watch(showPlaceholder, (needed) => {
  if (!needed) barHeight.value = null;
  observe();
});

onBeforeUnmount(disconnect);
</script>

<template>
  <div
    v-if="showPlaceholder"
    aria-hidden="true"
    class="ds-app-bar__placeholder w-full"
    :class="placeholderFallbackClass"
    :style="placeholderStyle"
  />
  <header
    ref="barRef"
    v-bind="$attrs"
    class="ds-app-bar flex w-full flex-col bg-ds-surface px-4 font-ds text-ds-fg"
    :class="[fixed ? 'fixed inset-x-0 top-0 z-40' : 'relative', barHeightClass]"
  >
    <template v-if="!isFlexible">
      <div class="flex min-h-16 items-center gap-2">
        <div v-if="$slots.left" class="flex shrink-0 items-center gap-1 text-[1.5rem]">
          <slot name="left" />
        </div>
        <div class="min-w-0 flex-1">
          <slot>
            <span :class="titleClass">{{ title }}</span>
          </slot>
        </div>
        <div v-if="$slots.right" class="flex shrink-0 items-center gap-1 text-[1.5rem]">
          <slot name="right" />
        </div>
      </div>
    </template>

    <template v-else>
      <div class="flex min-h-16 shrink-0 items-center gap-2">
        <div v-if="$slots.left" class="flex shrink-0 items-center gap-1 text-[1.5rem]">
          <slot name="left" />
        </div>
        <div class="flex-1" />
        <div v-if="$slots.right" class="flex shrink-0 items-center gap-1 text-[1.5rem]">
          <slot name="right" />
        </div>
      </div>
      <div class="flex min-w-0 flex-1 flex-col justify-end pb-4">
        <slot>
          <span :class="titleClass">{{ title }}</span>
        </slot>
        <template v-if="hasSubtitle">
          <slot name="subtitle">
            <span :class="subtitleClass">{{ subtitle }}</span>
          </slot>
        </template>
      </div>
    </template>
  </header>
</template>
