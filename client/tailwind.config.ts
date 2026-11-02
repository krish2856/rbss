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
        samaj: {
          navy: {
            DEFAULT: "#0b254e",
            50: "#f0f4fa",
            100: "#e0e9f5",
            200: "#c4d5ed",
            700: "#1e3a6b",
            800: "#132f5d",
            900: "#0b254e",
            950: "#06152d",
          },
          gold: {
            DEFAULT: "#ea580c", // Vibrant Saffron Orange matching the RBSS logo!
            50: "#fff7ed",
            100: "#ffedd5",
            200: "#fed7aa",
            300: "#fdba74",
            400: "#fb923c",
            500: "#f97316",
            600: "#ea580c",
            700: "#c2410c",
            800: "#9a3412",
          },
          ivory: "#f8fafc",
        },
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Noto Sans Gujarati",
          "sans-serif",
        ],
      },
      boxShadow: {
        subtle: "0 1px 3px 0 rgba(11, 37, 78, 0.05), 0 1px 2px 0 rgba(11, 37, 78, 0.03)",
        card: "0 4px 6px -1px rgba(11, 37, 78, 0.07), 0 2px 4px -2px rgba(11, 37, 78, 0.04)",
        brand: "0 4px 14px 0 rgba(234, 88, 12, 0.25)",
      },
    },
  },
  plugins: [],
};
export default config;
