import type { Config } from "tailwindcss";

// SSS Club Ballari brand tokens — derived from the logo.
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        violet: {
          DEFAULT: "#6320b3", // Steel Violet
          deep: "#2c0f57",
          mid: "#4a18a0",
          soft: "#7a2fd1",
        },
        magenta: {
          DEFAULT: "#ec0f8c", // Stride Magenta
          soft: "#ff5cb4",
        },
        ink: "#160e22",
        paper: { DEFAULT: "#f6f1fa", deep: "#ece4f3" },
        progress: "#13864f",
      },
      backgroundImage: {
        energy: "linear-gradient(135deg, #6320b3 0%, #ec0f8c 100%)",
        "energy-soft": "linear-gradient(135deg, #7a2fd1 0%, #ff5cb4 100%)",
      },
      fontFamily: {
        display: ["Anton", "sans-serif"],
        sans: ["Hanken Grotesque", "system-ui", "sans-serif"],
      },
      borderRadius: { card: "20px", screen: "33px" },
    },
  },
  plugins: [],
};
export default config;
