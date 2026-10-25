<script setup lang="ts">
import { computed, provide, useSlots } from "vue";
import {
  clampLevel,
  containerLevelKey,
  useContainerLevel,
  type ContainerLevel,
} from "../container/context";

defineOptions({ inheritAttrs: false });

type CardVariant = "elevated" | "filled" | "surface" | "outlined" | "plain";

interface CardProps {
  /** 表面样式：抬升、填充、表面色、描边或透明（只保留层级与圆角）。 */
  variant?: CardVariant;
  /** 标题，渲染在卡片最顶端；`title` 插槽优先。 */
  title?: string;
  /** 标题下方的副标题；`subtitle` 插槽优先。 */
  subtitle?: string;
  /** 手动指定层级 1–3；省略时由父容器自动推导。 */
  level?: ContainerLevel;
  /** 是否使用层级对应的内边距；日期选择器这类自带排版的内容传 `false`。 */
  padded?: boolean;
}

const props = withDefaults(defineProps<CardProps>(), {
  variant: "elevated",
  title: undefined,
  subtitle: undefined,
  level: undefined,
  padded: true,
});

const level = useContainerLevel(() => (props.level ? clampLevel(props.level) : undefined));
provide(containerLevelKey, level);

const slots = useSlots();

/** 头部只看插槽是否存在：`#title` 这类插槽即使内容为空也算提供了头部。 */
const hasHeader = computed(
  () =>
    Boolean(props.title || props.subtitle) ||
    Boolean(slots.title || slots.subtitle || slots["title-left"] || slots["title-right"]),
);

const hasFooter = computed(() => Boolean(slots["footer-left"] || slots["footer-right"]));

const radiusClasses: Record<ContainerLevel, string> = {
  1: "rounded-ds-xl",
  2: "rounded-ds-lg",
  3: "rounded-ds",
};

const paddingClasses: Record<ContainerLevel, string> = {
  1: "p-4",
  2: "p-3",
  3: "p-2",
};

const variantClasses: Record<CardVariant, string> = {
  elevated: "bg-ds-elevated shadow-[0_1px_2px_0_rgba(0,0,0,0.3),0_2px_6px_2px_rgba(0,0,0,0.15)]",
  filled: "bg-ds-surface-hover",
  surface: "bg-ds-surface",
  outlined: "border border-ds-line bg-ds-surface",
  plain: "bg-transparent",
};
</script>

<template>
  <div
    v-bind="$attrs"
    :class="[
      'ds-card box-border flex flex-col font-ds text-ds-fg',
      radiusClasses[level],
      variantClasses[variant],
      padded ? paddingClasses[level] : '',
    ]"
  >
    <header v-if="hasHeader" class="flex items-center gap-3">
      <div v-if="$slots['title-left']" class="flex shrink-0 items-center gap-1">
        <slot name="title-left" />
      </div>
      <div class="min-w-0 flex-1">
        <slot name="title">
          <div v-if="title" class="truncate text-base leading-6 font-medium text-ds-fg">
            {{ title }}
          </div>
        </slot>
        <slot name="subtitle">
          <div v-if="subtitle" class="mt-1 text-sm leading-5 text-ds-muted">{{ subtitle }}</div>
        </slot>
      </div>
      <div v-if="$slots['title-right']" class="flex shrink-0 items-center gap-1">
        <slot name="title-right" />
      </div>
    </header>

    <div :class="['flex min-h-0 flex-1 flex-col', hasHeader ? 'mt-3' : '']">
      <slot />
    </div>

    <footer v-if="hasFooter" class="mt-3 flex flex-wrap items-center gap-2 pt-3">
      <div v-if="$slots['footer-left']" class="flex flex-wrap items-center gap-2">
        <slot name="footer-left" />
      </div>
      <div
        v-if="$slots['footer-right']"
        class="ml-auto flex flex-wrap items-center justify-end gap-2"
      >
        <slot name="footer-right" />
      </div>
    </footer>
  </div>
</template>
