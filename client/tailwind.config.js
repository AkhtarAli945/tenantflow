export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: { display: ["Bricolage Grotesque", "sans-serif"], sans: ["DM Sans", "sans-serif"] },
      colors: {
        brand: { DEFAULT: "#0F766E", dark: "#0B5C55", light: "#DCEFEA" },
        ink: "#14181F",
        paper: "#F6F7F4",
        line: "#E3E6DF",
      },
    },
  },
  plugins: [],
};
