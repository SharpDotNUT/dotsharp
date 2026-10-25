<script setup lang="ts">
import { computed } from "vue";
import type { DividerInset } from "./types";

defineOptions({ inheritAttrs: false });

interface DividerProps {
  /** 垂直分隔线；需要父级是 flex 容器，或由使用方补一个高度。 */
  vertical?: boolean;
  /** 两端留白：`start` / `end` 对应水平线的左 / 右、垂直线的上 / 下。 */
  inset?: DividerInset;
}

const props = withDefaults(defineProps<DividerProps>(), {
  vertical: false,
  inset: "none",
});

const horizontalInset: Record<DividerInset, string> = {
  none: "",
  start: "ml-4",
  end: "mr-4",
  both: "mx-4",
};

const verticalInset: Record<DividerInset, string> = {
  none: "",
  start: "mt-4",
  end: "mb-4",
  both: "my-4",
};

const insetClass = computed(() => (props.vertical ? verticalInset : horizontalInset)[props.inset]);

const rootClass = computed(() =>
  props.vertical
    ? "ds-divider m-0 min-h-4 w-px self-stretch border-0 bg-ds-line"
    : "ds-divider m-0 h-px w-auto self-stretch border-0 bg-ds-line",
);
</script>

<template>
  <hr
    v-if="!vertical"
    v-bind="$attrs"
    aria-orientation="horizontal"
    :class="[rootClass, insetClass]"
  />
  <div
    v-else
    v-bind="$attrs"
    role="separator"
    aria-orientation="vertical"
    :class="[rootClass, insetClass]"
  />
</template>
