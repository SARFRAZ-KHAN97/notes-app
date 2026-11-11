/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        note: {
          default: "#f8fafc",
          yellow: "#fef9c3",
          green: "#dcfce7",
          blue: "#e0f2fe",
          purple: "#f3e8ff",
          pink: "#ffe4e6",
        },
      },
    },
  },
  plugins: [],
}
