/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        unicorn: {
          pink: '#FF69B4',
          purple: '#9370DB',
          blue: '#87CEEB',
          green: '#98FB98',
          yellow: '#FFD700',
          orange: '#FFA500',
          red: '#FF6B8A',
          lavender: '#E6E6FA',
          mint: '#98FF98',
          peach: '#FFD3B6',
        },
        // Semantic colors using unicorn palette
        primary: '#9370DB', // unicorn purple
        secondary: '#FF69B4', // unicorn pink
        accent: '#FFD700', // unicorn yellow
        success: '#98FB98', // unicorn green
        warning: '#FFA500', // unicorn orange
        error: '#FF6B8A', // unicorn red
        info: '#87CEEB', // unicorn blue
      },
      backgroundImage: {
        'rainbow-gradient': 'linear-gradient(90deg, #FF6B8A 0%, #FF69B4 16.67%, #9370DB 33.33%, #87CEEB 50%, #98FB98 66.67%, #FFD700 83.33%, #FFA500 100%)',
        'rainbow-gradient-vertical': 'linear-gradient(180deg, #FF6B8A 0%, #FF69B4 16.67%, #9370DB 33.33%, #87CEEB 50%, #98FB98 66.67%, #FFD700 83.33%, #FFA500 100%)',
        'rainbow-gradient-diagonal': 'linear-gradient(135deg, #FF6B8A 0%, #FF69B4 16.67%, #9370DB 33.33%, #87CEEB 50%, #98FB98 66.67%, #FFD700 83.33%, #FFA500 100%)',
        'unicorn-sparkle': 'radial-gradient(circle at center, #FFD700 0%, #9370DB 50%, #FF69B4 100%)',
      },
      animation: {
        'rainbow-pulse': 'rainbow-pulse 3s ease-in-out infinite',
        'sparkle': 'sparkle 1.5s ease-in-out infinite',
        'bounce-slow': 'bounce 3s infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'slide-up': 'slide-up 0.5s ease-out',
      },
      keyframes: {
        'rainbow-pulse': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        'sparkle': {
          '0%, 100%': { transform: 'scale(1) rotate(0deg)', opacity: '1' },
          '50%': { transform: 'scale(1.2) rotate(180deg)', opacity: '0.8' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      fontFamily: {
        'unicorn': ['"Comic Sans MS"', 'cursive', 'sans-serif'], // Fun unicorn font (can be replaced with better web font)
      },
      boxShadow: {
        'rainbow': '0 4px 14px 0 rgba(255, 105, 180, 0.4)',
        'rainbow-lg': '0 10px 40px 0 rgba(255, 105, 180, 0.5)',
        'unicorn': '0 0 20px rgba(147, 112, 219, 0.6), 0 0 40px rgba(255, 105, 180, 0.4)',
      },
    },
  },
  plugins: [],
}
