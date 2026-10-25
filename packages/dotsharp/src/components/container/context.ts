import { computed, inject, type ComputedRef, type InjectionKey, type Ref } from "vue";

/** 容器层级：1 为最外层，最多嵌套到 3。 */
export type ContainerLevel = 1 | 2 | 3;

/** 当前容器所在的层级；父容器 provide，子容器 inject。 */
export const containerLevelKey: InjectionKey<Readonly<Ref<ContainerLevel>>> = Symbol(
  "dotsharp-container-level",
);

export function clampLevel(value: number): ContainerLevel {
  return Math.min(Math.max(Math.round(value), 1), 3) as ContainerLevel;
}

/**
 * 自动层级：没有显式 `level` 时，比最近的父容器深一层，顶层是 1；
 * 超过 3 层时保持 3，与「最多三层」的约定一致。
 */
export function useContainerLevel(
  manual: () => ContainerLevel | undefined,
): ComputedRef<ContainerLevel> {
  const parent = inject(containerLevelKey, null);
  return computed(() => manual() ?? clampLevel((parent?.value ?? 0) + 1));
}
