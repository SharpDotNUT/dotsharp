<script setup lang="ts">
import { computed, ref, useId } from "vue";
import type { IconifyIcon } from "@iconify/vue";
import closeIcon from "@iconify-icons/material-symbols/close";
import Icon from "../icon/Icon.vue";
import { useBodyScrollLock } from "../../composables/useBodyScrollLock";
import { useOverlayPanel } from "../../composables/useOverlayPanel";

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

const panelRef = ref<HTMLElement | null>(null);
const titleId = useId();

const isFullscreen = computed(() => props.variant === "fullscreen");

const panelClasses = computed(() =>
  isFullscreen.value
    ? "h-full w-full"
    : "m-auto h-fit max-h-[calc(100dvh-3rem)] w-[calc(100%-3rem)] max-w-[35rem] overflow-hidden rounded-ds-xl p-6",
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

useOverlayPanel({ active: open, panel: panelRef, onDismiss: dismiss });
useBodyScrollLock(open);
</script>

<template>
  <Teleport to="body">
    <Transition
      appear
      enter-from-class="opacity-0"
      enter-active-class="transition-opacity duration-200 ease-out"
      leave-to-class="opacity-0"
      leave-active-class="transition-opacity duration-150 ease-in"
    >
      <div v-if="open" class="ds-dialog__root fixed inset-0 z-50">
        <div
          v-if="!isFullscreen"
          aria-hidden="true"
          class="ds-dialog__scrim absolute inset-0 bg-ds-scrim"
          @click="dismiss"
        />

        <Transition
          appear
          :enter-from-class="panelEnterFrom"
          :enter-active-class="panelEnterActive"
          :leave-to-class="panelLeaveTo"
          :leave-active-class="panelLeaveActive"
        >
          <div
            v-if="open"
            ref="panelRef"
            v-bind="$attrs"
            role="dialog"
            aria-modal="true"
            :aria-labelledby="title ? titleId : undefined"
            tabindex="-1"
            class="ds-dialog absolute inset-0 z-10 flex flex-col bg-ds-surface font-ds text-ds-fg shadow-xl focus-visible:outline-none"
            :class="panelClasses"
          >
            <template v-if="isFullscreen">
              <header class="flex h-16 shrink-0 items-center gap-1 px-2">
                <button
                  type="button"
                  class="ds-dialog__close inline-flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent text-ds-fg transition-colors hover:bg-ds-surface-hover focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ds-focus"
                  :aria-label="closeLabel"
                  @click="close"
                >
                  <Icon :icon="closeIcon" size="24" />
                </button>
                <h2
                  v-if="title"
                  :id="titleId"
                  class="min-w-0 flex-1 truncate px-2 text-xl leading-7 font-normal text-ds-fg"
                >
                  {{ title }}
                </h2>
                <div v-if="$slots.actions" class="flex shrink-0 items-center gap-2 px-2">
                  <slot name="actions" />
                </div>
              </header>
              <div class="min-h-0 flex-1 overflow-y-auto px-6 pt-4 pb-6">
                <slot />
              </div>
            </template>

            <template v-else>
              <div v-if="icon || $slots.icon" class="mb-4 flex justify-center text-ds-muted">
                <slot name="icon">
                  <Icon v-if="icon" :icon="icon" size="24" />
                </slot>
              </div>
              <h2
                v-if="title"
                :id="titleId"
                class="text-2xl leading-8 font-normal text-ds-fg"
                :class="icon || $slots.icon ? 'text-center' : 'text-start'"
              >
                {{ title }}
              </h2>
              <div
                class="min-h-0 overflow-y-auto text-sm leading-5 text-ds-muted"
                :class="title || icon || $slots.icon ? 'mt-4' : ''"
              >
                <slot />
              </div>
              <div v-if="$slots.actions" class="mt-6 flex flex-wrap items-center justify-end gap-2">
                <slot name="actions" />
              </div>
            </template>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
