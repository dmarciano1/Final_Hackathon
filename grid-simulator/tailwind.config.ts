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
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Waymo-inspired UI theme colors for filter chips
        themeDemand: "#f59e0b", // amber
        themeGrid: "#10b981", // green
        themeGen: "#14b8a6", // teal
        themeStorage: "#06b6d4", // cyan
        themeRel: "#ef4444", // red
        themeMarket: "#8b5cf6", // violet
        themePolicy: "#6366f1", // indigo
        themeEnv: "#f97316", // orange
        themeConstr: "#64748b", // slate
        themeDER: "#3b82f6", // blue
        themeTelem: "#6b7280", // gray
        themeCyber: "#d946ef", // magenta
      },
      backgroundImage: {
        'glass-gradient': 'linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)',
      }
    },
  },
  plugins: [],
};
export default config;
