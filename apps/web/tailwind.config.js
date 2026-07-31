/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#0c6b63",
          dark: "#084f49",
          light: "#1aa896",
        },
        ink: {
          DEFAULT: "#0b1220",
          soft: "#1a2332",
        },
        mist: {
          DEFAULT: "#f3f5f7",
          deep: "#e8ecef",
        },
        paper: "#fafbfc",
        accent: "#c4a35a",
      },
      fontFamily: {
        display: ["var(--font-display)", "Fraunces", "Georgia", "serif"],
        sans: ["var(--font-sans)", "Plus Jakarta Sans", "system-ui", "sans-serif"],
      },
      boxShadow: {
        search: "0 24px 80px -20px rgba(11, 18, 32, 0.45), 0 0 0 1px rgba(255,255,255,0.08)",
        lift: "0 18px 50px -24px rgba(11, 18, 32, 0.28)",
      },
      letterSpacing: {
        brand: "0.02em",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
