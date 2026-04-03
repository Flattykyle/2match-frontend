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
          forest: '#2D5C4F',
          sage: '#9FCFBF',
          light: '#E1F5EE',
          DEFAULT: '#2D5C4F',
        },

        accent: {
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
