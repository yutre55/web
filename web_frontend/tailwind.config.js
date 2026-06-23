/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'shadow-dark': '#0a0a0b',
        'shadow-card': '#161618',
        'accent-red': '#ff3e3e',
      },
      animation: {
        'glow': 'glow 2s infinite alternate',
      },
      keyframes: {
        glow: {
          'from': { boxShadow: '0 0 10px #ff3e3e' },
          'to': { boxShadow: '0 0 20px #ff3e3e' },
        }
      }
    },
  },
  plugins: [],
}
