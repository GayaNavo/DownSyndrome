/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        blue: {
          50: '#f5f9fc',
          100: '#ebf3f9',
          200: '#d7e7f3',
          300: '#c3dbed',
          400: '#afcfe7',
          500: '#a7c7e7',
          600: '#1e40af',
          700: '#1e3a8a',
          800: '#1d367d',
          900: '#1a306d',
        },
        customBlue: '#a7c7e7',
      },
    },
  },
  plugins: [],
}

