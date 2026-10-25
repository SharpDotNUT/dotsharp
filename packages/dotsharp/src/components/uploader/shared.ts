import { ref } from "vue";

/** `accept` 判断只需要这两个字段，测试里可以用普通对象代替 `File`。 */
export interface FileLike {
  name: string;
  type: string;
}

/**
 * 按原生 `<input accept>` 的规则判断文件是否可接受：扩展名、精确 MIME、`type/*` 通配。
 * 空规则接受一切；比较不区分大小写。
 */
export function matchesAccept(file: FileLike, accept: string): boolean {
  const tokens = accept
    .split(",")
    .map((token) => token.trim().toLowerCase())
    .filter(Boolean);
  if (!tokens.length) return true;

  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();

  return tokens.some((token) => {
    if (token === "*/*") return true;
    // 浏览器忽略 `*.txt`，但手写的规则里很常见，顺手兼容。
    const extension = token.startsWith("*.") ? token.slice(1) : token;
    if (extension.startsWith(".")) return name.endsWith(extension);
    if (token.endsWith("/*")) return type.startsWith(token.slice(0, -1));
    return type === token;
  });
}

interface FilePickerOptions {
  disabled: () => boolean;
  onSelect: (files: File[]) => void;
}

/** 隐藏 file input 的打开与读取；只负责选文件，不负责上传。 */
export function useFilePicker(options: FilePickerOptions) {
  const inputRef = ref<HTMLInputElement | null>(null);

  function open(): void {
    if (options.disabled()) return;
    inputRef.value?.click();
  }

  function onChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    // 清空后再次选择同一个文件才会再次触发 change。
    input.value = "";
    if (files.length) options.onSelect(files);
  }

  return { inputRef, open, onChange };
}
