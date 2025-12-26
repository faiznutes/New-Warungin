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
          DEFAULT: '#10b981', // V3 Emerald Primary
          hover: '#059669',   // Darker shade for hover (emerald-600)
          light: '#d1fae5',   // Lighter shade for bg (emerald-100)
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',     // Base emerald-500
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },
        'primary-hover': '#059669',
        'primary-light': '#d1fae5',
        'background-light': '#f6f7f8', // V3 Light BG
        'background-dark': '#101822',  // V3 Dark BG Updated
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

