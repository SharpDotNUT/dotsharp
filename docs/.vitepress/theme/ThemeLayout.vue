<script setup lang="ts">
import DefaultTheme from "vitepress/theme";
import ThemeSwitcher from "./ThemeSwitcher.vue";

const { Layout } = DefaultTheme;
</script>

<template>
  <Layout>
    <template #nav-bar-content-after>
      <ThemeSwitcher class="ds-theme-switcher--bar" />
    </template>

    <template #nav-screen-content-after>
      <ThemeSwitcher class="ds-theme-switcher--screen" />
    </template>
  </Layout>
</template>
