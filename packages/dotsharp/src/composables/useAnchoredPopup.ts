import { computed, nextTick, onBeforeUnmount, shallowRef, type Ref } from "vue";

export interface AnchoredPopupOptions {
  /** 触发浮层的元素；也用来判断「点击发生在外面」。 */
  anchor: Ref<HTMLElement | null>;
  /** 浮层根元素。 */
  panel: Ref<HTMLElement | null>;
  /** 打开状态由调用方持有，`v-if` 与 `id` / `aria-controls` 都读它。 */
  open: Ref<boolean>;
  /** 打开后优先聚焦的选择器（`panel` 内）。 */
  initialFocus?: string;
}

const GAP = 4;
const EDGE = 8;

/**
 * 贴着触发元素的浮层：定位在下方（放不下时翻到上方）、点击外部关闭、Escape 关闭并
 * 把焦点还给触发元素里的输入框，滚动与窗口缩放时重新定位。
 *
 * 浮层本身由调用方 Teleport 到 `body`，因此不在输入框的 Tab 顺序里。
 */
export function useAnchoredPopup(options: AnchoredPopupOptions) {
  const position = shallowRef<{ top: number; left: number } | null>(null);

  const panelStyle = computed(() => {
    const point = position.value;
    if (!point) return { visibility: "hidden" as const };
    return { top: `${point.top}px`, left: `${point.left}px` };
  });

  function place(): void {
    const trigger = options.anchor.value;
    const panel = options.panel.value;
    if (!trigger || !panel) return;

    const rect = trigger.getBoundingClientRect();
    const width = panel.offsetWidth;
    const height = panel.offsetHeight;
    const below = window.innerHeight - rect.bottom - GAP - EDGE;
    const above = rect.top - GAP - EDGE;
    const up = height > below && above > below;

    position.value = {
      left: Math.max(EDGE, Math.min(rect.left, window.innerWidth - width - EDGE)),
      top: up ? Math.max(EDGE, rect.top - GAP - height) : rect.bottom + GAP,
    };
  }

  function focusAnchor(): void {
    options.anchor.value?.querySelector<HTMLElement>("input")?.focus();
  }

  function listen(on: boolean): void {
    if (typeof document === "undefined") return;
    if (on) {
      document.addEventListener("pointerdown", onPointerDown, true);
      document.addEventListener("keydown", onKeydown);
      window.addEventListener("resize", place);
      window.addEventListener("scroll", place, true);
    } else {
      document.removeEventListener("pointerdown", onPointerDown, true);
      document.removeEventListener("keydown", onKeydown);
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    }
  }

  function onPointerDown(event: Event): void {
    const target = event.target as Node | null;
    if (!target) return;
    if (options.anchor.value?.contains(target) || options.panel.value?.contains(target)) return;
    hide();
  }

  function onKeydown(event: KeyboardEvent): void {
    if (event.key !== "Escape") return;
    event.preventDefault();
    hide(true);
  }

  async function show(): Promise<void> {
    if (options.open.value) return;

    options.open.value = true;
    position.value = null;
    await nextTick();
    if (!options.open.value) return;

    place();
    listen(true);
    if (options.initialFocus) {
      options.panel.value?.querySelector<HTMLElement>(options.initialFocus)?.focus();
    }
  }

  /** `restoreFocus` 只用于选择和取消：点击页面其它位置时不应把焦点抢回输入框。 */
  function hide(restoreFocus = false): void {
    if (!options.open.value) return;
    options.open.value = false;
    position.value = null;
    listen(false);
    if (restoreFocus) focusAnchor();
  }

  onBeforeUnmount(() => listen(false));

  return { panelStyle, show, hide, focusAnchor };
}
