function withOpacity(variableName) {
  return ({ opacityValue }) => {
    if (opacityValue !== undefined) {
      return `rgba(var(${variableName}), ${opacityValue})`;
    }
    return `rgb(var(${variableName}))`;
  };
}

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./index.html"],
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
          from: withOpacity("--color-from-border"),
        },
      },
      textColor: {
        skin: {
          button: withOpacity("--color-button-text"),

          from: withOpacity("--color-from-text"),
        },
      },
      backgroundColor: {
        skin: {
          "button-fill": withOpacity("--color-button-fill"),
          "button-hover-fill": withOpacity("--color-button-hover-fill"),

          from: withOpacity("--color-from-fill"),
          to: withOpacity("--color-to-fill"),
          "table-hover": withOpacity("--color-table-row-hover"),
        },
      },
    },
  },
  plugins: [],
};
