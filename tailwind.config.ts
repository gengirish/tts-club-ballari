import type { Config } from "tailwindcss";

/**
 * Steel Sisters & Striders — Ballari
 * Design tokens derived from the official logo (violet + chrome silver on void black).
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        violet: {
          DEFAULT: "#8b5cf6", // logo ribbon (bright)
          deep: "#4c1d95",
          mid: "#6d28d9",
          soft: "#a78bfa",
          glow: "#c4b5fd",
        },
        magenta: {
          DEFAULT: "#ec4899", // stride accent (kept for energy CTAs)
          soft: "#f472b6",
        },
        steel: {
          DEFAULT: "#94a3b8",
          dim: "#64748b",
          bright: "#e2e8f0",
          chrome: "#cbd5e1",
        },
        /** Primary text on dark surfaces */
        ink: "#f4f0fc",
        /** Surfaces — logo “void” + elevated cards */
        paper: {
          DEFAULT: "#050408",
          deep: "#2a2438",
          raised: "#14121f",
          muted: "#1a1726",
        },
        progress: "#34d399",
      },
      backgroundImage: {
        energy: "linear-gradient(135deg, #6d28d9 0%, #8b5cf6 42%, #94a3b8 100%)",
        "energy-soft": "linear-gradient(135deg, #7c3aed 0%, #a78bfa 45%, #cbd5e1 100%)",
        void: "radial-gradient(ellipse 120% 80% at 50% -20%, rgba(139,92,246,0.35), transparent 55%)",
      },
      fontFamily: {
        display: ["Montserrat", "system-ui", "sans-serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      borderRadius: { card: "20px", screen: "33px" },
      boxShadow: {
        brand: "0 24px 80px -12px rgba(109, 40, 217, 0.45)",
        chrome: "0 0 40px rgba(148, 163, 184, 0.12)",
      },
      ringOffsetColor: {
        paper: "#050408",
      },
    },
  },
  plugins: [],
};
export default config;
