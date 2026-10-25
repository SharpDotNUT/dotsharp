<script setup lang="ts">
import { computed, provide } from "vue";
import {
  clampLevel,
  containerLevelKey,
  useContainerLevel,
  type ContainerLevel,
} from "../container/context";

defineOptions({ inheritAttrs: false });

type CardVariant = "elevated" | "filled" | "outlined" | "plain";

interface CardProps {
  /** 表面样式：抬升、填充、描边或透明（只保留层级与圆角）。 */
  variant?: CardVariant;
  /** 卡片标题，渲染在 header 区域。 */
  title?: string;
  /** 标题下方的补充说明。 */
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
  outlined: "border border-ds-line bg-ds-surface",
  plain: "bg-transparent",
};

const hasHeader = computed(() => Boolean(props.title || props.subtitle));
</script>

<template>
  <div
    v-bind="$attrs"
    :class="[
      'ds-card font-ds text-ds-fg',
      radiusClasses[level],
      variantClasses[variant],
      padded ? paddingClasses[level] : '',
    ]"
  >
    <header v-if="hasHeader || $slots.header || $slots.actions" class="flex items-start gap-3">
      <div class="min-w-0 flex-1">
        <slot name="header">
          <h3 v-if="title" class="truncate text-base leading-6 font-medium text-ds-fg">
            {{ title }}
          </h3>
          <p v-if="subtitle" class="mt-1 text-sm leading-5 text-ds-muted">{{ subtitle }}</p>
        </slot>
      </div>
      <div v-if="$slots.actions" class="flex shrink-0 items-center gap-1">
        <slot name="actions" />
      </div>
    </header>

    <div :class="hasHeader || $slots.header || $slots.actions ? 'mt-3' : ''">
      <slot />
    </div>

    <footer v-if="$slots.footer" class="mt-3 border-t border-ds-line pt-3">
      <slot name="footer" />
    </footer>
  </div>
</template>
