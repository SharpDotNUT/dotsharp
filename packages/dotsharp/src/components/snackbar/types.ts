/** 消息条上的操作按钮。 */
export interface SnackbarAction {
  label: string;
  /** 点击操作后调用；消息条随后关闭。 */
  onAction?: () => void;
}

/** 函数式调用（`showSnackbar`）的选项。 */
export interface SnackbarOptions {
  /** 消息正文。 */
  text: string;
  /** 右侧操作按钮；省略时消息条只有正文。 */
  action?: SnackbarAction;
  /** 自动关闭的毫秒数；`0` 表示只能由用户关闭。默认 `5000`。 */
  duration?: number;
  /** 是否显示关闭按钮。默认 `false`。 */
  dismissible?: boolean;
  /** 关闭按钮的无障碍名称。默认 `Close`。 */
  closeLabel?: string;
}

/** 一次函数式调用的句柄。 */
export interface SnackbarHandle {
  id: number;
  /** 关闭这条消息；还在排队时直接从队列移除。 */
  close: () => void;
}
