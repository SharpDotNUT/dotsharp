<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useTheme, type ThemeMode } from "@sharpdotnut/dotsharp";

const { theme, setTheme } = useTheme();

const options: { label: string; value: ThemeMode }[] = [
  { label: "跟随系统", value: "system" },
  { label: "浅色", value: "light" },
  { label: "深色", value: "dark" },
];

const mounted = ref(false);
onMounted(() => {
  mounted.value = true;
});

// Keep SSR output and the hydration render identical.
const activeMode = computed<ThemeMode>(() => (mounted.value ? theme.value : "system"));
</script>

<template>
  <div class="ds-theme-switcher" role="group" aria-label="主题">
    <button
      v-for="option in options"
      :key="option.value"
      class="ds-theme-switcher__button"
      :class="{ 'is-active': activeMode === option.value }"
      :aria-pressed="activeMode === option.value"
      type="button"
      @click="setTheme(option.value)"
    >
      {{ option.label }}
    </button>
  </div>
</template>
