import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#faf5f0",
          100: "#f0e6d6",
          200: "#e0cdad",
          300: "#d0b484",
          400: "#c09b5b",
          500: "#b08232",
          600: "#8d6828",
          700: "#6a4e1e",
          800: "#473414",
          900: "#241a0a",
        },
        neutral: {
          50: "#f8f8f8",
          100: "#e8e8e8",
          200: "#d1d1d1",
          300: "#bababa",
          400: "#a3a3a3",
          500: "#8c8c8c",
          600: "#707070",
          700: "#545454",
          800: "#383838",
          900: "#1c1c1c",
        },
        accent: {
          50: "#fef2f2",
          100: "#fee2e2",
          200: "#fecaca",
          300: "#fca5a5",
          400: "#f87171",
          500: "#ef4444",
          600: "#dc2626",
          700: "#b91c1c",
          800: "#991b1b",
          900: "#7f1d1d",
        },
      },
      fontFamily: {
        heading: ["var(--font-heading)", "serif"],
        body: ["var(--font-body)", "sans-serif"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
