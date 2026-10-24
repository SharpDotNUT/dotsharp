import { onBeforeUnmount, watch, type Ref } from "vue";

/**
 * 打开时锁定页面滚动的层数。用模块级计数让多层浮层叠加时，
 * 只有最后一个关闭才恢复 `body` 原本的 `overflow`。
 */
let locks = 0;
let previousOverflow = "";

/** 视口级浮层（对话框）的滚动锁定；组件卸载时自动释放。 */
export function useBodyScrollLock(active: Ref<boolean>): void {
  function lock(): void {
    if (typeof document === "undefined") return;
    if (locks === 0) {
      previousOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
    }
    locks += 1;
  }

  function unlock(): void {
    if (typeof document === "undefined" || locks === 0) return;
    locks -= 1;
    if (locks === 0) document.body.style.overflow = previousOverflow;
  }

  watch(active, (isActive) => (isActive ? lock() : unlock()), { immediate: true });

  onBeforeUnmount(() => {
    if (active.value) unlock();
  });
}
