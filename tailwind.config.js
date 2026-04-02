/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eef7ff',
          100: '#d9edff',
          200: '#bbdeff',
          300: '#8ac7ff',
          400: '#52a6ff',
          500: '#2a83ff',
          600: '#0f62f5',
          700: '#0f4edb',
          800: '#133fb1',
          900: '#153a8b',
          950: '#112554',
        },
        brand: {
          navy: '#0f2d5a',
          blue: '#1a56db',
          teal: '#0ea5a0',
          green: '#0f9e6e',
          amber: '#f59e0b',
          red: '#dc2626',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-sora)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jetbrains)', 'monospace'],
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0,0,0,0.08), 0 1px 2px -1px rgba(0,0,0,0.06)',
        'card-hover': '0 10px 30px -5px rgba(15,45,90,0.12)',
        'sidebar': '2px 0 20px rgba(15,45,90,0.08)',
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #0f2d5a 0%, #1a56db 50%, #0ea5a0 100%)',
        'gradient-card': 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(238,247,255,0.9) 100%)',
      },
    },
  },
  plugins: [],
};
