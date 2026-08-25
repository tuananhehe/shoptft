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
        canvas: "#000000",
        "surface-soft": "#0d0d0d",
        "surface-card": "#1a1a1a",
        "surface-elevated": "#262626",
        "carbon-gray": "#2b2b2b",
        hairline: "#3c3c3c",
        "hairline-strong": "#262626",
        body: "#bbbbbb",
        "body-strong": "#e6e6e6",
        muted: "#7e7e7e",
        "m-blue-light": "#0066b1",
        "m-blue-dark": "#1c69d4",
        "m-red": "#e22718",
        "bmw-blue": "#1c69d4",
        "electric-blue": "#0653b6",
        warning: "#f4b400",
        success: "#0fa336",
      },
      letterSpacing: {
        machined: "1.5px",
        nav: "0.5px",
      },
      fontFamily: {
        bmw: [
          "BMWTypeNextLatin",
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
      maxWidth: {
        marketing: "1440px",
      },
    },
  },
  plugins: [],
};
export default config;
