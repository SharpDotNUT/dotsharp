import { defineConfig } from "vite-plus";

export default defineConfig({
  lint: {
    ignorePatterns: [
      "**/dist/**",
      "**/node_modules/**",
      ".prompt/**",
      "docs/.vitepress/cache/**",
      "docs/.vitepress/dist/**",
    ],
    options: {
      typeAware: true,
      typeCheck: true,
    },
  },
  test: {
    include: ["packages/*/src/**/*.test.ts"],
    environment: "happy-dom",
  },
});
