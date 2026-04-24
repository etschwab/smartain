import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eefdf5",
          100: "#d7fae6",
          500: "#16a34a",
          600: "#15803d",
          900: "#14532d"
        }
      }
    }
  },
  plugins: [require("@tailwindcss/forms")]
};
export default config;
