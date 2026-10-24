import { watch } from "vue";
import type { Theme } from "vitepress";
import DefaultTheme from "vitepress/theme";
import { useTheme } from "@sharpdotnut/dotsharp";
import Layout from "./ThemeLayout.vue";
import "@sharpdotnut/dotsharp/style.css";
import "./style.css";

export default {
  extends: DefaultTheme,
  Layout,
  setup() {
    const { resolvedTheme } = useTheme();

    watch(
      resolvedTheme,
      (value) => {
        if (typeof document === "undefined") return;
        document.documentElement.classList.toggle("dark", value === "dark");
      },
      { immediate: true },
    );
  },
} satisfies Theme;
