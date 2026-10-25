<script setup lang="ts">
import { onBeforeUnmount, watch } from "vue";
import SnackbarSurface from "./SnackbarSurface.vue";
import { snackbarTransition } from "./transition";

defineOptions({ inheritAttrs: false });

interface SnackbarProps {
  /** 正文；默认插槽优先，用于需要换行或富文本的场景。 */
  text?: string;
  /** 右侧操作按钮的文案；`action` 插槽优先。 */
  action?: string;
  /** 是否显示关闭按钮。 */
  dismissible?: boolean;
  /** 自动关闭的毫秒数；`0` 表示只能由用户关闭。 */
  duration?: number;
  /** 关闭按钮的无障碍名称。 */
  closeLabel?: string;
}

const props = withDefaults(defineProps<SnackbarProps>(), {
  text: undefined,
  action: undefined,
  dismissible: false,
  duration: 5000,
  closeLabel: "Close",
});

/** 唯一的显示状态来源；组件自己计时，超时后把它置回 `false`。 */
const open = defineModel<boolean>("open", { default: false });

const emit = defineEmits<{ action: [] }>();

let timer: ReturnType<typeof setTimeout> | undefined;

function clearTimer(): void {
  if (timer === undefined) return;
  clearTimeout(timer);
  timer = undefined;
}

watch(
  [open, () => props.duration],
  ([value, duration]) => {
    clearTimer();
    if (!value || duration <= 0) return;
    timer = setTimeout(() => {
      timer = undefined;
      open.value = false;
    }, duration);
  },
  { immediate: true },
);

onBeforeUnmount(clearTimer);

function close(): void {
  open.value = false;
}

function onAction(): void {
  emit("action");
  close();
}
</script>

<template>
  <Teleport to="body">
    <Transition v-bind="snackbarTransition">
      <SnackbarSurface
        v-if="open"
        v-bind="$attrs"
        :text="text"
        :action="action"
        :dismissible="dismissible"
        :close-label="closeLabel"
        @action="onAction"
        @dismiss="close"
      >
        <slot />
        <template v-if="$slots.action" #action>
          <slot name="action" />
        </template>
      </SnackbarSurface>
    </Transition>
  </Teleport>
</template>
