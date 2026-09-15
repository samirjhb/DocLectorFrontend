const path = require('path');

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [path.join(__dirname, "src/**/*.{html,ts}")],
  theme: {
    extend: {
      colors: {
        riesgo: {
          alto: '#D85A30',
          advertencia: '#E3A83B',
        },
      },
    },
  },
  plugins: [],
}

