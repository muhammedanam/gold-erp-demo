/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          50: '#fbf8eb',
          100: '#f5efcf',
          200: '#ebdc9d',
          300: '#e0c666',
          400: '#d7b33c',
          500: '#ca9e26', // Sovereign gold
          600: '#ae7f1d',
          700: '#8c5e1b',
          800: '#734c1d',
          900: '#62401d',
          950: '#39210c'
        },
        royal: {
          900: '#0c1322',
          850: '#111a2e',
          800: '#16223d',
          700: '#1e3056'
        }
      }
    },
  },
  plugins: [],
}

