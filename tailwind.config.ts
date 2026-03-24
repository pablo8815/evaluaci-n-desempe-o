import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {},
  },
  safelist: [
    "border-orange-400",
    "bg-orange-500/90",
    "text-white",
    "ring-orange-200",

    "border-amber-400",
    "bg-amber-400",
    "text-amber-950",
    "ring-amber-200",

    "border-blue-500",
    "bg-blue-600",
    "text-white",
    "ring-blue-200",

    "border-emerald-500",
    "bg-emerald-600",
    "text-white",
    "ring-emerald-200",

    "border-slate-300",
    "bg-slate-100",
    "text-slate-900",
    "ring-slate-200",
  ],
  plugins: [],
};

export default config;
