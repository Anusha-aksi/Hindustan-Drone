/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  safelist: ['bg-white/30'],
  theme: {
    extend: {
      colors: {
        brand: {
          primary:      '#016E78',
          'primary-hover': '#015F69',
          'primary-active': '#015060',
          'primary-light': '#14adb8',
          'primary-border': '#017C87',
          'primary-muted': '#F0F9FA',
          white:        '#ffffff',
          'text-main':  '#101829',
          'text-sub':   '#17191b',
          'text-faint': '#0d0e0f',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        brand: '0 4px 24px 0 rgba(1,110,120,0.10)',
      },
      keyframes: {
        'fade-in-down': {
          '0%':   { opacity: '0', transform: 'translateX(-50%) translateY(-8px)' },
          '100%': { opacity: '1', transform: 'translateX(-50%) translateY(0)' },
        },
        'bell-ring': {
          '0%,100%': { transform: 'rotate(0deg)' },
          '10%':     { transform: 'rotate(18deg)' },
          '20%':     { transform: 'rotate(-16deg)' },
          '30%':     { transform: 'rotate(14deg)' },
          '40%':     { transform: 'rotate(-10deg)' },
          '50%':     { transform: 'rotate(6deg)' },
          '60%':     { transform: 'rotate(-4deg)' },
          '70%':     { transform: 'rotate(2deg)' },
          '80%':     { transform: 'rotate(0deg)' },
        },
        'glow-pulse': {
          '0%,100%': { boxShadow: '0 0 0 0   rgba(1,110,120,0.55)' },
          '50%':     { boxShadow: '0 0 0 8px rgba(1,110,120,0)' },
        },
      },
      animation: {
        'bell-ring':    'bell-ring 2.2s ease-in-out infinite',
        'glow-pulse':   'glow-pulse 1.8s ease-in-out infinite',
        'fade-in-down': 'fade-in-down 0.2s ease both',
      },
    },
  },
  plugins: [],
}
