/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
  ],
  darkMode: 'class', // Force light mode unless 'dark' class is present
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#3f68e4', // Royal Blue
          hover: '#3558c7',
          light: '#eef2ff',
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A8A',
        },
        'primary-hover': '#3558c7',
        'primary-light': '#eef2ff',
        'background-light': '#ffffff', // User requested All White
        'background-dark': '#111521',
        'surface-light': '#ffffff',
        'surface-dark': '#1e2330',
        'text-primary': '#0e111b',
        'text-secondary': '#506295',
      },
      fontFamily: {
        "display": ["Inter", "sans-serif"]
      },
      boxShadow: {
        "soft": "0 2px 10px rgba(0, 0, 0, 0.03)",
        "card": "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)",
      },
    },
  },
  plugins: [],
};

