<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";

defineOptions({ inheritAttrs: false });

type AppBarVariant = "small" | "medium" | "large";

interface AppBarProps {
  /** 标题纯文本；存在默认插槽时被插槽覆盖。 */
  title?: string;
  /** `small` 单行；`medium` / `large` 的标题另起一行，字号逐级变大。 */
  variant?: AppBarVariant;
  /** 脱离文档流，固定在视口顶部（`position: fixed`）。 */
  fixed?: boolean;
  /** 与 `fixed` 搭配：在文档流里输出一个等高占位元素，内容不会被抽走。 */
  placeholder?: boolean;
}

const props = withDefaults(defineProps<AppBarProps>(), {
  title: undefined,
  variant: "small",
  fixed: false,
  placeholder: false,
});

const barRef = ref<HTMLElement | null>(null);

/** 实测高度；未挂载（含 SSR）时为 `null`，占位元素退回按 `variant` 估算的类名高度。 */
const barHeight = ref<number | null>(null);

let observer: ResizeObserver | null = null;

const showPlaceholder = computed(() => props.fixed && props.placeholder);

const placeholderFallbackClass = computed(() =>
  props.variant === "small" ? "h-16" : props.variant === "medium" ? "h-28" : "h-40",
);

const placeholderStyle = computed(() =>
  barHeight.value === null ? undefined : { height: `${barHeight.value}px` },
);

const titleClass = computed(() => [
  "block truncate leading-tight",
  props.variant === "small"
    ? "text-[1.375rem]"
    : props.variant === "medium"
      ? "text-[1.75rem]"
      : "text-[2rem]",
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
    :class="[
      fixed ? 'fixed inset-x-0 top-0 z-40' : 'relative',
      variant === 'small' ? 'min-h-16' : variant === 'medium' ? 'min-h-28' : 'min-h-40',
    ]"
  >
    <template v-if="variant === 'small'">
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
      <div
        class="flex min-w-0 flex-1 flex-col justify-end"
        :class="variant === 'medium' ? 'pb-4' : 'pb-6'"
      >
        <slot>
          <span :class="titleClass">{{ title }}</span>
        </slot>
      </div>
    </template>
  </header>
</template>
