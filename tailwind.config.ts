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
        // Dark-friendly system colors tuned for the canvas environments
        background: '#020617', // deep background (slate-950-ish)
        surface: '#020617', // primary card surface (slate-900-ish)
        'surface-accent': '#111827', // slightly elevated surface
        'primary-text': '#E5E7EB', // light text on dark
        'secondary-text': '#9CA3AF',
        'tertiary-text': '#6B7280',
        brand: '#3B82F6',
        'brand-hover': '#2563EB',
        'border-color': '#1F2937',
      },
    },
  },
};

export default config;
