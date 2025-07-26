import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'kid-blue': '#87CEEB',
        'kid-yellow': '#FFD700',
        'kid-orange': '#FFA500',
        'kid-cream': '#FFFACD',
        'kid-green': '#90EE90',
        'kid-pink': '#FFB6C1',
      },
      fontFamily: {
        'kid': ['Comic Sans MS', 'cursive'],
      },
      animation: {
        'bounce-slow': 'bounce 3s infinite',
        'wiggle': 'wiggle 1s ease-in-out infinite',
      },
      keyframes: {
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        }
      }
    },
  },
  plugins: [],
};
export default config;