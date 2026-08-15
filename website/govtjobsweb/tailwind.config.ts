import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#0B4A38",
          dark: "#083626",
          light: "#0E6349",
        },
        paper: "#FBFBF8",
        ink: "#142019",
        gold: {
          DEFAULT: "#B8862E",
          light: "#D9B368",
        },
        slateblue: "#33586B",
        hairline: "#DCD6C4",
        subtle: "#F3F1E8",
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(20,32,25,0.04), 0 2px 8px rgba(20,32,25,0.06)",
        cardHover: "0 2px 4px rgba(20,32,25,0.06), 0 8px 20px rgba(20,32,25,0.09)",
      },
      borderRadius: {
        card: "10px",
      },
    },
  },
  plugins: [],
};

export default config;
