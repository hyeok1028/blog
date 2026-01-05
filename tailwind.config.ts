import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";
import animate from "tailwindcss-animate";

const config: Config = {
  // 1. 다크모드 설정 (클래스 기준)
  darkMode: "class",

  // 2. 파일 감시 경로 (src와 app 폴더 내 모든 확장자 포함)
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}", "./app/**/*.{js,ts,jsx,tsx,mdx}"],

  theme: {
    extend: {
      // 3. 기존의 상세 테마 설정 유지
      borderRadius: {
        sm: "calc(var(--radius) - 4px)",
        md: "calc(var(--radius) - 2px)",
        lg: "var(--radius)",
        xl: "calc(var(--radius) + 4px)",
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: "var(--card)",
        "card-foreground": "var(--card-foreground)",
        popover: "var(--popover)",
        "popover-foreground": "var(--popover-foreground)",
        primary: "var(--primary)",
        "primary-foreground": "var(--primary-foreground)",
        secondary: "var(--secondary)",
        "secondary-foreground": "var(--secondary-foreground)",
        muted: "var(--muted)",
        "muted-foreground": "var(--muted-foreground)",
        accent: "var(--accent)",
        "accent-foreground": "var(--accent-foreground)",
        destructive: "var(--destructive)",
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
      },
      // typography 플러그인을 위한 추가 설정 (선택 사항)
      typography: {
        DEFAULT: {
          css: {
            maxWidth: "100ch", // 본문 가독성을 위해 폭 제한
          },
        },
      },
    },
  },

  // 4. 플러그인 병합
  plugins: [typography, animate],
};

export default config;
