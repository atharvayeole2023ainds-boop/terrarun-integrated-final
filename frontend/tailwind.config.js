/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#f49d25',
          dark: '#e08a10',
        },
        background: {
          dark: '#0a0a0a',
          accent: '#121212',
        },
        card: {
          dark: '#1a1a1a',
          accent: '#222222',
        },
        map: {
          green: '#4ade80',
          red: '#f87171',
          yellow: '#fbbf24',
        }
      },
      fontFamily: {
        lexend: ['Lexend', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
