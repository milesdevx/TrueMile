import type { Config } from 'tailwindcss';

/**
 * TrueMile design tokens — a vehicle title certificate, not a fintech dashboard.
 *
 * Three semantic colors carry the meaning and are reused consistently:
 *   seal    — verified / public result (brass)
 *   sealed  — private, hidden data (chrome-teal)
 *   signal  — take-action CTA (amber turn signal)
 * No fourth accent is introduced.
 */
const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        ground: 'rgb(var(--ground) / <alpha-value>)',
        panel: 'rgb(var(--panel) / <alpha-value>)',
        panel2: 'rgb(var(--panel2) / <alpha-value>)',
        line: 'rgb(var(--line) / <alpha-value>)',
        bone: 'rgb(var(--bone) / <alpha-value>)',
        dim: 'rgb(var(--dim) / <alpha-value>)',
        faint: 'rgb(var(--faint) / <alpha-value>)',
        seal: 'rgb(var(--seal) / <alpha-value>)',
        sealed: 'rgb(var(--sealed) / <alpha-value>)',
        signal: 'rgb(var(--signal) / <alpha-value>)',
        danger: 'rgb(var(--danger) / <alpha-value>)',
        /** Text that sits on a signal/seal/danger fill — flips per theme. */
        onaccent: 'rgb(var(--onaccent) / <alpha-value>)',
      },
      fontFamily: {
        display: [
          'var(--font-barlow-condensed)',
          'ui-sans-serif',
          'system-ui',
          'sans-serif',
        ],
        sans: [
          'var(--font-inter-tight)',
          'ui-sans-serif',
          'system-ui',
          'sans-serif',
        ],
        mono: [
          'var(--font-jetbrains-mono)',
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'monospace',
        ],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [],
};

export default config;
