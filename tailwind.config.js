/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        metro: {
          green: '#008060',
          blue: '#0055A5',
          gold: '#FFD700',
          dark: '#1E293B',
        }
      }
    },
  },
  plugins: [],
}
