/** Componentes atômicos do design system "Transatlantic Oceanic Registry". */

export function Icon({ name, className = '', fill = false, label }) {
  return (
    <span className={`icon ${fill ? 'icon-fill' : ''} ${className}`} aria-hidden={label ? undefined : true} aria-label={label}>
      {name}
    </span>
  )
}

/** Cartão "Manifest Plank" (Elevation 1) ou "Instrument" (Elevation 2). */
export function Card({ as: Tag = 'section', tier = 'plank', className = '', children, ...rest }) {
  return (
    <Tag className={`${tier === 'instrument' ? 'card-instrument' : 'card-plank'} ${className}`} {...rest}>
      {children}
    </Tag>
  )
}

/** Cabeçalho de seção estampado: ícone dourado + rótulo uppercase + metadado à direita. */
export function SectionHeader({ icon, title, meta, className = '' }) {
  return (
    <header className={`flex items-start justify-between gap-3 ${className}`}>
      <h2 className="flex items-center gap-2 text-label-md uppercase text-gold-light">
        {icon && <Icon name={icon} className="text-[18px] text-gold" />}
        <span>{title}</span>
      </h2>
      {meta && <span className="shrink-0 text-right text-label-sm font-semibold uppercase text-meta">{meta}</span>}
    </header>
  )
}

/** Telemetry Tag: chip com faixa lateral de 2px (ouro = nominal, oxide = anomalia, slate = histórico). */
export function Chip({ tone = 'gold', children, className = '' }) {
  const strip = { gold: 'border-l-gold', oxide: 'border-l-oxide-soft', slate: 'border-l-[#bbc6e2]' }[tone]
  const text = { gold: 'text-gold-light', oxide: 'text-oxide-soft', slate: 'text-[#bbc6e2]' }[tone]
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-sm border border-gold/15 border-l-2 ${strip} bg-plank px-2 py-1 text-label-sm uppercase ${text} ${className}`}>
      {children}
    </span>
  )
}

export function StatusDot({ className = '' }) {
  return (
    <span className={`relative inline-flex h-1.5 w-1.5 ${className}`}>
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold opacity-50" />
      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-gold" />
    </span>
  )
}

export function GildedButton({ children, className = '', ...rest }) {
  return (
    <button type="button" className={`btn-gilded ${className}`} {...rest}>
      {children}
    </button>
  )
}

/** Nota explicativa com ícone (rodapé dos campos). */
export function FieldNote({ icon = 'info', children }) {
  return (
    <p className="mt-space-md flex items-start gap-2.5 rounded-sm border border-gold/10 bg-trough/60 px-3 py-2.5 text-body-sm text-cream">
      <Icon name={icon} className="mt-px text-[16px] text-gold/80" />
      <span>{children}</span>
    </p>
  )
}

/** Radio de anel náutico concêntrico (DESIGN.md §5). */
export function BrassRadio({ checked, onDark = true }) {
  return (
    <span
      aria-hidden
      className={`grid h-[18px] w-[18px] shrink-0 place-items-center rounded-full border ${
        checked ? 'border-abyss/70' : onDark ? 'border-gold/40 bg-trough' : 'border-gold/40'
      }`}
    >
      <span className={`h-2 w-2 rounded-full transition-transform ${checked ? 'scale-100 bg-abyss' : 'scale-0'}`} />
    </span>
  )
}

/** Par chave–valor de ledger. */
export function LedgerField({ label, value, accent = false, align = 'left' }) {
  return (
    <div className={align === 'right' ? 'text-right' : ''}>
      <dt className="text-label-sm uppercase text-meta">{label}</dt>
      <dd className={`mt-1 text-body-md font-semibold leading-snug ${accent ? 'text-gold-light' : 'text-parchment'}`}>{value}</dd>
    </div>
  )
}
