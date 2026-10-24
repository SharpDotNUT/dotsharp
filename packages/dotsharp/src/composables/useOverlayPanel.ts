import { nextTick, onBeforeUnmount, onMounted, watch, type Ref } from "vue";

interface OverlayPanelOptions {
  /** 浮层是否打开；变化时接管焦点。 */
  active: Ref<boolean>;
  /** 浮层根元素，作为焦点兜底与焦点陷阱边界。 */
  panel: Ref<HTMLElement | null>;
  /** Escape 按下时调用，用于关闭浮层。 */
  onDismiss: () => void;
  /** 打开时优先聚焦的选择器；找不到时聚焦面板本身。 */
  initialFocus?: string;
}

/**
 * 容器内浮层（modal drawer）的焦点陷阱、Escape 关闭与焦点恢复。
 * 只操作自身面板与控件焦点，不改动页面滚动或把内容 teleport 出去。
 */
export function useOverlayPanel(options: OverlayPanelOptions): void {
  let restoreFocus: HTMLElement | null = null;

  function focusableElements(): HTMLElement[] {
    const panel = options.panel.value;
    if (!panel) return [];
    return [
      ...panel.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ),
    ];
  }

  function onKeydown(event: KeyboardEvent): void {
    if (!options.active.value) return;

    if (event.key === "Escape") {
      event.preventDefault();
      options.onDismiss();
      return;
    }

    if (event.key !== "Tab") return;

    const items = focusableElements();
    const first = items[0];
    const last = items[items.length - 1];

    if (!first || !last) {
      event.preventDefault();
      options.panel.value?.focus();
      return;
    }

    if (event.shiftKey) {
      if (document.activeElement === first || document.activeElement === options.panel.value) {
        event.preventDefault();
        last.focus();
      }
    } else if (document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  watch(
    options.active,
    (isActive) => {
      if (typeof document === "undefined") return;

      if (isActive) {
        restoreFocus = document.activeElement as HTMLElement | null;

        void nextTick(() => {
          const panel = options.panel.value;
          if (!panel) return;
          const target = options.initialFocus
            ? panel.querySelector<HTMLElement>(options.initialFocus)
            : null;
          (target ?? panel).focus();
        });
      } else if (restoreFocus) {
        restoreFocus.focus();
        restoreFocus = null;
      }
    },
    { immediate: true },
  );

  onMounted(() => window.addEventListener("keydown", onKeydown));

  onBeforeUnmount(() => window.removeEventListener("keydown", onKeydown));
}
