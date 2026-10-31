/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        forest: { 50: '#eff4f1', 100: '#dce8e1', 600: '#38634f', 700: '#234d3f', 800: '#1d4539', 900: '#173d32' },
        sage: { 100: '#e8eee7', 200: '#d2ded0', 300: '#a8bca5', 500: '#78947c' },
        ivory: { DEFAULT: '#f8f5ee', 100: '#f1ece2' },
        beige: { 100: '#ede7da', 200: '#ddd3c1' },
        peach: { 100: '#f5e1d7', 200: '#e8bca8', 500: '#b8785e' },
        earth: { DEFAULT: '#806a57' },
        ink: { DEFAULT: '#252923', soft: '#586056' },
      },
      fontFamily: {
        serif: ['"DM Serif Display"', 'Georgia', 'Cambria', 'Times New Roman', 'serif'],
        sans: ['Manrope', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Noto Sans', 'Noto Sans Devanagari', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 8px 30px -14px rgba(23,61,50,0.2)',
        editorial: '0 28px 80px -32px rgba(24,44,35,0.28)',
      },
    },
  },
  plugins: [],
};
