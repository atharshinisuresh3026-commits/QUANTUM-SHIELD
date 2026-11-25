import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        netflix: {
          red: '#E50914',
          darkRed: '#B20710',
          black: '#0A0F14',
          darkGray: '#121821',
          gray: '#1C2530',
          lightGray: '#8A97A6',
        },
        quantum: {
          blue: '#3B82F6',
          cyan: '#4FD1C5',
          teal: '#2DD4BF',
          green: '#10B981',
          yellow: '#F59E0B',
          red: '#EF4444',
        },
      },
      animation: {
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
      },
      keyframes: {
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 20px rgba(79, 209, 197, 0.4)" },
          "50%": { boxShadow: "0 0 40px rgba(79, 209, 197, 0.7)" },
        },
      },
    },
  },
  plugins: [],
}

export default config
