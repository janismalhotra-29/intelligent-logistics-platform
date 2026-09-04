/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        command: {
          950: '#060a14',
          900: '#0b1120',
          850: '#10192e',
          800: '#17233f',
          700: '#22345a',
          600: '#334c80',
          border: '#1e293b'
        },
        risk: {
          normal: '#10b981',
          watch: '#eab308',
          warning: '#f97316',
          critical: '#ef4444'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      }
    },
  },
  plugins: [],
}
