/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./index.html"],
  darkMode: "selector",
  theme: {
    extend: {
      colors: {
        "link-blue": "#3498db",
        "link-blue-light": "#95c9ec",
        "link-blue-hover": "#0468ab",
        "verified-contract": "#2b50aa",
        "verified-contract-hover": "#26007b",
        "source-line-numbers": "#738a9486",
      },
      fontFamily: {
        sans: ["Roboto"],
        title: ["Space Grotesk"],
        address: ["Roboto Mono"],
        hash: ["Roboto Mono"],
        data: ["Roboto Mono"],
        balance: ["Fira Code"],
        blocknum: ["Roboto"],
        code: ["Fira Code"],
      },
      borderColor: {
        skin: {
          from: "rgb(var(--color-from-border) / <alpha-value>)",
        },
      },
      textColor: {
        skin: {
          button: "rgb(var(--color-button-text) / <alpha-value>)",

          from: "rgb(var(--color-from-text) / <alpha-value>)",
        },
      },
      backgroundColor: {
        skin: {
          "button-fill": "rgb(var(--color-button-fill) / <alpha-value>)",
          "button-hover-fill":
            "rgb(var(--color-button-hover-fill) / <alpha-value>)",

          from: "rgb(var(--color-from-fill) / <alpha-value>)",
          to: "rgb(var(--color-to-fill) / <alpha-value>)",
          "table-hover": "rgb(var(--color-table-row-hover) / <alpha-value>)",
        },
      },
    },
  },
  plugins: [],
};
