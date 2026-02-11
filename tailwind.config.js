/** @type {import('tailwindcss').Config} */
export default {
  content: [],
  theme: {
    extend: {
      colors: {
        supabase: {
          dark: '#121212',
          DEFAULT: '#24b47e', // Supabase Green
          light: '#3ECF8E',
          hover: '#0ea063',
          'dark-800': '#1f1f1f',
          'dark-700': '#2a2a2a',
        }
      }
    },
  },
  plugins: [],
}
