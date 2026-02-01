/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Cyberpunk theme
        neon: {
          pink: '#FF006E',
          blue: '#00F5FF',
          purple: '#8B5CF6',
          green: '#00FF41',
          yellow: '#FFFF00',
        },
        // Glassmorphism backgrounds
        glass: {
          light: 'rgba(255, 255, 255, 0.1)',
          dark: 'rgba(0, 0, 0, 0.3)',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'cyberpunk': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'neon-pink': 'linear-gradient(135deg, #FF006E 0%, #8B5CF6 100%)',
        'neon-blue': 'linear-gradient(135deg, #00F5FF 0%, #667eea 100%)',
      },
      animation: {
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'slide-in': 'slide-in 0.3s ease-out',
        'scale-in': 'scale-in 0.2s ease-out',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        'glow-pulse': {
          '0%, 100%': {
            opacity: 1,
            boxShadow: '0 0 20px rgba(139, 92, 246, 0.5)',
          },
          '50%': {
            opacity: 0.8,
            boxShadow: '0 0 40px rgba(139, 92, 246, 0.8)',
          },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'slide-in': {
          '0%': { transform: 'translateY(-100%)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
        'scale-in': {
          '0%': { transform: 'scale(0.9)', opacity: 0 },
          '100%': { transform: 'scale(1)', opacity: 1 },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
      },
      boxShadow: {
        'neon-pink': '0 0 20px rgba(255, 0, 110, 0.5)',
        'neon-blue': '0 0 20px rgba(0, 245, 255, 0.5)',
        'neon-purple': '0 0 20px rgba(139, 92, 246, 0.5)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
