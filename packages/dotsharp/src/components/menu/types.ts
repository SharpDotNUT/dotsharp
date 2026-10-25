/**
 * 菜单相对锚点的展开方向。
 *
 * - `bottom-start`：锚点下方、左对齐（默认，触发按钮用）；
 * - `bottom-end`：锚点下方、右对齐；
 * - `right-start`：锚点右侧、上对齐（二级菜单用，空间不足时自动翻到左侧）。
 */
export type MenuPlacement = "bottom-start" | "bottom-end" | "right-start";
