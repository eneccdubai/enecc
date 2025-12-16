/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'display': ['Cormorant Garamond', 'Georgia', 'serif'],
        'body': ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Paleta inspirada en diseño minimalista y elegante
        cream: {
          50: '#fdfcfb',
          100: '#f9f8f6',
          200: '#f1f0e9',
          300: '#e8e6dc',
          400: '#d9d6c7',
          500: '#c9c5b0',
          600: '#a8a389',
          700: '#7d7963',
          800: '#5a5748',
          900: '#3d3b31',
        },
        gold: {
          50: '#fdfbf7',
          100: '#faf6ed',
          200: '#f3e9d1',
          300: '#ead9ae',
          400: '#dfc482',
          500: '#d4af37',
          600: '#b8962e',
          700: '#967a24',
          800: '#7a6220',
          900: '#654f1d',
        },
        stone: {
          50: '#fafaf9',
          100: '#f5f5f4',
          200: '#e7e5e4',
          300: '#d6d3d1',
          400: '#a8a29e',
          500: '#78716c',
          600: '#57534e',
          700: '#44403c',
          800: '#292524',
          900: '#1c1917',
        },
      },
    },
  },
  plugins: [],
}
