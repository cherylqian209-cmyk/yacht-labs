import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#0a0a0a',
          secondary: '#111111',
          tertiary: '#1a1a1a',
        },
        text: {
          primary: '#ffffff',
          secondary: '#888888',
          muted: '#555555',
        },
        border: {
          primary: '#222222',
          secondary: '#2a2a2a',
        },
        accent: {
          purple: '#8b5cf6',
          teal: '#14b8a6',
          coral: '#f97316',
          pink: '#ec4899',
        },
        status: {
          success: '#22c55e',
          info: '#3b82f6',
          warning: '#f59e0b',
          error: '#ef4444',
        },
      },
      fontFamily: {
        mono: ['var(--font-space-mono)', 'Courier New', 'monospace'],
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        xl: '12px',
        '2xl': '16px',
      },
    },
  },
  plugins: [],
}

export default config
