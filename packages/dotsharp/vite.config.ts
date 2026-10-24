import { defineConfig } from "vite-plus";
import Vue from "unplugin-vue/rolldown";

export default defineConfig({
  pack: {
    entry: ["src/index.ts"],
    platform: "neutral",
    format: ["esm"],
    dts: { vue: true },
    plugins: [Vue({ isProduction: true })],
  },
});
