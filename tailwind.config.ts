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
        fondo: "rgb(var(--color-fondo) / <alpha-value>)",
        panel: "rgb(var(--color-panel) / <alpha-value>)",
        panelSec: "rgb(var(--color-panel-sec) / <alpha-value>)",
        borde: "rgb(var(--color-borde) / <alpha-value>)",
        dorado: "rgb(var(--color-dorado) / <alpha-value>)",
        tinta: "rgb(var(--color-tinta) / <alpha-value>)",
        tenue: "rgb(var(--color-tenue) / <alpha-value>)",
      },
      boxShadow: {
        suave: "0 20px 50px rgba(0,0,0,0.25)",
      },
    },
  },
  plugins: [],
} satisfies Config;
