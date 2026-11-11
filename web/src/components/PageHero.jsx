import { Chip } from './ui.jsx'

/**
 * Cabeçalho de página: chip opcional + sobretítulo, título em serifa e parágrafo de introdução (children).
 * @param {{eyebrow: string, title: string, chip?: string, children: React.ReactNode}} props
 */
export default function PageHero({ eyebrow, title, children, chip }) {
  return (
    <section className="border-b border-gold/10 bg-surface">
      <div className="mx-auto max-w-registry px-margin-mobile py-space-lg md:px-8 lg:px-margin lg:py-space-xl">
        <div className="flex flex-wrap items-center gap-3 text-label-sm uppercase text-cream">
          {chip && <Chip tone="slate">{chip}</Chip>}
          <span>{eyebrow}</span>
        </div>
        <h1 className="mt-space-md font-serif text-headline-lg-mobile text-gold-light md:text-headline-lg xl:text-display">{title}</h1>
        <p className="mt-space-sm max-w-3xl text-body-md text-cream lg:text-body-lg">{children}</p>
      </div>
    </section>
  )
}

/**
 * Linha de barra horizontal para ledgers de taxas.
 * @param {{label: string, value: number, sub?: string, tone?: 'gold'|'oxide'}} props `value` é uma fração em [0, 1].
 */
export function RateRow({ label, value, sub, tone = 'gold' }) {
  return (
    <li className="group relative py-3 pl-3 transition-colors hover:bg-instrument">
      <span className="absolute left-0 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-gold opacity-0 transition-opacity group-hover:opacity-100" />
      <div className="flex items-baseline justify-between gap-3 pr-1">
        <span className="text-body-sm text-parchment">
          {label}
          {sub && <span className="ml-2 text-meta">{sub}</span>}
        </span>
        <span className={`tabular text-label-lg ${tone === 'oxide' ? 'text-oxide-soft' : 'text-gold-light'}`}>{Math.round(value * 100)}%</span>
      </div>
      <div className="mt-2 h-1.5 rounded-sm bg-[#283646]">
        <div className={`h-full rounded-sm ${tone === 'oxide' ? 'bg-oxide-soft' : 'bg-gold'}`} style={{ width: `${value * 100}%` }} />
      </div>
    </li>
  )
}
