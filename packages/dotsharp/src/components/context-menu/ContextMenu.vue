<script setup lang="ts">
import { ref } from "vue";
import Menu from "../menu/Menu.vue";
import type { MenuValue } from "../menu/context";

interface ContextMenuProps {
  disabled?: boolean;
}

const props = withDefaults(defineProps<ContextMenuProps>(), {
  disabled: false,
});

const emit = defineEmits<{ select: [value: MenuValue] }>();

const open = ref(false);
const x = ref(0);
const y = ref(0);

function openAt(left: number, top: number): void {
  if (props.disabled) return;
  x.value = left;
  y.value = top;
  open.value = true;
}

function onContextMenu(event: MouseEvent): void {
  if (props.disabled) return;
  event.preventDefault();
  openAt(event.clientX, event.clientY);
}

/** Shift+F10 / 菜单键：在焦点所在元素的右下角展开，键盘同样可用。 */
function onKeydown(event: KeyboardEvent): void {
  if (props.disabled) return;
  if (event.key !== "ContextMenu" && !(event.shiftKey && event.key === "F10")) return;

  event.preventDefault();
  const target = event.target instanceof HTMLElement ? event.target : null;
  const rect = target?.getBoundingClientRect();
  openAt(
    rect ? rect.left + rect.width / 2 : window.innerWidth / 2,
    rect ? rect.bottom : window.innerHeight / 2,
  );
}
</script>

<template>
  <div class="ds-context-menu contents" @contextmenu="onContextMenu" @keydown="onKeydown">
    <slot />
    <Menu v-model:open="open" :x="x" :y="y" @select="emit('select', $event)">
      <slot name="menu" />
    </Menu>
  </div>
</template>
