/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        // Brand - verde signature
        brand: {
          50: '#f0fdf4', 100: '#dcfce7', 200: '#bbf7d0', 300: '#86efac',
          400: '#4ade80', 500: '#00C853', 600: '#00A844', 700: '#008836',
          800: '#006828', 900: '#00481A', 950: '#0a2e1a',
        },
        // Tierra - NUEVA paleta identidad latina
        earth: {
          50: '#faf7f2', 100: '#f0e9dc', 200: '#e1d3b8', 300: '#d0b68a',
          400: '#b8915a', 500: '#8B6F47', 600: '#6f563a', 700: '#574330',
          800: '#3D2E1A', 900: '#2a1f10', 950: '#17110a',
        },
        // Terracota - acento cálido
        terra: {
          50: '#fdf4ef', 100: '#fae5d8', 200: '#f3c9a8', 300: '#eba474',
          400: '#e07f4a', 500: '#c95a28', 600: '#a8471d', 700: '#85371a',
          800: '#67291a', 900: '#4a1d14', 950: '#2a0f0a',
        },
        // Surface (dark theme)
        surface: {
          0: '#000000', 50: '#0a0a0a', 100: '#111111', 150: '#171717',
          200: '#1c1c1c', 300: '#262626', 400: '#333333', 500: '#555555',
          600: '#777777', 700: '#999999', 800: '#bbbbbb', 900: '#e5e5e5', 950: '#f5f5f5',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'grid-pattern': 'linear-gradient(rgba(255,255,255,.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.03) 1px, transparent 1px)',
        'suelo-gradient': 'linear-gradient(135deg, #00C853 0%, #8B6F47 100%)',
      },
      backgroundSize: { grid: '60px 60px' },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out forwards',
        'slide-up': 'slideUp 0.6s ease-out forwards',
        'slide-down': 'slideDown 0.3s ease-out forwards',
        'scale-in': 'scaleIn 0.3s ease-out forwards',
        'pulse-soft': 'pulseSoft 3s ease-in-out infinite',
        'grow': 'grow 4s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { opacity: '0', transform: 'translateY(20px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        slideDown: { '0%': { opacity: '0', transform: 'translateY(-10px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        scaleIn: { '0%': { opacity: '0', transform: 'scale(0.95)' }, '100%': { opacity: '1', transform: 'scale(1)' } },
        pulseSoft: { '0%, 100%': { opacity: '1' }, '50%': { opacity: '0.7' } },
        grow: {
          '0%, 100%': { transform: 'scale(1) rotate(0deg)' },
          '50%': { transform: 'scale(1.03) rotate(1deg)' },
        },
      },
    },
  },
  plugins: [],
};
