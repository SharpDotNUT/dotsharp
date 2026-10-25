import { describe, expect, it } from "vite-plus/test";

import { applyOptChars, filterOptChars, normalizeOptValue, removeOptChar } from "./shared";

describe("filterOptChars", () => {
  it("numeric 只保留数字", () => {
    expect(filterOptChars("a1b2-3 4", "numeric")).toEqual(["1", "2", "3", "4"]);
  });

  it("alpha 只保留英文字母", () => {
    expect(filterOptChars("a1B2c!", "alpha")).toEqual(["a", "B", "c"]);
  });

  it("any 保留空白、符号与单个码点字符", () => {
    expect(filterOptChars("a b😀", "any")).toEqual(["a", " ", "b", "😀"]);
  });
});

describe("normalizeOptValue", () => {
  it("过滤后按顺序拼接并截断到槽位数量", () => {
    expect(normalizeOptValue("a1b2c3d4e5", "numeric", 4)).toBe("1234");
  });

  it("长度为零或负数时返回空串", () => {
    expect(normalizeOptValue("123", "numeric", 0)).toBe("");
    expect(normalizeOptValue("123", "numeric", -1)).toBe("");
  });
});

describe("applyOptChars", () => {
  it("单字符写入中间格时替换该格并保留后缀", () => {
    expect(applyOptChars("1234", 2, ["9"], 6)).toBe("1294");
  });

  it("从空位开始追加，超过槽位后丢弃多余字符", () => {
    expect(applyOptChars("12", 2, ["3", "4", "5"], 4)).toBe("1234");
  });

  it("起点越界时写入最后一格", () => {
    expect(applyOptChars("12", 99, ["9"], 4)).toBe("129");
  });
});

describe("removeOptChar", () => {
  it("删除中间格后后续字符左移", () => {
    expect(removeOptChar("1234", 1)).toBe("134");
  });

  it("越界索引不改变值", () => {
    expect(removeOptChar("1234", 10)).toBe("1234");
  });
});
