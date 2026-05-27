/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Toggle dark/light modes dynamically
  theme: {
    extend: {
      colors: {
        cyber: {
          dark: '#030712',      // Deepest midnight blue-black
          darker: '#020617',    // Pure void
          card: 'rgba(17, 24, 39, 0.45)', // Translucent glass backdrop
          light: '#f8fafc',
          text: '#94a3b8',
          glow: '#06b6d4'
        },
        neon: {
          cyan: '#22d3ee',      // Futuristic cyan
          emerald: '#34d399',   // Vitals green
          purple: '#a78bfa',    // Nano purple
          indigo: '#818cf8',    // Deep mind indigo
          crimson: '#f87171',   // Emergency red
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
        mono: ['Fira Code', 'Courier New', 'monospace'],
      },
      backdropBlur: {
        xs: '2px',
        cyber: '12px',
      },
      boxShadow: {
        'neon-cyan': '0 0 15px rgba(34, 211, 238, 0.3)',
        'neon-emerald': '0 0 15px rgba(52, 211, 153, 0.3)',
        'neon-crimson': '0 0 15px rgba(248, 113, 113, 0.45)',
        'neon-purple': '0 0 15px rgba(167, 139, 250, 0.3)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow-pulse': 'glowPulse 2s infinite alternate',
        'float': 'float 4s ease-in-out infinite',
      },
      keyframes: {
        glowPulse: {
          '0%': { boxShadow: '0 0 5px rgba(6, 182, 212, 0.2)' },
          '100%': { boxShadow: '0 0 20px rgba(6, 182, 212, 0.6)' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' }
        }
      }
    },
  },
  plugins: [],
}
