import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#0A5C36",
        gold: "#C5961A",
        darkBg: "#1A1A2E",
        lightBg: "#FDFAF5",
        ink: "#1C1008",
        inkMid: "#4A3020",
        inkLight: "#8C7060",
        saffron: "#E8620A",
        saffronDark: "#B84A00",
        saffronPale: "#FFF3E8",
        saffronMid: "#FFD5AA",
        paper: "#FDFAF5",
        paperWarm: "#F7F0E4",
        rule: "#D4C4B0",
        done: "#1A6B2A",
        donePale: "#E8F5EC",
        amber: "#D4860A",
        amberPale: "#FFF8E6",
        evaded: "#C0392B",
        evadedPale: "#FFF0F0",
      },
      fontFamily: {
        serif: ["'Playfair Display'", "Georgia", "serif"],
        body: ["'Crimson Pro'", "Georgia", "serif"],
        mono: ["'Space Mono'", "monospace"],
        bengali: ["'Hind Siliguri'", "'Crimson Pro'", "serif"],
      },
    },
  },
  plugins: [],
};
export default config;