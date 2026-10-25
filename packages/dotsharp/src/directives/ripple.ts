import type { ObjectDirective } from "vue";

export interface RippleOptions {
  /** 扩散颜色，默认跟随元素的 `currentColor`。 */
  color?: string;
  /** 颜色不透明度，默认 `0.12`（Material 3 state layer）。 */
  opacity?: number;
  /** 总是从元素中心扩散，忽略按压位置。 */
  center?: boolean;
  /** 不裁剪到元素边界，也不改写元素自身的 `overflow`。 */
  unbounded?: boolean;
}

export type RippleValue = boolean | RippleOptions | undefined;

interface RippleHandlers {
  pointerdown: (event: PointerEvent) => void;
  keydown: (event: KeyboardEvent) => void;
  keyup: (event: KeyboardEvent) => void;
  release: () => void;
}

interface RippleState {
  options: RippleOptions | null;
  active: HTMLElement | null;
  keyboard: boolean;
  handlers: RippleHandlers | null;
  /** 已应用的 `unbounded` 值；`undefined` 表示尚未准备过宿主样式。 */
  prepared?: boolean;
}

/** 展开时长与松开后的淡出时长，取自 Material 3 ripple 的动效参数。 */
const EXPAND = 450;
const FADE = 150;
const EASING = "cubic-bezier(0.2, 0, 0, 1)";
const DEFAULT_OPACITY = 0.12;

const states = new WeakMap<HTMLElement, RippleState>();

function resolve(value: RippleValue): RippleOptions | null {
  if (value === false) return null;
  if (value === true || value === undefined) return {};
  return value;
}

function isDisabled(el: HTMLElement): boolean {
  return el.hasAttribute("disabled") || el.getAttribute("aria-disabled") === "true";
}

