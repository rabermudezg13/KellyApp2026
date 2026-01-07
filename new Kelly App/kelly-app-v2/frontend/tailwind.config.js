/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        kelly: {
          green: '#4CAF50',
          darkGreen: '#2E7D32',
        },
      },
    },
  },
  plugins: [],
}

