<script setup lang="ts">
import { provide } from "vue";
import { clampLevel, containerLevelKey, useContainerLevel, type ContainerLevel } from "./context";

defineOptions({ inheritAttrs: false });

interface ContainerProps {
  /** 手动指定层级 1–3；省略时由父容器自动推导（顶层为 1）。 */
  level?: ContainerLevel;
  /** 根元素标签，默认 `div`。 */
  as?: string;
  /** 是否使用层级对应的内边距；`false` 时完全交给使用方排版。 */
  padded?: boolean;
}

const props = withDefaults(defineProps<ContainerProps>(), {
  level: undefined,
  as: "div",
  padded: true,
});

const level = useContainerLevel(() => (props.level ? clampLevel(props.level) : undefined));
provide(containerLevelKey, level);

const levelClasses: Record<ContainerLevel, string> = {
  1: "rounded-ds-xl bg-ds-surface",
  2: "rounded-ds-lg bg-ds-elevated",
  3: "rounded-ds bg-ds-surface-hover",
};

const paddingClasses: Record<ContainerLevel, string> = {
  1: "p-4",
  2: "p-3",
  3: "p-2",
};
</script>

<template>
  <component
    :is="as"
    v-bind="$attrs"
    :class="[
      'ds-container block font-ds text-ds-fg',
      levelClasses[level],
      padded ? paddingClasses[level] : '',
    ]"
  >
    <slot />
  </component>
</template>
