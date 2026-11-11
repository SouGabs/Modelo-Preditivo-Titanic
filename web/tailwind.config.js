/** Tokens extraídos de DESIGN.md — "Transatlantic Oceanic Registry" */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    screens: { sm: '480px', md: '768px', lg: '1024px', xl: '1280px', '2xl': '1440px' },
    extend: {
      colors: {
        // Superfícies
        abyss: '#0A131E', // Elevation 0 — Deck Ground
        surface: '#061423',
        plank: '#111E2E', // Elevation 1 — Manifest Planks
        instrument: '#162538', // Elevation 2 — Inspection Drawers
        trough: '#0B1522', // Input fields
        slate: '#1B263B', // Secondary — Abyssal Slate
        trench: '#0D1B2A', // Neutral — Midnight Trench
        // Acentos
        gold: { DEFAULT: '#C5A059', light: '#E9C176', bright: '#E0BE7A', hover: '#D6B26A', deep: '#9E7B35' },
        oxide: { DEFAULT: '#8B3A3A', soft: '#FFB3B0', alert: '#93000A' },
        // Texto
        parchment: '#F4EFE6',
        cream: '#C4BCB1',
        meta: '#6F7D8E',
        outline: '#9a8f80',
      },
      fontFamily: {
        serif: ['"EB Garamond"', 'Georgia', 'serif'],
        sans: ['Manrope', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        display: ['3.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '400' }],
        'headline-lg': ['2.5rem', { lineHeight: '1.2', letterSpacing: '-0.01em', fontWeight: '500' }],
        'headline-lg-mobile': ['2rem', { lineHeight: '1.25', letterSpacing: '0em', fontWeight: '500' }],
        'headline-md': ['1.875rem', { lineHeight: '1.3', fontWeight: '500' }],
        'headline-sm': ['1.375rem', { lineHeight: '1.4', letterSpacing: '0.01em', fontWeight: '600' }],
        'title-md': ['1.125rem', { lineHeight: '1.5', letterSpacing: '0.015em', fontWeight: '600' }],
        'body-lg': ['1.0625rem', { lineHeight: '1.6' }],
        'body-md': ['0.9375rem', { lineHeight: '1.55' }],
        'body-sm': ['0.8125rem', { lineHeight: '1.5', letterSpacing: '0.01em' }],
        'label-lg': ['0.875rem', { lineHeight: '1.4', letterSpacing: '0.06em', fontWeight: '600' }],
        'label-md': ['0.75rem', { lineHeight: '1.35', letterSpacing: '0.08em', fontWeight: '600' }],
        'label-sm': ['0.6875rem', { lineHeight: '1.3', letterSpacing: '0.12em', fontWeight: '700' }],
      },
      borderRadius: { sm: '0.125rem', DEFAULT: '0.25rem', md: '0.375rem', lg: '0.5rem', xl: '0.75rem' },
      spacing: {
        gutter: '1.5rem',
        'gutter-mobile': '1rem',
        margin: '3rem',
        'margin-mobile': '1.25rem',
        'space-xs': '0.25rem',
        'space-sm': '0.5rem',
        'space-md': '1rem',
        'space-lg': '1.5rem',
        'space-xl': '2.5rem',
      },
      maxWidth: { registry: '1440px' },
      boxShadow: {
        bevel: 'inset 0 1px 0 0 rgba(197,160,89,0.25)',
        'bevel-strong': 'inset 0 1px 0 0 rgba(255,230,170,0.55)',
        instrument: '0 12px 32px -4px rgba(4,8,15,0.75), inset 0 1px 0 0 rgba(197,160,89,0.25)',
        trough: 'inset 0 2px 4px rgba(0,0,0,0.5)',
      },
    },
  },
  plugins: [],
}
