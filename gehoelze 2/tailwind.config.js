/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink:    '#12241B',
        paper:  '#FFFFFF',
        mist:   '#EDF0E9',
        line:   '#CBD2C3',
        muted:  '#66735F',
        nadel:  '#2E5A66',
        laub:   '#5C7A24',
        signal: '#A3302B',
      },
      fontFamily: {
        sans: ['Archivo', 'system-ui', 'sans-serif'],
        bot:  ['"Source Serif 4"', 'Georgia', 'serif'],
      },
      borderRadius: { xl2: '14px' },
    },
  },
  plugins: [],
}
