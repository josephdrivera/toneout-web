import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        background: "#08090e",
        surface: "#0f1018",
        surfaceLight: "#111219",
        border: "#16171f",
        borderLight: "#1a1b24",
        borderBright: "#222330",
        textPrimary: "#e4e5ed",
        textSecondary: "#d0d1da",
        textBody: "#8a8b97",
        textMuted: "#50515f",
        textHint: "#3e3f50",
        textFaint: "#2a2b38",
        fire: "#bf5a3a",
        law: "#4878a8",
        ems: "#4d8a5c",
        accent: "#4878a8",
        gold: "#c89b3c",
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "SF Pro Display",
          "Helvetica Neue",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};

export default config;
