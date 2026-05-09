import type { Config } from 'tailwindcss'

// Token set is intentionally minimal — design files will refine
// the cream/navy/red palette and the three-font system (display,
// body, mono). Treat this as scaffolding, not the final system.

const config: Config = {
  darkMode: ['class'],
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: 'hsl(var(--cream))',
        navy: 'hsl(var(--navy))',
        red: 'hsl(var(--red))',
        ink: 'hsl(var(--ink))',
        paper: 'hsl(var(--paper))',
      },
      fontFamily: {
        display: ['var(--font-display)', 'serif'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      container: {
        center: true,
        padding: '1.5rem',
        screens: { '2xl': '1280px' },
      },
    },
  },
  plugins: [],
} satisfies Config

export default config
