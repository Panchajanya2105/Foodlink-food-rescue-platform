/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FDFBF7',
          100: '#FAF8F5',
          200: '#F4EFEA',
          300: '#EDE4DC',
          400: '#DECFC1',
          500: '#CBB8A3',
          900: '#3D342A',
        },
        forest: {
          50: '#F2F8F4',
          100: '#E1EFE7',
          200: '#C4DFC0',
          500: '#2E8540',
          600: '#1E5E3A',
          700: '#174A2E',
          800: '#113823',
          900: '#0C2618',
        },
        terracotta: {
          50: '#FFF7ED',
          100: '#FFEDD5',
          200: '#FED7AA',
          500: '#EA580C',
          600: '#C2410C',
          700: '#9A3412',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        subtle: '0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.03)',
        card: '0 4px 6px -1px rgba(27, 43, 33, 0.04), 0 2px 4px -2px rgba(27, 43, 33, 0.03)',
        floating: '0 10px 25px -5px rgba(27, 43, 33, 0.08), 0 8px 10px -6px rgba(27, 43, 33, 0.04)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
}

