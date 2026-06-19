import type { Config } from 'tailwindcss';
import tailwindcssAnimate from 'tailwindcss-animate';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    // 8px spacing system: all values are multiples of 8px
    spacing: {
      '0': '0px',
      '1': '8px',
      '2': '16px',
      '3': '24px',
      '4': '32px',
      '5': '40px',
      '6': '48px',
      '7': '56px',
      '8': '64px',
      '9': '72px',
      '10': '80px',
      '11': '88px',
      '12': '96px',
      '13': '104px',
      '14': '112px',
      '15': '120px',
      '16': '128px',
      'px': '1px',
      '0.5': '4px',
    },
    screens: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1440px',
    },
    extend: {
      colors: {
        brand: {
          blue: '#024EA3',
          'dark-blue': '#011930',
          navy: '#001B33',
          green: '#7AC146',
          'green-alt': '#6FB639',
          'neon-green': '#9BE564',
          'light-gray': '#F4F6F9',
        },
      },
      borderRadius: {
        'card': '22px',
        'btn': '16px',
        'input': '14px',
        'modal': '24px',
      },
      boxShadow: {
        'card': '0 3px 12px rgba(0, 0, 0, 0.12)',
        'card-hover': '0 8px 24px rgba(0, 0, 0, 0.15)',
        'elevated': '0 4px 16px rgba(0, 0, 0, 0.1)',
        'btn': '0 2px 8px rgba(2, 78, 163, 0.2)',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        // Typographic hierarchy — mobile-first responsive sizes
        // h1: 2rem (32px) mobile → 3.5rem desktop (via responsive utilities)
        'h1': ['2rem', { lineHeight: '1.15', fontWeight: '800', letterSpacing: '-0.02em' }],
        // h2: 1.5rem (24px) mobile → 2.5rem desktop
        'h2': ['1.5rem', { lineHeight: '1.2', fontWeight: '700', letterSpacing: '-0.01em' }],
        // h3: 1.25rem (20px) mobile → 1.75rem desktop
        'h3': ['1.25rem', { lineHeight: '1.3', fontWeight: '600' }],
        // h4: 1.125rem (18px) mobile — satisfies min 18px heading requirement
        'h4': ['1.125rem', { lineHeight: '1.4', fontWeight: '600' }],
        // body: 1rem (16px) — satisfies min 14px body requirement
        'body': ['1rem', { lineHeight: '1.6', fontWeight: '400' }],
        'body-lg': ['1.125rem', { lineHeight: '1.6', fontWeight: '400' }],
        // small: 0.875rem (14px) — minimum readable size
        'small': ['0.875rem', { lineHeight: '1.5', fontWeight: '400' }],
        'caption': ['0.75rem', { lineHeight: '1.4', fontWeight: '500' }],
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, #011930 0%, #001B33 100%)',
        'footer-gradient': 'linear-gradient(180deg, #011930 0%, #001B33 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.6s ease-out',
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
    },
  },
  plugins: [tailwindcssAnimate],
};

export default config;
