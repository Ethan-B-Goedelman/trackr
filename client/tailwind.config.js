/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        peach: {
          50:  '#fff8f5',
          100: '#ffe8dc',
          200: '#ffd0b8',
          300: '#ffb494',
          400: '#ff9470',
        },
        yellow: {
          50:  '#fffdf0',
          100: '#fefce8',
          200: '#fef9c3',
          300: '#fde68a',
          400: '#fbbf24',
          500: '#f59e0b',
        },
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"SF Pro Display"', '"Inter"', 'sans-serif'],
      },
      backdropBlur: {
        xs: '2px',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.05)',
        'card-hover': '0 4px 16px rgba(0,0,0,0.1)',
        'float': '0 8px 24px rgba(251,191,36,0.4)',
      },
    },
  },
  plugins: [],
};
