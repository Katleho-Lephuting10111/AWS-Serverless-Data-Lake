/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c3d66',
        },
        nature: {
          forest: {
            light: '#4a8729',
            DEFAULT: '#3a6b1f',
            dark: '#2d5016',
          },
          sky: {
            light: '#6db5c7',
            DEFAULT: '#5ba3b5',
            dark: '#4a90a4',
          },
          earth: {
            light: '#c4a572',
            DEFAULT: '#a68a5c',
            dark: '#8b6f47',
          },
          sage: {
            light: '#b0cab7',
            DEFAULT: '#9cb9a3',
            dark: '#88a88f',
          },
          sunset: {
            light: '#eba56a',
            DEFAULT: '#d98f55',
            dark: '#c87941',
          },
          clay: {
            light: '#b5805d',
            DEFAULT: '#a06d4c',
            dark: '#8b5a3c',
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
