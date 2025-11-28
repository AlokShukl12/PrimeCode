/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0b1021',
        accent: '#5ce1e6',
        slate: '#1c243b',
        'slate-soft': '#24304f',
      },
      boxShadow: {
        card: '0 20px 50px rgba(0,0,0,0.35)',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
