<script setup lang="ts">
import { computed, inject, nextTick, onBeforeUnmount, ref, useSlots, watch } from "vue";
import type { IconifyIcon } from "@iconify/vue";
import checkIcon from "@iconify-icons/material-symbols/check";
import chevronRightIcon from "@iconify-icons/material-symbols/chevron-right";
import Icon from "../icon/Icon.vue";
import Menu from "./Menu.vue";
import { menuContextKey, type MenuValue } from "./context";

defineOptions({ inheritAttrs: false });

interface MenuItemProps {
  /** 菜单项文本；存在默认插槽时被插槽覆盖。 */
  label?: string;
  /** 前置图标；`checked` 为 `true` 时让位给勾选标记。 */
  icon?: IconifyIcon | string;
  /** 主文本下方的辅助说明，切换为两行排版。 */
  description?: string;
  /** 尾部快捷键文本，例如 `⌘C`。 */
  shortcut?: string;
  value?: MenuValue;
  /** 由 Menu 注入的内部索引，无需手写。 */
  index?: number;
  disabled?: boolean;
  /** 勾选态；给出布尔值即成为可勾选菜单项（`role="menuitemcheckbox"`）。 */
  checked?: boolean;
}

const props = withDefaults(defineProps<MenuItemProps>(), {
  label: undefined,
  icon: undefined,
  description: undefined,
  shortcut: undefined,
  value: undefined,
  index: 0,
  disabled: false,
  checked: undefined,
});

const emit = defineEmits<{ select: [value: MenuValue] }>();

const slots = useSlots();
const menu = inject(menuContextKey, null);

const id = Symbol("ds-menu-item");
const el = ref<HTMLButtonElement | null>(null);
const submenuRef = ref<{ focusFirst: () => void } | null>(null);
const submenuOpen = ref(false);

const resolvedValue = computed<MenuValue>(() => props.value ?? props.index);
const hasSubmenu = computed(() => Boolean(slots.submenu));
const checkable = computed(() => props.checked !== undefined);
const leadingVisible = computed(
  () => checkable.value || props.icon !== undefined || Boolean(slots.leading),
);
const role = computed(() => (checkable.value ? "menuitemcheckbox" : "menuitem"));

let openTimer: ReturnType<typeof setTimeout> | undefined;
let closeTimer: ReturnType<typeof setTimeout> | undefined;

function clearTimers(): void {
  if (openTimer !== undefined) clearTimeout(openTimer);
  if (closeTimer !== undefined) clearTimeout(closeTimer);
  openTimer = undefined;
  closeTimer = undefined;
}

function openSubmenu(focus: boolean): void {
  clearTimers();
  if (submenuOpen.value) {
    if (focus) submenuRef.value?.focusFirst();
    return;
  }
  submenuOpen.value = true;
  if (focus) void nextTick(() => submenuRef.value?.focusFirst());
}

function scheduleOpen(): void {
  clearTimers();
  openTimer = setTimeout(() => {
    openTimer = undefined;
    submenuOpen.value = true;
  }, 120);
}

function scheduleClose(): void {
  if (openTimer !== undefined) clearTimeout(openTimer);
  openTimer = undefined;
  if (closeTimer !== undefined) return;
  closeTimer = setTimeout(() => {
    closeTimer = undefined;
    submenuOpen.value = false;
  }, 200);
}

function cancelClose(): void {
  if (closeTimer !== undefined) clearTimeout(closeTimer);
  closeTimer = undefined;
}

/** 同一级菜单只保留一个展开的子菜单：指针移到别的菜单项时收起自己。 */
watch(
  () => menu?.hovered.value ?? null,
  (value) => {
    if (value === id) return;
    clearTimers();
    submenuOpen.value = false;
  },
);

function activate(): void {
  if (props.disabled) return;
  if (hasSubmenu.value) {
    openSubmenu(true);
    return;
  }
  emit("select", resolvedValue.value);
  // 可勾选项只切换勾选态，菜单保持展开；普通菜单项选中后收起整棵菜单。
  menu?.select(resolvedValue.value, !checkable.value);
}

function onPointerEnter(): void {
  if (props.disabled) return;
  menu?.setHover(id);
  if (hasSubmenu.value) scheduleOpen();
}

function onPointerLeave(): void {
  if (hasSubmenu.value) scheduleClose();
}

function onKeydown(event: KeyboardEvent): void {
  if (props.disabled) return;

  if (event.key === "ArrowRight" && hasSubmenu.value) {
    event.preventDefault();
    openSubmenu(true);
  } else if (event.key === "ArrowLeft" && submenuOpen.value) {
    event.preventDefault();
    submenuOpen.value = false;
  } else if ((event.key === "Enter" || event.key === " ") && hasSubmenu.value) {
    // 键盘激活子菜单时把焦点送进第一项，鼠标点击仍停留在本项。
    event.preventDefault();
    openSubmenu(true);
  }
}

onBeforeUnmount(clearTimers);
</script>

<template>
  <button
    ref="el"
    type="button"
    :role="role"
    :aria-checked="checkable ? checked : undefined"
    :aria-disabled="disabled || undefined"
    :aria-haspopup="hasSubmenu ? 'menu' : undefined"
    :aria-expanded="hasSubmenu ? submenuOpen : undefined"
    :disabled="disabled"
    tabindex="-1"
    v-bind="$attrs"
    class="ds-menu-item flex w-full cursor-pointer appearance-none items-center gap-3 border-0 bg-transparent px-3 py-2 text-left font-ds text-sm leading-5 text-ds-fg transition-colors outline-none enabled:hover:bg-ds-elevated-hover focus-visible:bg-ds-elevated-hover disabled:cursor-not-allowed disabled:opacity-38"
    @click="activate"
    @pointerenter="onPointerEnter"
    @pointerleave="onPointerLeave"
    @keydown="onKeydown"
  >
    <span
      v-if="leadingVisible"
      class="flex h-6 w-6 shrink-0 items-center justify-center text-ds-muted"
    >
      <slot name="leading">
        <Icon v-if="checked" :icon="checkIcon" size="1.5em" />
        <Icon v-else-if="icon" :icon="icon" size="1.5em" />
      </slot>
    </span>

    <span class="min-w-0 flex-1">
      <span class="block truncate"
        ><slot>{{ label }}</slot></span
      >
      <span v-if="description" class="block truncate text-xs leading-4 text-ds-muted">
        {{ description }}
      </span>
    </span>

    <span
      v-if="shortcut || hasSubmenu || $slots.trailing"
      class="flex shrink-0 items-center gap-2 text-ds-muted"
    >
      <slot name="trailing" />
      <span v-if="shortcut" class="text-xs leading-4 tracking-wide">{{ shortcut }}</span>
      <Icon v-if="hasSubmenu" :icon="chevronRightIcon" size="1.5em" />
    </span>
  </button>

  <Menu
    v-if="hasSubmenu"
    ref="submenuRef"
    v-model:open="submenuOpen"
    :anchor="el"
    placement="right-start"
    :auto-focus="false"
    @pointerenter="cancelClose"
    @pointerleave="scheduleClose"
  >
    <slot name="submenu" />
  </Menu>
</template>
