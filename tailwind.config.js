/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        parchment: {
          DEFAULT: '#F4EFE6',
          light: '#FAF6EE',
          card: '#F9F4EB',
          deep: '#EADEC9',
        },
        bronze: {
          DEFAULT: '#8C6239',
          dark: '#5C3D1E',
          shine: '#D4AF37',
        },
        copper: {
          DEFAULT: '#B8860B',
          light: '#C86432',
        },
        amber: {
          glow: '#FFBF00',
        },
        sepia: {
          DEFAULT: '#2C221E',
          muted: '#5C4B43',
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
