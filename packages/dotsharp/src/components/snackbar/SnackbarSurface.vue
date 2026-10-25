<script setup lang="ts">
import closeIcon from "@iconify-icons/material-symbols/close";
import Icon from "../icon/Icon.vue";

defineOptions({ inheritAttrs: false });

interface SnackbarSurfaceProps {
  /** 正文；默认插槽优先。 */
  text?: string;
  /** 右侧操作按钮的文案；`action` 插槽优先。 */
  action?: string;
  /** 是否显示关闭按钮。 */
  dismissible?: boolean;
  /** 关闭按钮的无障碍名称。 */
  closeLabel?: string;
}

withDefaults(defineProps<SnackbarSurfaceProps>(), {
  text: undefined,
  action: undefined,
  dismissible: false,
  closeLabel: "Close",
});

defineEmits<{ action: []; dismiss: [] }>();
</script>

<template>
  <!--
    根元素是不带动画的居中容器，方便进出场动画整体平移；
    真正的消息条是里面的卡片，颜色用「反色表面」：浅色主题里是深色条，深色主题里反过来。
  -->
  <div
    class="ds-snackbar pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center px-4 font-ds"
  >
    <div
      v-bind="$attrs"
      role="status"
      aria-atomic="true"
      class="ds-snackbar__surface pointer-events-auto flex min-h-12 w-full max-w-[35rem] items-center gap-1 rounded-ds-sm bg-ds-fg py-2 pr-2 pl-4 text-sm leading-5 text-ds-bg shadow-ds-3 sm:w-fit sm:min-w-[21.5rem]"
    >
      <div class="min-w-0 flex-1 py-2">
        <slot>{{ text }}</slot>
      </div>
      <button
        v-if="action || $slots.action"
        type="button"
        class="ds-snackbar__action inline-flex h-10 shrink-0 cursor-pointer items-center rounded-ds-sm border-0 bg-transparent px-3 text-sm leading-5 font-medium text-ds-primary transition-colors hover:bg-ds-bg/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ds-bg/60"
        @click="$emit('action')"
      >
        <slot name="action">{{ action }}</slot>
      </button>
      <button
        v-if="dismissible"
        type="button"
        :aria-label="closeLabel"
        class="ds-snackbar__dismiss inline-flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent text-[1.25rem] text-ds-bg/70 transition-colors hover:bg-ds-bg/10 hover:text-ds-bg focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ds-bg/60"
        @click="$emit('dismiss')"
      >
        <Icon :icon="closeIcon" />
      </button>
    </div>
  </div>
</template>
