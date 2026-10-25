import { createApp, type App } from "vue";
import SnackbarHost from "./SnackbarHost.vue";
import { clearSnackbars, dismiss, enqueue } from "./queue";
import type { SnackbarHandle, SnackbarOptions } from "./types";

export type { SnackbarAction, SnackbarHandle, SnackbarOptions } from "./types";

let host: App | null = null;

/** 首次调用时才把宿主挂到 `body`，所以引入这个模块本身没有任何副作用。 */
function mountHost(): void {
  if (host) return;

  const container = document.createElement("div");
  container.dataset.dsSnackbarHost = "";
  document.body.appendChild(container);
  host = createApp(SnackbarHost);
  host.mount(container);
}

/**
 * 函数式弹出消息条：不需要在模板里放组件，也不依赖当前组件树。
 *
 * 同时只显示一条，后来的排队；`duration` 为 `0` 时只能由用户（操作按钮 / 关闭按钮）
 * 或返回的句柄关闭。
 */
export function showSnackbar(options: SnackbarOptions): SnackbarHandle {
  if (typeof document === "undefined") {
    return { id: -1, close: () => {} };
  }

  const item = enqueue(options);
  mountHost();

  return { id: item.id, close: () => void dismiss(item.id) };
}

/** 关闭当前消息并清空队列，用于路由切换、退出登录这类需要「一键清场」的时机。 */
export function closeAllSnackbars(): void {
  clearSnackbars();
}
