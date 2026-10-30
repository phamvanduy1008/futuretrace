/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './index.tsx',
    './App.tsx',
    './pages/**/*.{ts,tsx,js,jsx}',
    './components/**/*.{ts,tsx,js,jsx}',
    './services/**/*.{ts,tsx}',
    './data/**/*.{ts,tsx}',
  ],
  // Lớp màu sinh lúc chạy: historyItem từ backend (routes/simulations.js) và
  // `colorClass.replace('text-', 'bg-')` ở EvaluationFlow / ComparisonMatrixPage
  safelist: [{ pattern: /^bg-(emerald|rose|blue|amber|indigo)-(500|600)$/ }],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Be Vietnam Pro"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Be Vietnam Pro"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 6s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        float: 'float 8s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0) scale(1)' },
          '50%': { transform: 'translateY(-20px) scale(1.05)' },
        },
      },
    },
  },
  plugins: [],
};
