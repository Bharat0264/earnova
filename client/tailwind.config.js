/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
          950: '#2e1065',
        },
        eco: {
          50:  '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
        },
      },
      fontFamily: {
        display: ['Sora', 'sans-serif'],
        sans:    ['Plus Jakarta Sans', 'sans-serif'],
      },
      animation: {
        'float':       'float 4s ease-in-out infinite',
        'float-delay': 'float 4s ease-in-out 1.5s infinite',
        'float-slow':  'float 6s ease-in-out 0.5s infinite',
        'fade-in-up':  'fadeInUp 0.7s ease-out forwards',
        'fade-in':     'fadeIn 0.5s ease-out forwards',
        'slide-right': 'slideRight 0.6s ease-out forwards',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-12px)' },
        },
        fadeInUp: {
          from: { opacity: '0', transform: 'translateY(28px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        slideRight: {
          from: { opacity: '0', transform: 'translateX(-20px)' },
          to:   { opacity: '1', transform: 'translateX(0)' },
        },
      },
      boxShadow: {
        card:       '0 4px 24px rgba(91, 33, 182, 0.07)',
        'card-hover': '0 16px 48px rgba(91, 33, 182, 0.14)',
        nav:        '0 2px 20px rgba(0, 0, 0, 0.07)',
        btn:        '0 4px 14px rgba(91, 33, 182, 0.32)',
        'eco-btn':  '0 4px 14px rgba(5, 150, 105, 0.28)',
      },
    },
  },
  plugins: [],
}
