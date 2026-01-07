import type { StorybookConfig } from "@storybook/nextjs-vite";
import path from "path";
import { fileURLToPath } from "url";

// ESM 환경에서 __dirname 재현
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const config: StorybookConfig = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: [
    "@chromatic-com/storybook",
    "@storybook/addon-vitest",
    "@storybook/addon-a11y",
    "@storybook/addon-docs",
    "@storybook/addon-onboarding",
  ],
  framework: "@storybook/nextjs-vite",
  staticDirs: ["../public"],

  async viteFinal(viteConfig) {
    viteConfig.resolve = viteConfig.resolve || {};
    viteConfig.resolve.alias = {
      ...(viteConfig.resolve.alias || {}),

      // tsconfig의 "@" alias 대응
      "@": path.resolve(__dirname, "../src"),

      // Storybook에서만 서버 액션을 목업으로 치환
      "@/lib/actions": path.resolve(__dirname, "../storybook/mocks/actions.ts"),
    };

    return viteConfig;
  },
};

export default config;
