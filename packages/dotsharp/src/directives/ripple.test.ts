import { describe, expect, it } from "vite-plus/test";
import { createApp, h, nextTick, withDirectives } from "vue";

import { vRipple, type RippleValue } from "./ripple";

/** happy-dom 没有 Web Animations；用一个立即结束的替身，让淡出回调可预测。 */
function stubAnimate(): void {
  // happy-dom 的类型里没有 `Element.animate`，这里的断言只为扩展原型。
  const withAnimate = Element.prototype as unknown as {
    animate(): { onfinish: (() => void) | null; oncancel: (() => void) | null };
  };
  withAnimate.animate = () => {
    const animation: { onfinish: (() => void) | null; oncancel: (() => void) | null } = {
      onfinish: null,
      oncancel: null,
    };
    queueMicrotask(() => animation.onfinish?.());
    return animation;
  };
}

function mount(value: RippleValue, attrs: Record<string, unknown> = {}) {
  const host = document.createElement("div");
  document.body.append(host);
  const app = createApp({
    setup: () => () =>
      withDirectives(h("button", { ...attrs, type: "button" }, "press"), [[vRipple, value]]),
  });
  app.mount(host);
  const button = host.querySelector("button")!;
  return { app, button };
}

const down = (el: Element) =>
  el.dispatchEvent(
    new MouseEvent("pointerdown", { bubbles: true, button: 0, clientX: 4, clientY: 6 }),
  );
const up = (el: Element) => el.dispatchEvent(new MouseEvent("pointerup", { bubbles: true }));

describe("v-ripple", () => {
  it("准备宿主样式并在按下时插入涟漪，松开后移除", async () => {
    stubAnimate();
    const { app, button } = mount(true);

    expect(button.style.position).toBe("relative");
    expect(button.style.overflow).toBe("hidden");
    expect(button.style.isolation).toBe("isolate");

    down(button);
    const ripple = button.querySelector<HTMLElement>("span");
    expect(ripple).not.toBeNull();
    expect(ripple!.style.zIndex).toBe("-1");
    expect(ripple!.style.background.toLowerCase()).toBe("currentcolor");
    expect(ripple!.getAttribute("aria-hidden")).toBe("true");

    // 同一元素同时只保留一个涟漪。
    down(button);
    expect(button.querySelectorAll("span").length).toBe(1);

    up(button);
    await nextTick();
    await Promise.resolve();
    expect(button.querySelectorAll("span").length).toBe(0);

    app.unmount();
  });

  it("禁用元素、关闭值都不产生涟漪", () => {
    stubAnimate();

    const disabled = mount(true, { disabled: true });
    down(disabled.button);
    expect(disabled.button.querySelectorAll("span").length).toBe(0);

    const off = mount(false);
    down(off.button);
    expect(off.button.querySelectorAll("span").length).toBe(0);
    expect(off.button.style.overflow).toBe("");
  });

  it("键盘按下从中心扩散，松开后移除", async () => {
    stubAnimate();
    const { app, button } = mount({ opacity: 0.2, center: true });

    button.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
    expect(button.querySelectorAll("span").length).toBe(1);

    button.dispatchEvent(new KeyboardEvent("keyup", { key: "Enter", bubbles: true }));
    await Promise.resolve();
    expect(button.querySelectorAll("span").length).toBe(0);

    app.unmount();
  });
});
