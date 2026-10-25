import { describe, expect, it } from "vite-plus/test";

import { matchesAccept, type FileLike } from "./shared";

const file = (name: string, type = ""): FileLike => ({ name, type });

describe("matchesAccept", () => {
  it("空规则接受所有文件", () => {
    expect(matchesAccept(file("anything.bin"), "")).toBe(true);
    expect(matchesAccept(file("anything.bin"), " , ")).toBe(true);
  });

  it("扩展名不区分大小写", () => {
    expect(matchesAccept(file("NOTES.TXT"), ".txt")).toBe(true);
    expect(matchesAccept(file("notes.txt"), ".txt")).toBe(true);
    expect(matchesAccept(file("notes.txt"), ".md")).toBe(false);
  });

  it("兼容 `*.txt` 写法", () => {
    expect(matchesAccept(file("notes.txt"), "*.txt")).toBe(true);
  });

  it("支持 MIME 通配与精确类型", () => {
    expect(matchesAccept(file("photo.png", "image/png"), "image/*")).toBe(true);
    expect(matchesAccept(file("photo.png", "image/png"), "image/png")).toBe(true);
    expect(matchesAccept(file("photo.png", "image/png"), "text/plain")).toBe(false);
    expect(matchesAccept(file("photo.png", "image/png"), "*/*")).toBe(true);
  });

  it("任一规则命中即可，未知 MIME 仍可按扩展名接受", () => {
    expect(matchesAccept(file("report.pdf", ""), ".txt, application/pdf, .pdf")).toBe(true);
    expect(matchesAccept(file("report.pdf", ""), "application/pdf")).toBe(false);
  });
});
