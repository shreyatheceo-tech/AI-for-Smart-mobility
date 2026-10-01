/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // "Elevated Pinterest" Warm Neutrals Palette
        cream: {
          50: '#FFFEFC',
          100: '#FAF8F5', // Canvas Primary Background
          200: '#F4F0E8',
          300: '#EAE4D8',
          400: '#DCD4C4',
        },
        warm: {
          white: '#FFFDF9',
          surface: '#FAF8F5',
          border: '#EFECE6',
          charcoal: '#332F2C',
          muted: '#7A7570',
        },
        // Soft Pastel Accents
        sage: {
          50: '#F5F8F4',
          100: '#EBF2EA',
          200: '#D7E5D5',
          300: '#B6CDB3',
          400: '#8FA887', // Primary Sage
          500: '#6E8A66',
          600: '#526A4B',
        },
        rose: {
          50: '#FDF7F8',
          100: '#FCEEF0',
          200: '#F8DBDF',
          300: '#F1B8BF',
          400: '#E8929A', // Dusty Rose
          500: '#D46B76',
          600: '#B54C57',
        },
        lavender: {
          50: '#F8F6FC',
          100: '#F2EDF8',
          200: '#E3DAEF',
          300: '#CBBCE2',
          400: '#B4A5D1', // Soft Lavender
          500: '#9480B7',
          600: '#756199',
        },
        clay: {
          400: '#D87A68', // Warm Terracotta Accent
          500: '#C26352',
        },
        // Existing brand & transit colors preserved for compatibility
        brand: {
          50: '#ecfeff',
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
        },
        transit: {
          bus: '#f97316',
          metro: '#3b82f6',
          train: '#8b5cf6',
          car: '#ef4444',
          walk: '#10b981',
          cycle: '#14b8a6',
          multimodal: '#ec4899',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Poppins', 'Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'cute-sm': '16px',
        'cute': '22px',
        'cute-lg': '28px',
        'cute-full': '9999px',
      },
      boxShadow: {
        // "Neumorphism-lite" & Floating Soft Shadows
        'float': '0 10px 30px -5px rgba(180, 160, 150, 0.15), 0 20px 25px -5px rgba(0, 0, 0, 0.04)',
        'float-hover': '0 24px 48px -8px rgba(180, 160, 150, 0.25), 0 12px 20px -4px rgba(0, 0, 0, 0.06)',
        'float-active': '0 6px 16px -2px rgba(180, 160, 150, 0.2), 0 3px 6px -1px rgba(0, 0, 0, 0.04)',
        'neumorphic': '8px 8px 20px rgba(210, 200, 190, 0.35), -8px -8px 20px rgba(255, 255, 255, 0.95)',
        'neumorphic-sm': '4px 4px 12px rgba(210, 200, 190, 0.25), -4px -4px 12px rgba(255, 255, 255, 0.9)',
        'neumorphic-inset': 'inset 4px 4px 10px rgba(210, 200, 190, 0.3), inset -4px -4px 10px rgba(255, 255, 255, 0.9)',
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'spring-soft': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      animation: {
        'float': 'float 4s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spring-pop': 'pop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        pop: {
          '0%': { transform: 'scale(0.92)' },
          '50%': { transform: 'scale(1.08)' },
          '100%': { transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
};
