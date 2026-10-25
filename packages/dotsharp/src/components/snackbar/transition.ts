/**
 * 声明式组件与函数式宿主共用同一组进出场动画：从底部滑入、向下淡出。
 * 键名与 `<Transition>` 的同名属性一致，可直接 `v-bind`。
 */
export const snackbarTransition = {
  enterFromClass: "translate-y-4 opacity-0",
  enterActiveClass: "transition-[opacity,translate] duration-200 ease-out",
  enterToClass: "translate-y-0 opacity-100",
  leaveFromClass: "translate-y-0 opacity-100",
  leaveActiveClass: "transition-[opacity,translate] duration-150 ease-in",
  leaveToClass: "translate-y-2 opacity-0",
} as const;
