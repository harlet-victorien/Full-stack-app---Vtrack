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
      h: {
        156: '0.1rem',
        10: '2.5rem',
        100: '25rem',
        120: '30rem',
        140: '35rem',
        160: '40rem',
        180: '45rem',
        200: '50rem',
      },
      screens: {
        'dou': '125rem',
      },
      margin: {
        '1/6': '16.6667%',
        '1/5': '20%',
      },
    },
  },
  plugins: [],
};
