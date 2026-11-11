import { Card, Icon, LedgerField } from '../components/ui.jsx'
import Gauge from '../components/Gauge.jsx'
import { BASE_PROBABILITY, CLASSES, FEATURE_LABEL, PORTS, probableLifeboat, riskBand } from '../model/inference.js'

function designation({ sex, age }) {
  if (sex === 'male') return age <= 14 ? 'Jovem Master' : 'Cavalheiro'
  return age <= 14 ? 'Senhorita' : 'Dama'
}

/** Número de bilhete determinístico a partir do manifesto (mesmo passageiro → mesmo bilhete). */
function ticketNumber({ sex, age, pclass, family, embarked }, stamp) {
  const seed = (sex === 'male' ? 7 : 3) * 1009 + age * 97 + pclass * 4513 + family * 211 + embarked.charCodeAt(0) * 31 + stamp * 17
  return 24000 + (seed % 2000)
}

const fmtPoints = (v) => {
  const r = Math.round(v)
  if (r === 0) return v >= 0 ? '+0' : '−0'
  return r > 0 ? `+${r}` : `−${Math.abs(r)}`
}

export default function ResultPanel({ form, result, stamp }) {
  const { probability, contributions } = result
  const risk = riskBand(probability)
  const boat = probableLifeboat(probability, form)
  const klass = CLASSES[form.pclass]
  const port = PORTS[form.embarked]
  const sorted = [...contributions].sort((a, b) => Math.abs(b.points) - Math.abs(a.points))
  const maxAbs = Math.max(8, ...sorted.map((c) => Math.abs(c.points)))
  const danger = risk.tone === 'oxide'

  return (
    <>
      {/* Bilhete */}
      <Card tier="instrument" className="relative overflow-hidden p-space-md md:p-space-lg">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="flex items-center gap-2 text-label-sm uppercase text-gold">
              <Icon name="local_activity" className="text-[16px]" /> White Star Line Ticket
            </p>
            <p key={stamp} className="tabular mt-1 animate-rise font-serif text-headline-sm font-semibold text-parchment md:text-headline-md">
              Bilhete Nº {ticketNumber(form, stamp)} • Série AI
            </p>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-label-sm uppercase text-meta">Telemetria</p>
            <p className="mt-1 text-body-sm font-semibold text-cream">Classificado</p>
          </div>
        </div>

        <dl className="mt-space-md grid grid-cols-2 gap-x-4 gap-y-3 rounded-sm border border-gold/15 bg-plank p-3 md:p-4">
          <LedgerField label="Passageiro projetado" value={`${designation(form)} (${form.age}a) • ${klass.title}`} />
          <LedgerField label="Porto • Tarifa estimada" value={`${port.name} • ${klass.fare}`} accent align="right" />
          <LedgerField label="Acomodação teórica" value={klass.berth} />
          <LedgerField label="Matrícula de quarentena" value={form.embarked === 'Q' || form.pclass === 3 ? 'Inspeção de imigração' : 'Aprovado pelo oficial médico'} align="right" />
        </dl>

        <div className="perforation -mx-space-md my-space-lg md:-mx-space-lg" />

        {/* Medidor */}
        <p className="text-center text-label-sm uppercase text-cream">Estimativa de sobrevivência do modelo</p>
        <div className="mt-space-md">
          <Gauge probability={probability} size={210} />
        </div>
        <div className="mt-space-md flex flex-col items-center gap-2" aria-live="polite">
          <span
            className={`ticket-notch inline-flex items-center gap-1.5 px-3 py-1.5 text-label-sm uppercase ${
              danger ? 'bg-oxide-alert text-[#ffdad6]' : risk.tone === 'amber' ? 'bg-[#5d4201] text-gold-light' : 'bg-gold text-abyss'
            }`}
          >
            <Icon name={danger ? 'warning' : probability < 0.55 ? 'sailing' : 'verified_user'} className="text-[15px]" fill />
            {risk.label}
          </span>
          <p className="text-center text-body-sm text-cream">
            Bote provável: <strong className={boat.boat === 'Nenhum' ? 'text-oxide-soft' : 'text-gold-light'}>{boat.boat}</strong>
            <span className="text-meta"> ({boat.note}{boat.side ? ` · ${boat.side}` : ''})</span>
          </p>
        </div>
      </Card>

      {/* Pesos */}
      <Card className="p-space-md md:p-space-lg">
        <header className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <h3 className="text-label-md uppercase text-gold-light">Pesos de importância no algoritmo</h3>
          <span className="text-label-sm uppercase text-meta">Contribuições estilo SHAP</span>
        </header>
        <ul className="mt-space-md divide-y divide-gold/[0.08]">
          {sorted.map((c) => {
            const neg = c.points < 0
            const width = (Math.abs(c.points) / maxAbs) * 50
            return (
              <li key={c.feature} className="py-2.5">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="min-w-0 truncate text-body-sm text-parchment">{FEATURE_LABEL[c.feature](form)}</span>
                  <span className={`tabular shrink-0 text-label-md ${neg ? 'text-oxide-soft' : 'text-gold-light'}`}>
                    {fmtPoints(c.points)} p.p.
                  </span>
                </div>
                {/* Barra divergente centrada na probabilidade base */}
                <div className="relative mt-1.5 h-1.5 rounded-sm bg-[#283646]">
                  <span className="absolute inset-y-[-3px] left-1/2 w-px bg-gold/50" />
                  <span
                    className={`absolute inset-y-0 rounded-sm transition-all duration-500 ${neg ? 'bg-oxide-soft' : 'bg-gold'}`}
                    style={neg ? { right: '50%', width: `${width}%` } : { left: '50%', width: `${width}%` }}
                  />
                </div>
              </li>
            )
          })}
        </ul>
        <p className="tabular mt-space-sm text-body-sm text-meta">
          Base a bordo {Math.round(BASE_PROBABILITY * 100)}% {sorted.map((c) => ` ${fmtPoints(c.points)}`).join('')} ≈{' '}
          <span className="text-cream">{Math.round(probability * 100)}%</span>
        </p>
      </Card>

      {/* Contexto */}
      <Card className="p-space-md md:p-space-lg">
        <h3 className="flex items-start gap-2 font-serif text-headline-sm font-medium text-gold-light">
          <Icon name="menu_book" className="mt-1 text-[20px] text-gold" />
          Contexto histórico real · 14–15 de Abril
        </h3>
        <p className="mt-space-sm text-body-sm text-cream">
          Havia <strong className="text-parchment">2.224 almas a bordo</strong> e apenas 20 embarcações de salvamento, com capacidade para
          1.178 ocupantes. Apenas <strong className="text-parchment">cerca de 710 pessoas sobreviveram</strong> no Atlântico Norte durante as
          2 horas e 40 minutos entre a colisão com o iceberg e o afundamento final.
        </p>
      </Card>
    </>
  )
}
