const colors = require("tailwindcss/colors");

module.exports = {
  purge: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        "link-blue": "#3498db",
        "link-blue-hover": "#0468ab",
        orange: colors.orange,
        coolGray: colors.coolGray,
      },
      fontFamily: {
        sans: ["Roboto"],
        title: ["Space Grotesk"],
        address: ["Roboto Mono"],
        hash: ["Roboto Mono"],
        data: ["Roboto Mono"],
        balance: ["Fira Code"],
        blocknum: ["Roboto"],
      },
      gridTemplateColumns: {
        21: "repeat(21, minmax(0, 1fr))",
      },
    },
  },
  variants: {
    extend: {
      cursor: ["disabled"],
      backgroundColor: ["disabled"],
      textColor: ["disabled"],
    },
  },
  plugins: [],
};