function reducedMotion(): boolean {
  return typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * ripple 用负 `z-index` 画在元素自己的背景之上、内容之下，因此元素必须成为层叠上下文，
 * 否则它会掉到整棵祖先树的背景后面。
 */
function prepare(el: HTMLElement, options: RippleOptions): void {
  if (typeof getComputedStyle !== "function") return;
  const style = getComputedStyle(el);
  // 空字符串是"未指定"的默认值（部分 DOM 实现如此返回），与 `static` / `visible` 同等处理。
  if (!style.position || style.position === "static") el.style.position = "relative";
  if (!options.unbounded && (!style.overflow || style.overflow === "visible")) {
    el.style.overflow = "hidden";
  }
  el.style.isolation = "isolate";
}

function spawn(el: HTMLElement, state: RippleState, x: number, y: number): void {
  const options = state.options ?? {};
  const rect = el.getBoundingClientRect();
  const diameter = 2 * Math.hypot(rect.width, rect.height);
  const opacity = options.opacity ?? DEFAULT_OPACITY;

  const ripple = document.createElement("span");
  ripple.setAttribute("aria-hidden", "true");
  const style = ripple.style;
  style.position = "absolute";
  style.zIndex = "-1";
  style.pointerEvents = "none";
  style.borderRadius = "50%";
  style.background = options.color ?? "currentColor";
  style.width = `${diameter}px`;
  style.height = `${diameter}px`;
  style.left = `${x - rect.left - diameter / 2}px`;
  style.top = `${y - rect.top - diameter / 2}px`;
  style.opacity = "0";
  style.willChange = "transform, opacity";

  el.append(ripple);
  state.active = ripple;

  ripple.animate([{ transform: "scale(0)" }, { transform: "scale(1)" }], {
    duration: EXPAND,
    easing: EASING,
    fill: "forwards",
  });
  ripple.animate([{ opacity: 0 }, { opacity }], {
    duration: FADE,
    easing: "linear",
    fill: "forwards",
  });
}

function release(state: RippleState): void {
  const ripple = state.active;
  state.active = null;
  state.keyboard = false;
  if (!ripple) return;

  // 展开动画用 WAAPI 填满，内联 `opacity` 仍是 0，必须读计算值才能从当前值淡出。
  const from = Number.parseFloat(getComputedStyle(ripple).opacity) || 0;
  const fade = ripple.animate([{ opacity: from }, { opacity: 0 }], {
    duration: FADE,
    easing: "linear",
    fill: "forwards",
  });
  fade.onfinish = () => ripple.remove();
  fade.oncancel = () => ripple.remove();
}

function press(el: HTMLElement, state: RippleState, event?: MouseEvent): void {
  if (!state.options || state.active || isDisabled(el) || reducedMotion()) return;

  const rect = el.getBoundingClientRect();
  const fromPointer = event !== undefined && !state.options.center;
  const x = fromPointer ? event.clientX : rect.left + rect.width / 2;
  const y = fromPointer ? event.clientY : rect.top + rect.height / 2;
  spawn(el, state, x, y);
}

function bind(el: HTMLElement, state: RippleState): void {
  if (state.handlers) return;

  const handlers: RippleHandlers = {
    pointerdown: (event) => {
      if (event.button !== 0) return;
      state.keyboard = false;
      press(el, state, event);
    },
    keydown: (event) => {
      if (event.repeat || (event.key !== "Enter" && event.key !== " ")) return;
      state.keyboard = true;
      press(el, state);
    },
    keyup: (event) => {
      if (!state.keyboard || (event.key !== "Enter" && event.key !== " ")) return;
      release(state);
    },
    release: () => release(state),
  };
  state.handlers = handlers;

  el.addEventListener("pointerdown", handlers.pointerdown);
  el.addEventListener("pointerup", handlers.release);
  el.addEventListener("pointercancel", handlers.release);
  el.addEventListener("pointerleave", handlers.release);
  el.addEventListener("keydown", handlers.keydown);
  el.addEventListener("keyup", handlers.keyup);
  el.addEventListener("blur", handlers.release);
}

function unbind(el: HTMLElement, state: RippleState): void {
  release(state);
  const handlers = state.handlers;
  if (!handlers) return;

  el.removeEventListener("pointerdown", handlers.pointerdown);
  el.removeEventListener("pointerup", handlers.release);
  el.removeEventListener("pointercancel", handlers.release);
  el.removeEventListener("pointerleave", handlers.release);
  el.removeEventListener("keydown", handlers.keydown);
  el.removeEventListener("keyup", handlers.keyup);
  el.removeEventListener("blur", handlers.release);
  state.handlers = null;
}

function apply(el: HTMLElement, state: RippleState): void {
  if (!state.options) {
    unbind(el, state);
    return;
  }

  // `updated` 每次子组件渲染都会跑；只在 `unbounded` 变化时才读一次计算样式。
  if (state.prepared !== Boolean(state.options.unbounded)) {
    prepare(el, state.options);
    state.prepared = Boolean(state.options.unbounded);
  }
  bind(el, state);
}

/**
 * 公共点按涟漪：按下时从按压点（键盘触发时从中心）扩散，松开后淡出。
 * 颜色默认跟随 `currentColor`，组件里的 `text-ds-*` 自然决定涟漪颜色。
 *
 * ```vue
 * <button v-ripple>…</button>
 * <div v-ripple="{ opacity: 0.16 }">…</div>
 * <div v-ripple="false">…</div>
 * ```
 */
export const vRipple: ObjectDirective<HTMLElement, RippleValue> = {
  mounted(el, binding) {
    const state: RippleState = {
      options: resolve(binding.value),
      active: null,
      keyboard: false,
      handlers: null,
    };
    states.set(el, state);
    apply(el, state);
  },
  updated(el, binding) {
    const state = states.get(el);
    if (!state) return;
    state.options = resolve(binding.value);
    apply(el, state);
  },
  unmounted(el) {
    const state = states.get(el);
    if (!state) return;
    unbind(el, state);
    states.delete(el);
  },
};
