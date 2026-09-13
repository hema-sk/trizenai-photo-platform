/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#221D1F",
        ivory: "#FBF6EF",
        paper: "#F3EBE0",
        blush: {
          DEFAULT: "#C17C74",
          dark: "#A5645D",
          light: "#E7C3BC",
        },
        sage: {
          DEFAULT: "#77826B",
          dark: "#5C6553",
        },
        gold: {
          DEFAULT: "#A9834B",
          light: "#D8BD8C",
        },
        charcoal: {
          400: "#8B8386",
          600: "#5B5457",
          800: "#332E30",
        },
      },
      fontFamily: {
        display: ["'Fraunces'", "serif"],
        body: ["'Inter'", "sans-serif"],
      },
    },
  },
  plugins: [],
};
