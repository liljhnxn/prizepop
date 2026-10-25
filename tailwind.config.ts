import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#15171C",
        card: "#20232B",
        cardHover: "#282C36",
        border: "#343741",
        primary: {
          DEFAULT: "#A78BFA",
          hover: "#9065FA",
        },
        secondary: {
          DEFAULT: "#45C4B0",
          hover: "#34AF9C",
        },
        mainText: "#E8E8E8",
        mutedText: "#9CA3AF",
        success: "#7DBE9A",
        error: "#D98282",
      },
    },
  },
  plugins: [],
};
export default config;
