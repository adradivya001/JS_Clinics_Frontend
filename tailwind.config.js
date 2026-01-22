/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./App.tsx",
    "./index.tsx",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./services/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: '#F0F4F8',        // Light Grey/Blueish Background
          surface: '#FFFFFF',   // White Surface
          textPrimary: '#0F172A', // Black/Dark Slate Text
          textSecondary: '#475569', // Dark Grey Text

          // Light Blue Palette
          primary: '#0EA5E9',   // Sky Blue (Vibrant)
          secondary: '#BAE6FD', // Very Light Blue (for accents/bg)
          accent: '#38BDF8',    // Lighter Sky Blue

          border: '#E2E8F0',    // Light Grey Border

          success: '#10B981',
          warning: '#F59E0B',
          error: '#EF4444',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      animation: {
        'float-slow': 'float 15s infinite ease-in-out',
        'pulse-soft': 'pulseSoft 2s infinite',
        'spin-slow': 'spin 20s linear infinite',
        'spin-reverse-slow': 'spin 15s linear infinite reverse',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '50%': { transform: 'translate(20px, -20px)' },
        }
      }
    }
  },
  plugins: [],
}
