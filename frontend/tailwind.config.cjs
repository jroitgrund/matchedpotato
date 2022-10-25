/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#8370FF",
        muted: "#6C6C6C",
        border: "#DFDFDF",
        warning: "#E54848",
      },
      lineHeight: {
        3.5: "0.875rem",
      },
    },
  },
  plugins: [],
};
