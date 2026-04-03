import type { Config } from 'tailwindcss'

export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        border: '#e5e7eb',

        /* 2Match brand — earthy, warm palette */
        primary: {
          50: '#E1F5EE',
          100: '#C3EBDC',
          200: '#9FCFBF',
          300: '#72B39E',
          400: '#4A9077',
          500: '#2D5C4F',
          600: '#244A40',
          700: '#1B3730',
          800: '#122521',
          900: '#091210',
          forest: '#2D5C4F',
          sage: '#9FCFBF',
          light: '#E1F5EE',
          DEFAULT: '#2D5C4F',
        },

        secondary: {
          50: '#FEF2EE',
          100: '#FDDDD4',
          200: '#FAC9B8',
          300: '#F5A48E',
          400: '#F08C72',
          500: '#E8735A',
          600: '#D45A3E',
          700: '#B04D32',
          800: '#3D2520',
          900: '#2A1915',
          DEFAULT: '#E8735A',
        },

        accent: {
          50: '#FEF2EE',
          100: '#FDDDD4',
          200: '#FAC9B8',
          300: '#F5A48E',
          400: '#F08C72',
          500: '#E8735A',
          600: '#D45A3E',
          700: '#B04D32',
          800: '#3D2520',
          900: '#2A1915',
          terracotta: '#E8735A',
          warm: '#FAEEDA',
          DEFAULT: '#E8735A',
        },

        neutral: {
          cream: '#F5EDD8',
          warmWhite: '#F9F6F0',
          almostBlack: '#2B2B2B',
          darkBg: '#1A1A18',
        },

        /* Semantic colors using warm tones */
        success: {
          DEFAULT: '#4A9E6E',
          light: '#E1F5EE',
        },
        warning: {
          DEFAULT: '#D4A843',
          light: '#FAEEDA',
        },
        danger: {
          DEFAULT: '#E8735A',
          light: '#FDE8E3',
        },
        info: {
          DEFAULT: '#5A8F9E',
          light: '#E1F0F5',
        },

        /* Surface tokens (CSS variable–driven) */
        surface: {
          DEFAULT: 'var(--color-surface)',
          raised: 'var(--color-surface-raised)',
          sunken: 'var(--color-surface-sunken)',
        },
      },

      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Lora', 'Georgia', 'serif'],
      },

      boxShadow: {
        'card': 'var(--shadow-card)',
        'card-hover': 'var(--shadow-card-hover)',
        'primary-glow': '0 4px 14px rgba(45, 92, 79, 0.3)',
        'forest-glow': '0 4px 14px rgba(45, 92, 79, 0.3)',
        'terracotta-glow': '0 4px 14px rgba(232, 115, 90, 0.3)',
      },

      borderRadius: {
        '2xl': '1.25rem',
        '3xl': '1.5rem',
      },

      lineHeight: {
        relaxed: '1.7',
      },
    },
  },
  plugins: [],
} satisfies Config
