import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "#FFC107",
          dark: "#FFA000",
          accent: "#FFD54F"
        },
        neutral: {
          dark: "#0F172A",
          card: "#1E293B"
        }
      },
    },
  },
  plugins: [],
} satisfies Config;
