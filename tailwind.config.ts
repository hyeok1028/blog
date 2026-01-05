import type { Config } from "tailwindcss";
// 1. require 대신 import 문법을 사용합니다.
import typography from "@tailwindcss/typography";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // 필요한 테마 확장이 있다면 여기에 추가
    },
  },
  // 2. 임포트한 변수를 plugins 배열에 넣습니다.
  plugins: [typography],
};

export default config;
