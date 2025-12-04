import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './index.html',
    './index.tsx',
    './App.tsx',
    './components/**/*.{ts,tsx}',
    './hooks/**/*.{ts,tsx}',
    './services/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Inter', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
        mono: ['"Azeret Mono"', 'monospace'],
      },
      colors: {
        background: '#F7F7F8',
        surface: '#FFFFFF',
        'surface-accent': '#F0F0F1',
        'primary-text': '#1A1B1E',
        'secondary-text': '#6B6B6B',
        'tertiary-text': '#A0A0A0',
        brand: '#3B82F6',
        'brand-hover': '#2563EB',
        'border-color': '#E5E7EB',
      },
    },
  },
};

export default config;
