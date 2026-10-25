import { afterEach, describe, expect, it, vi } from "vite-plus/test";

import { advance, clearSnackbars, dismiss, enqueue, snackbarQueue } from "./queue";

afterEach(() => {
  clearSnackbars();
  vi.useRealTimers();
});

describe("消息条队列", () => {
  it("空闲时立即展示，并在 duration 之后关闭", () => {
    vi.useFakeTimers();

    const item = enqueue({ text: "已保存", duration: 1000 });
    expect(snackbarQueue.current?.id).toBe(item.id);

    vi.advanceTimersByTime(999);
    expect(snackbarQueue.current?.id).toBe(item.id);

    vi.advanceTimersByTime(1);
    expect(snackbarQueue.current).toBeNull();
  });

  it("duration 为 0 时不会自动关闭", () => {
    vi.useFakeTimers();

    enqueue({ text: "有未保存的修改", duration: 0 });
    vi.advanceTimersByTime(60_000);
    expect(snackbarQueue.current).not.toBeNull();
  });

  it("同时只展示一条，离场后按入队顺序推进", () => {
    const first = enqueue({ text: "A", duration: 0 });
    const second = enqueue({ text: "B", duration: 0 });
    const third = enqueue({ text: "C", duration: 0 });

    expect(snackbarQueue.current?.id).toBe(first.id);
    expect(snackbarQueue.pending.map((item) => item.id)).toEqual([second.id, third.id]);

    dismiss();
    advance();
    expect(snackbarQueue.current?.id).toBe(second.id);

    // 已有可见消息时 advance 不推进，避免跳过还在展示的那条。
    advance();
    expect(snackbarQueue.current?.id).toBe(second.id);

    dismiss();
    advance();
    expect(snackbarQueue.current?.id).toBe(third.id);

    dismiss();
    advance();
    expect(snackbarQueue.current).toBeNull();
  });

  it("dismiss 只关闭 id 匹配的当前消息", () => {
    const item = enqueue({ text: "A", duration: 0 });

    expect(dismiss(item.id + 1)).toBe(false);
    expect(snackbarQueue.current?.id).toBe(item.id);

    expect(dismiss(item.id)).toBe(true);
    expect(snackbarQueue.current).toBeNull();
  });

  it("关闭排队中的消息会把它移出队列", () => {
    enqueue({ text: "A", duration: 0 });
    const queued = enqueue({ text: "B", duration: 0 });
    const alsoQueued = enqueue({ text: "C", duration: 0 });

    expect(dismiss(queued.id)).toBe(true);
    expect(snackbarQueue.pending.map((item) => item.id)).toEqual([alsoQueued.id]);
    expect(dismiss(queued.id)).toBe(false);
  });

  it("关闭当前消息后旧计时器不再影响下一条", () => {
    vi.useFakeTimers();

    const first = enqueue({ text: "A", duration: 1000 });
    dismiss(first.id);

    enqueue({ text: "B", duration: 1000 });
    expect(snackbarQueue.current?.text).toBe("B");

    vi.advanceTimersByTime(999);
    expect(snackbarQueue.current?.text).toBe("B");

    vi.advanceTimersByTime(1);
    expect(snackbarQueue.current).toBeNull();
  });

  it("清空会同时丢掉当前消息与队列", () => {
    enqueue({ text: "A", duration: 0 });
    enqueue({ text: "B", duration: 0 });

    clearSnackbars();

    expect(snackbarQueue.current).toBeNull();
    expect(snackbarQueue.pending).toHaveLength(0);
  });
});
