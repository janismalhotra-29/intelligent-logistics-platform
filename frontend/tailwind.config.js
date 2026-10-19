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
          950: '#f8fafc', // Soft off-white canvas
          900: '#ffffff', // Crisp white surface
          850: '#f1f5f9', // Light-grey surface
          800: '#e2e8f0', // Subtle card borders
          700: '#cbd5e1', // Divider borders
          600: '#94a3b8', // Muted slate text
          500: '#64748b', // Secondary slate text
          border: '#e2e8f0'
        },
        navy: {
          950: '#090d16',
          900: '#0f172a', // Deep enterprise navy
          850: '#15203b',
          800: '#1e293b',
          700: '#334155',
          600: '#475569'
        },
        forest: {
          900: '#064e3b',
          800: '#065f46',
          700: '#047857',
          600: '#059669',
          500: '#10b981'
        },
        risk: {
          normal: '#10b981',
          watch: '#f59e0b',
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
