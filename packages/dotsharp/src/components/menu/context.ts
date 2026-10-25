import type { InjectionKey, Ref } from "vue";

/** 菜单项的标识值：显式 value，或省略时由 Menu 注入的索引。 */
export type MenuValue = string | number;

export interface MenuContext {
  /**
   * 选中一项：由根级 Menu 统一上报；`close` 默认为 `true`，收起整棵菜单（含各级子菜单），
   * 可勾选项传 `false` 以保持展开。
   */
  select: (value: MenuValue, close?: boolean) => void;
  /** 当前这一级菜单里指针悬停的菜单项，用于收起同级的其它子菜单。 */
  hovered: Ref<symbol | null>;
  setHover: (id: symbol | null) => void;
  /** 整棵菜单树的面板集合（含子菜单），点击外部时据此判断点击是否落在菜单内。 */
  panels: Set<HTMLElement>;
}

export const menuContextKey: InjectionKey<MenuContext> = Symbol("dotsharp-menu");
