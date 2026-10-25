import { reactive } from "vue";
import type { SnackbarAction, SnackbarOptions } from "./types";

export interface SnackbarItem {
  id: number;
  text: string;
  action?: SnackbarAction;
  duration: number;
  dismissible: boolean;
  closeLabel: string;
}

const DEFAULT_DURATION = 5000;
const DEFAULT_CLOSE_LABEL = "Close";

/**
 * 全局只有一条消息可见，其余排队。宿主（`SnackbarHost`）渲染 `current`，
 * 离场动画结束后调用 `advance()` 推进到队首——这样两条消息的进出场不会叠在一起。
 */
export const snackbarQueue = reactive({
  current: null as SnackbarItem | null,
  pending: [] as SnackbarItem[],
});

let timer: ReturnType<typeof setTimeout> | undefined;
let nextId = 1;

function clearTimer(): void {
  if (timer === undefined) return;
  clearTimeout(timer);
  timer = undefined;
}

function schedule(item: SnackbarItem): void {
  clearTimer();
  if (item.duration <= 0) return;
  timer = setTimeout(() => {
    timer = undefined;
    dismiss(item.id);
  }, item.duration);
}

/** 入队；空闲时立即成为当前消息并开始计时。 */
export function enqueue(options: SnackbarOptions): SnackbarItem {
  const item: SnackbarItem = {
    id: nextId++,
    text: options.text,
    action: options.action,
    duration: options.duration ?? DEFAULT_DURATION,
    dismissible: options.dismissible ?? false,
    closeLabel: options.closeLabel ?? DEFAULT_CLOSE_LABEL,
  };

  if (snackbarQueue.current) {
    snackbarQueue.pending.push(item);
  } else {
    snackbarQueue.current = item;
    schedule(item);
  }

  return item;
}

/**
 * 关闭当前消息（省略 `id`）或移除还在排队的某条消息。
 * 返回是否真的关掉了东西。
 */
export function dismiss(id?: number): boolean {
  const current = snackbarQueue.current;

  if (current && (id === undefined || current.id === id)) {
    clearTimer();
    snackbarQueue.current = null;
    return true;
  }

  if (id === undefined) return false;

  const index = snackbarQueue.pending.findIndex((item) => item.id === id);
  if (index === -1) return false;

  snackbarQueue.pending.splice(index, 1);
  return true;
}

/** 当前消息的离场动画播完后调用：没有可见消息时把队首推上来。 */
export function advance(): void {
  if (snackbarQueue.current) return;

  const next = snackbarQueue.pending.shift();
  if (!next) return;

  snackbarQueue.current = next;
  schedule(next);
}

/** 清空当前消息与整个队列（宿主卸载、测试复位用）。 */
export function clearSnackbars(): void {
  clearTimer();
  snackbarQueue.current = null;
  snackbarQueue.pending.length = 0;
}
