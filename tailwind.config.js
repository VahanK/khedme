const { heroui } = require("@heroui/react");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {},
  },
  darkMode: "class",
  plugins: [heroui({
    themes: {
      light: {
        colors: {
          primary: {
            DEFAULT: "#009639", // Lebanese Cedar green
            foreground: "#ffffff",
          },
          secondary: {
            DEFAULT: "#EE161F", // Lebanese flag red
            foreground: "#ffffff",
          },
          success: {
            DEFAULT: "#10b981",
            foreground: "#ffffff",
          },
          warning: {
            DEFAULT: "#f59e0b",
            foreground: "#ffffff",
          },
          danger: {
            DEFAULT: "#ef4444",
            foreground: "#ffffff",
          },
        },
      },
    },
  })],
}
