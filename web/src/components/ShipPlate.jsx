/**
 * Placa ilustrada do transatlântico — silhueta vetorial original em latão sobre mar noturno
 * (substitui fotografias externas; renderiza offline e nítida em qualquer densidade).
 * @param {{caption?: string, title?: string, badge?: string, className?: string, compact?: boolean}} props
 *   `badge` vazio oculta o selo; `compact` reduz a altura da ilustração.
 */
export default function ShipPlate({ caption = 'Royal Mail Steamer Titanic', title = 'Casco nº 401 • 46.328 Toneladas', badge = 'Harland & Wolff', className = '', compact = false }) {
  const portholes = Array.from({ length: 34 }, (_, i) => i)
  const stars = [[30, 22], [90, 40], [140, 16], [210, 34], [280, 12], [350, 44], [420, 20], [470, 52], [520, 18], [585, 38], [60, 64], [380, 70], [250, 60]]
  return (
    <figure className={`relative overflow-hidden rounded border border-gold/25 bg-[#07111c] shadow-bevel ${className}`}>
      <svg viewBox="0 0 600 260" preserveAspectRatio="xMidYMid slice" className={`block w-full ${compact ? 'h-[150px]' : 'h-[190px] lg:h-[210px]'}`} aria-hidden>
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#050c15" />
            <stop offset="1" stopColor="#0c1a2a" />
          </linearGradient>
          <linearGradient id="sea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#0d1d2f" />
            <stop offset="1" stopColor="#040a12" />
          </linearGradient>
          <linearGradient id="hull" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#1d2a3a" />
            <stop offset="1" stopColor="#0a121c" />
          </linearGradient>
          <linearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0.45" stopColor="#07111c" stopOpacity="0" />
            <stop offset="1" stopColor="#07111c" stopOpacity="0.95" />
          </linearGradient>
        </defs>
        <rect width="600" height="260" fill="url(#sky)" />
        {stars.map(([x, y], i) => <circle key={i} cx={x} cy={y} r={i % 3 ? 0.8 : 1.3} fill="#F4EFE6" opacity={0.35 + (i % 4) * 0.12} />)}
        <circle cx="520" cy="46" r="13" fill="none" stroke="rgba(197,160,89,.25)" />
        <rect y="168" width="600" height="92" fill="url(#sea)" />
        {/* Iceberg ao longe */}
        <path d="M18 170 L40 140 L52 150 L66 128 L84 170 Z" fill="#1a2c40" stroke="rgba(214,228,249,.18)" />
        <g transform="translate(110 0)">
          {/* Chaminés */}
          {[0, 1, 2, 3].map((i) => (
            <g key={i} transform={`translate(${118 + i * 62} 0)`}>
              <path d="M0 108 L4 58 L28 58 L30 108 Z" fill="#b58a3f" opacity={i === 3 ? 0.75 : 1} />
              <rect x="3.5" y="58" width="25" height="10" fill="#0a121c" />
              <path d="M8 56 q6 -16 -2 -30" stroke="rgba(196,188,177,.12)" strokeWidth="8" fill="none" />
            </g>
          ))}
          {/* Mastros e cordame */}
          <line x1="60" y1="40" x2="60" y2="118" stroke="#C5A059" strokeWidth="1.4" />
          <line x1="410" y1="44" x2="410" y2="118" stroke="#C5A059" strokeWidth="1.4" />
          <path d="M60 42 L410 46" stroke="rgba(197,160,89,.35)" strokeWidth=".8" />
          {/* Superestrutura */}
          <path d="M80 108 L380 108 L380 126 L80 126 Z" fill="#1b2635" stroke="rgba(197,160,89,.35)" />
          {/* Casco */}
          <path d="M0 126 L452 126 L440 172 L22 172 Q8 150 0 126 Z" fill="url(#hull)" stroke="#C5A059" strokeWidth="1" />
          <line x1="6" y1="136" x2="448" y2="136" stroke="#C5A059" strokeWidth=".8" opacity=".7" />
          {/* Vigias iluminadas */}
          {portholes.map((i) => (
            <circle key={i} cx={30 + i * 12.2} cy={146} r="1.6" fill="#F3D9A0" opacity={i % 5 === 2 ? 0.4 : 0.95} />
          ))}
          {portholes.slice(0, 26).map((i) => (
            <rect key={`w${i}`} x={92 + i * 11} y={114} width="5" height="3" fill="#E9C176" opacity={i % 4 === 1 ? 0.35 : 0.85} />
          ))}
          {/* Reflexo */}
          <path d="M30 178 L430 178" stroke="rgba(233,193,118,.18)" strokeWidth="2" strokeDasharray="14 9" />
          <path d="M60 188 L400 188" stroke="rgba(233,193,118,.1)" strokeWidth="2" strokeDasharray="8 12" />
        </g>
        <rect width="600" height="260" fill="url(#fade)" />
      </svg>
      <figcaption className="absolute inset-x-0 bottom-0 flex flex-wrap items-end justify-between gap-2 p-space-md">
        <div className="min-w-0">
          <p className="text-label-sm uppercase text-gold">{caption}</p>
          <p className="font-serif text-headline-sm font-medium text-parchment">{title}</p>
        </div>
        {badge && <span className="rounded-sm border border-gold/30 bg-slate/80 px-2 py-1 text-label-sm uppercase text-cream">{badge}</span>}
      </figcaption>
    </figure>
  )
}
