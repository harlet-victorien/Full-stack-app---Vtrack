/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#252525',
        darker: '#111',
        dark: '#222',
        cardinal: '#641200',
      },
    },
  },
  plugins: [],
};
