/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        asphalt: "#1C1F26",
        ember: {
          DEFAULT: "#E8572C",
          dark: "#C7461F",
          light: "#FDEEE7",
        },
        steel: "#3E6C9E",
        surface: "#F4F5F7",
      },
      fontFamily: {
        sans: ['"IBM Plex Sans"', "system-ui", "sans-serif"],
        mono: ['"IBM Plex Mono"', "monospace"],
      },
    },
  },
  plugins: [],
};
