/**@type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        farm: {
          green: '#2d6a4f',
          light: '#52b788',
          cream: '#f8f9fa',
          dark: '#1b4332',
          warning: '#f4a261',
          danger: '#e63946',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}