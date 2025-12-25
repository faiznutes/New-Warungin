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
          DEFAULT: '#137fec', // V3 Primary Blue
          hover: '#0f6bd0',   // Darker shade for hover
          light: '#e7f2fd',   // Lighter shade for bg
          50: '#f0f7fe',
          100: '#e0effd',
          200: '#b9dcfb',
          300: '#7cc0f8',
          400: '#36a0f4',
          500: '#137fec',     // Base
          600: '#0663cc',
          700: '#064fa4',
          800: '#084384',
          900: '#0c386d',
        },
        'primary-hover': '#0f6bd0',
        'primary-light': '#e7f2fd',
        'background-light': '#f6f7f8', // V3 Light BG
        'background-dark': '#101922',  // V3 Dark BG
        'surface-light': '#ffffff',
        'surface-dark': '#1e293b',     // Updated to match V3 sidebar dark mode
        'text-primary': '#0d141b',
        'text-secondary': '#4c739a',
      },
      fontFamily: {
        "display": ["Inter", "sans-serif"]
      },
      boxShadow: {
        "soft": "0 2px 10px rgba(0, 0, 0, 0.03)",
        "card": "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
      },
    },
  },
  plugins: [],
};

