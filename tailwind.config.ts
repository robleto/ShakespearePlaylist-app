import type { Config } from 'tailwindcss'

// Tailwind extends the design tokens declared in globals.css. The CSS
// classes there (.page, .runner, .spec, .stamp, etc.) are the canonical
// component layer; Tailwind utilities sit on top for layout/spacing.

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: 'var(--paper)',
        'paper-deep': 'var(--paper-deep)',
        'paper-edge': 'var(--paper-edge)',
        ink: 'var(--ink)',
        'ink-soft': 'var(--ink-soft)',
        'ink-faint': 'var(--ink-faint)',
        'ink-hair': 'var(--ink-hair)',
        vermilion: 'var(--vermilion)',
      },
      fontFamily: {
        display: ['var(--font-display)', 'serif'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
} satisfies Config

export default config
