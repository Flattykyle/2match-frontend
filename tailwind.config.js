/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: '#e5e7eb',
        /* 2Match brand: coral red primary */
        primary: {
          50: '#FFF0F0',
          100: '#FFD9D9',
          200: '#FFB3B3',
          300: '#FF8E8E',
          400: '#FF6B6B',
          500: '#FF6B6B',
          600: '#E85555',
          700: '#CC4040',
          800: '#A63333',
          900: '#802626',
        },
        /* Deep plum accent */
        secondary: {
          50: '#F5F0FA',
          100: '#E8DDF5',
          200: '#D1BBEB',
          300: '#B08FD9',
          400: '#8E63C7',
          500: '#6B3FA5',
          600: '#4E2D7A',
          700: '#3D2A66',
          800: '#2D1B4E',
          900: '#1E1136',
        },
        /* Warm cream surface */
        accent: {
          50: '#FFFCF7',
          100: '#FFF8F0',
          200: '#F5EDE3',
          300: '#E8DCC8',
          400: '#D4C4A8',
          500: '#C0AC88',
          600: '#A89470',
          700: '#8A7858',
          800: '#6C5C42',
          900: '#4E422E',
        },
        surface: {
          DEFAULT: 'var(--color-surface)',
          raised: 'var(--color-surface-raised)',
          sunken: 'var(--color-surface-sunken)',
        },
        plum: {
          DEFAULT: '#2D1B4E',
          light: '#3D2A66',
          dark: '#1E1136',
        },
      },
      fontFamily: {
        sans: ['Nunito', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'card': 'var(--shadow-card)',
        'card-hover': 'var(--shadow-card-hover)',
        'primary-glow': 'var(--shadow-primary-glow)',
        'celebration': 'var(--shadow-celebration)',
      },
      borderRadius: {
        '2xl': '1.25rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
}
