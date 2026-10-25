<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, useAttrs, useId, useSlots, watch } from "vue";
import type { IconifyIcon } from "@iconify/vue";
import closeIcon from "@iconify-icons/material-symbols/close";
import Card from "../card/Card.vue";
import Icon from "../icon/Icon.vue";
import IconButton from "../icon-button/IconButton.vue";
import { useBodyScrollLock } from "../../composables/useBodyScrollLock";

defineOptions({ inheritAttrs: false });

type DialogVariant = "basic" | "fullscreen";

interface DialogProps {
  /** 标题；存在标题时同时作为对话框的无障碍名称。 */
  title?: string;
  /** `basic`：视口居中的卡片；`fullscreen`：铺满视口的全屏对话框。 */
  variant?: DialogVariant;
  /** 标题上方的图标，与 `Icon` 的 `icon` 同源（仅 `basic` 使用）。 */
  icon?: IconifyIcon | string;
  /** 为 `false` 时点击遮罩与按 Escape 都不关闭，只能由操作按钮关闭。 */
  dismissible?: boolean;
  /** 全屏对话框关闭按钮的无障碍名称。 */
  closeLabel?: string;
}

const props = withDefaults(defineProps<DialogProps>(), {
  title: undefined,
  variant: "basic",
  icon: undefined,
  dismissible: true,
  closeLabel: "Close",
});

const open = defineModel<boolean>("open", { default: false });

const attrs = useAttrs();
const slots = useSlots();
const dialogRef = ref<HTMLDialogElement | null>(null);
const visible = ref(false);
const titleId = useId();

const isFullscreen = computed(() => props.variant === "fullscreen");
const hasIcon = computed(() => Boolean(props.icon || slots.icon));
const hasHeader = computed(() => Boolean(props.title) || hasIcon.value);

/** `class` / `style` 属于面板；其余属性（`aria-*`、事件）落到原生 `<dialog>` 上。 */
function panelAttrs(): Record<string, unknown> {
  return { class: attrs.class, style: attrs.style };
}

function dialogAttrs(): Record<string, unknown> {
  const rest: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(attrs)) {
    if (key !== "class" && key !== "style") rest[key] = value;
  }
  return rest;
}

/** 面板本体是一个 `Card`：圆角、表面色与头部 / 底部结构都由它提供。 */
const panelClasses = computed(() =>
  isFullscreen.value
    ? "h-full w-full"
    : "m-auto h-fit max-h-[calc(100dvh-3rem)] w-[calc(100%-3rem)] max-w-[35rem] overflow-hidden p-6 shadow-xl",
);

const panelEnterFrom = computed(() =>
  isFullscreen.value ? "translate-y-full" : "opacity-0 scale-95",
);
const panelEnterActive = computed(() =>
  isFullscreen.value
    ? "transition-transform duration-[250ms] ease-out"
    : "transition-[opacity,scale] duration-200 ease-out",
);
const panelLeaveTo = computed(() =>
  isFullscreen.value ? "translate-y-full" : "opacity-0 scale-95",
);
const panelLeaveActive = computed(() =>
  isFullscreen.value
    ? "transition-transform duration-200 ease-in"
    : "transition-[opacity,scale] duration-150 ease-in",
);

function close(): void {
  open.value = false;
}

function dismiss(): void {
  if (props.dismissible) close();
}

/** 原生 `showModal()` 提供模态语义：置顶图层、焦点陷阱、背景不可交互。 */
function showModal(): void {
  const el = dialogRef.value;
  if (el && !el.open) el.showModal();
}

watch(
  open,
  (value) => {
    visible.value = value;
    if (value) showModal();
  },
  { immediate: true, flush: "post" },
);

onMounted(() => {
  if (open.value) showModal();
});

/** Escape：始终拦住原生的立即关闭，让面板的离场动画播完再真正 `close()`。 */
function onCancel(): void {
  if (props.dismissible) close();
}

function onBackdropClick(event: MouseEvent): void {
  if (!isFullscreen.value && event.target === dialogRef.value) dismiss();
}

/** 面板离场动画结束后才关闭原生对话框。 */
function onAfterLeave(): void {
  if (!open.value) dialogRef.value?.close();
}

function onNativeClose(): void {
  if (open.value) open.value = false;
}

useBodyScrollLock(open);

onBeforeUnmount(() => {
  if (dialogRef.value?.open) dialogRef.value.close();
});
</script>

<template>
  <Teleport to="body">
    <dialog
      ref="dialogRef"
      v-bind="dialogAttrs()"
      :aria-labelledby="title ? titleId : undefined"
      :class="[
        'ds-dialog__root m-0 h-full max-h-none w-full max-w-none border-0 bg-transparent p-0',
        isFullscreen ? 'backdrop:bg-transparent' : 'backdrop:bg-ds-scrim',
      ]"
      @cancel.prevent="onCancel"
      @close="onNativeClose"
      @click="onBackdropClick"
    >
      <Transition
        appear
        :enter-from-class="panelEnterFrom"
        :enter-active-class="panelEnterActive"
        :leave-to-class="panelLeaveTo"
        :leave-active-class="panelLeaveActive"
        @after-leave="onAfterLeave"
      >
        <Card
          v-if="visible && isFullscreen"
          v-bind="panelAttrs()"
          variant="surface"
          :level="1"
          :class="['ds-dialog absolute inset-0 z-10', panelClasses]"
        >
          <template #title-left>
            <IconButton :icon="closeIcon" :label="closeLabel" @click="close" />
          </template>
          <template v-if="title" #title>
            <h2 :id="titleId" class="truncate text-xl leading-7 font-normal text-ds-fg">
              {{ title }}
            </h2>
          </template>
          <template v-if="$slots['title-right']" #title-right>
            <slot name="title-right" />
          </template>
          <div class="min-h-0 flex-1 overflow-y-auto">
            <slot />
          </div>
        </Card>

        <Card
          v-else-if="visible"
          v-bind="panelAttrs()"
          variant="surface"
          :level="1"
          :padded="false"
          :class="['ds-dialog absolute inset-0 z-10', panelClasses]"
        >
          <template v-if="hasHeader" #title>
            <div :class="hasIcon ? 'flex flex-col items-center gap-2' : ''">
              <slot v-if="hasIcon" name="icon">
                <Icon v-if="icon" :icon="icon" size="24" class="text-ds-muted" />
              </slot>
              <h2 v-if="title" :id="titleId" class="text-2xl leading-8 font-normal text-ds-fg">
                {{ title }}
              </h2>
            </div>
          </template>
          <template v-if="$slots['footer-left']" #footer-left>
            <slot name="footer-left" />
          </template>
          <template v-if="$slots['footer-right']" #footer-right>
            <slot name="footer-right" />
          </template>
          <div class="min-h-0 flex-1 overflow-y-auto text-sm leading-5 text-ds-muted">
            <slot />
          </div>
        </Card>
      </Transition>
    </dialog>
  </Teleport>
</template>
