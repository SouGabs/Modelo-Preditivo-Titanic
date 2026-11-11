import { useMemo, useRef, useState } from 'react'
import { BrassRadio, Card, Chip, FieldNote, GildedButton, Icon, SectionHeader, StatusDot } from '../components/ui.jsx'
import ShipPlate from '../components/ShipPlate.jsx'
import ResultPanel from './ResultPanel.jsx'
import { CLASSES, MODEL, PORTS, predict } from '../model/inference.js'

const DEFAULT = { sex: 'male', age: 29, pclass: 3, family: 0, embarked: 'S' }
const FAMILY_OPTIONS = [0, 1, 2, 3, 4, 5, 6]
const pct = (v) => `${Math.round(v * 100)}%`
const clampAge = (v) => Math.min(80, Math.max(1, Math.round(v)))

/** Botão de opção acessível (radio) com estado dourado ativo. */
function Option({ checked, onSelect, className = '', children, label }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={checked}
      aria-label={label}
      onClick={onSelect}
      className={`group relative rounded border text-left transition-all duration-150 ${checked ? 'option-active' : 'option-idle'} ${className}`}
    >
      {children}
    </button>
  )
}

export default function Simulator({ accuracy }) {
  const [form, setForm] = useState(DEFAULT)
  const [stamp, setStamp] = useState(0)
  const resultRef = useRef(null)
  const set = (patch) => setForm((f) => ({ ...f, ...patch }))

  const result = useMemo(() => predict(form), [form])
  // Cenários contrafactuais: o que o modelo diria se cada opção fosse escolhida
  const whatIf = useMemo(() => ({
    sex: { female: predict({ ...form, sex: 'female' }).probability, male: predict({ ...form, sex: 'male' }).probability },
    pclass: Object.fromEntries([1, 2, 3].map((c) => [c, predict({ ...form, pclass: c }).probability])),
    embarked: Object.fromEntries(['S', 'C', 'Q'].map((e) => [e, predict({ ...form, embarked: e }).probability])),
  }), [form])

  const ds = MODEL.dataset
  const agePct = ((form.age - 1) / 79) * 100

  const register = () => {
    setStamp((s) => s + 1)
    if (window.matchMedia('(max-width: 1023px)').matches) {
      resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <>
      {/* ── Hero ───────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-gold/10 bg-surface">
        <svg className="pointer-events-none absolute -right-24 -top-10 hidden h-[420px] w-[420px] opacity-[0.07] lg:block" viewBox="0 0 200 200" aria-hidden>
          <circle cx="100" cy="100" r="96" fill="none" stroke="#C5A059" />
          <circle cx="100" cy="100" r="70" fill="none" stroke="#C5A059" />
          {Array.from({ length: 32 }, (_, i) => (
            <line key={i} x1="100" y1="4" x2="100" y2={i % 4 ? 14 : 26} stroke="#C5A059" transform={`rotate(${i * 11.25} 100 100)`} />
          ))}
          <path d="M100 30 L108 100 L100 170 L92 100Z" fill="none" stroke="#C5A059" />
        </svg>
        <div className="relative mx-auto max-w-registry px-margin-mobile py-space-lg md:px-8 lg:px-margin lg:py-space-xl">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-label-sm uppercase">
            <Chip><StatusDot /> <span className="tabular">ML Ativo · Acurácia {accuracy}%</span></Chip>
            <span className="text-cream">10 de Abril de 1912</span>
            <span className="hidden text-meta sm:inline">•</span>
            <span className="hidden text-cream sm:inline">Southampton</span>
            <span className="hidden text-meta md:inline">•</span>
            <span className="hidden text-cream md:inline">Protocolo Lloyd's de Londres</span>
          </div>
          <div className="mt-space-md grid gap-space-lg lg:grid-cols-12 lg:items-end lg:gap-gutter">
            <div className="lg:col-span-8">
              <h1 className="font-serif text-headline-lg-mobile text-gold-light md:text-headline-lg xl:text-display">
                <span className="md:hidden">Manifesto &amp; Inferência</span>
                <span className="hidden md:inline">Manifesto de Passageiro &amp; Inferência Estatística</span>
              </h1>
              <p className="mt-space-sm max-w-2xl text-body-md text-cream lg:text-body-lg">
                Preencha as características do passageiro para estimar a probabilidade de sobrevivência ao naufrágio.
                O modelo Gradient Boosted Trees foi treinado sobre os manifestos de bordo e registros de perda da White Star Line.
              </p>
            </div>
            <dl className="grid grid-cols-2 divide-x divide-gold/15 rounded border border-gold/20 bg-plank/80 shadow-bevel lg:col-span-4">
              <div className="px-4 py-3">
                <dt className="text-label-sm uppercase text-meta">Dataset de treino</dt>
                <dd className="tabular mt-1 text-title-md text-parchment">{ds.rows.toLocaleString('pt-BR')} registros</dd>
              </div>
              <div className="px-4 py-3">
                <dt className="text-label-sm uppercase text-meta">Matriz decisória</dt>
                <dd className="mt-1 text-title-md leading-snug text-gold-light">Gradient Boosted Trees</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-registry px-margin-mobile pt-space-lg md:px-8 lg:px-margin lg:pt-space-xl">
        <ShipPlate className="mb-space-lg lg:hidden" compact caption="Arquivo telegráfico RMS Titanic" title="Registro Nº 401" badge={null} />

        <div className="grid gap-space-lg lg:grid-cols-12 lg:gap-gutter">
          {/* ── Formulário ─────────────────────────────────── */}
          <form className="flex flex-col gap-space-md min-w-0 lg:col-span-7 lg:gap-space-lg" onSubmit={(e) => { e.preventDefault(); register() }}>
            <div className="hidden items-center justify-between rounded border border-gold/15 bg-plank px-5 py-4 lg:flex">
              <h2 className="flex items-center gap-2 text-label-lg uppercase text-parchment">
                <Icon name="tune" className="text-[20px] text-gold" /> Variáveis demográficas &amp; embarque
              </h2>
              <span className="text-label-sm uppercase text-meta">Entrada de parâmetros</span>
            </div>

            {/* Gênero */}
            <Card className="p-space-md md:p-space-lg">
              <SectionHeader icon="wc" title="Gênero / Sexo" meta={<span className="tabular">Fem. {pct(whatIf.sex.female)} · Masc. {pct(whatIf.sex.male)}</span>} />
              <p className="mt-2 text-body-sm text-cream">
                A regra marítima <em className="font-serif text-[1rem] text-parchment">“Women and children first”</em> governou o acesso
                prioritário aos botes de bombordo e estibordo.
              </p>
              <div role="radiogroup" aria-label="Gênero" className="mt-space-md grid grid-cols-2 gap-space-sm md:gap-space-md">
                {[
                  { id: 'female', icon: 'female', title: 'Feminino', sub: 'Damas e moças · Prioridade' },
                  { id: 'male', icon: 'male', title: 'Masculino', sub: 'Cavalheiros · Restrição' },
                ].map((o) => (
                  <Option key={o.id} checked={form.sex === o.id} onSelect={() => set({ sex: o.id })} className="p-3 md:p-5">
                    <span className="flex items-start justify-between gap-2">
                      <Icon name={o.icon} className={`text-[24px] md:text-[28px] ${form.sex === o.id ? 'text-abyss' : 'text-gold'}`} />
                      <BrassRadio checked={form.sex === o.id} />
                    </span>
                    <span className="mt-2 block font-serif text-[1.25rem] font-medium leading-tight md:text-headline-sm">{o.title}</span>
                    <span className={`mt-0.5 block text-body-sm ${form.sex === o.id ? 'text-abyss/75' : 'text-cream'}`}>{o.sub}</span>
                  </Option>
                ))}
              </div>
            </Card>

            {/* Idade */}
            <Card className="p-space-md md:p-space-lg">
              <div className="flex items-center justify-between gap-3">
                <SectionHeader icon="hourglass_bottom" title="Idade do passageiro" />
                <div className="flex items-center gap-1.5">
                  <button type="button" aria-label="Diminuir idade" onClick={() => set({ age: clampAge(form.age - 1) })} className="btn-bulkhead h-9 w-9">
                    <Icon name="remove" className="text-[18px]" />
                  </button>
                  <label className="flex h-9 items-baseline gap-1 rounded border border-gold/25 bg-trough px-2 shadow-trough focus-within:border-gold">
                    <span className="sr-only">Idade em anos</span>
                    <input
                      type="number"
                      inputMode="numeric"
                      min={1}
                      max={80}
                      value={form.age}
                      onChange={(e) => e.target.value !== '' && set({ age: clampAge(+e.target.value) })}
                      className="tabular w-[2.4ch] bg-transparent pt-1 text-right font-serif text-[1.5rem] leading-none text-gold-light outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <span className="text-body-sm text-meta">anos</span>
                  </label>
                  <button type="button" aria-label="Aumentar idade" onClick={() => set({ age: clampAge(form.age + 1) })} className="btn-bulkhead h-9 w-9">
                    <Icon name="add" className="text-[18px]" />
                  </button>
                </div>
              </div>
              <input
                type="range"
                min={1}
                max={80}
                value={form.age}
                onChange={(e) => set({ age: +e.target.value })}
                aria-label="Idade do passageiro"
                className="age-range mt-space-md"
                style={{ '--fill': `${agePct}%` }}
              />
              <div className="mt-1 flex justify-between gap-2 text-label-sm uppercase text-meta">
                <span>01 ano <span className="hidden sm:inline">(Infante)</span></span>
                <span className="tabular hidden text-cream sm:inline">Média histórica a bordo: {ds.meanAge.toString().replace('.', ',')} anos</span>
                <span>80 anos <span className="hidden sm:inline">(Senhorio)</span></span>
              </div>
              <FieldNote icon="child_care">Crianças até 14 anos tiveram prioridade na transferência para os botes, ao lado das mulheres.</FieldNote>
            </Card>

            {/* Classe */}
            <Card className="p-space-md md:p-space-lg">
              <SectionHeader icon="confirmation_number" title="Classe do bilhete · Pclass" meta={<span className="hidden sm:inline">Geografia dos conveses</span>} />
              <p className="mt-2 text-body-sm text-cream">
                A verticalidade dos conveses determinou o tempo crítico de subida até a coberta de embarcações.
              </p>
              <div role="radiogroup" aria-label="Classe do bilhete" className="mt-space-md grid gap-space-sm sm:grid-cols-3 md:gap-space-md">
                {[1, 2, 3].map((c) => {
                  const k = CLASSES[c]
                  const on = form.pclass === c
                  return (
                    <Option key={c} checked={on} onSelect={() => set({ pclass: c })} label={k.title} className="flex items-center gap-3 p-3 sm:block sm:p-4">
                      <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-sm border sm:hidden ${on ? 'border-abyss/30' : 'border-gold/25 bg-plank'}`}>
                        <Icon name={k.icon} className={`text-[20px] ${on ? 'text-abyss' : 'text-gold'}`} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center justify-between gap-2">
                          <span className={`inline-block rounded-sm px-1.5 py-0.5 text-label-sm uppercase ${on ? 'bg-abyss text-gold-light' : 'border border-gold/20 bg-plank text-cream'}`}>
                            {k.title}
                          </span>
                          <Icon name={k.icon} className={`hidden text-[20px] sm:inline-block ${on ? 'text-abyss' : 'text-gold'}`} />
                          <span className="sm:hidden"><BrassRadio checked={on} /></span>
                        </span>
                        <span className="mt-1.5 block font-serif text-[1.15rem] font-medium leading-tight sm:mt-3 sm:text-headline-sm">{k.name}</span>
                        <span className={`block truncate text-body-sm ${on ? 'text-abyss/75' : 'text-cream'}`}>{k.decks}</span>
                        <span className={`tabular mt-1.5 block text-label-sm uppercase sm:mt-3 ${on ? 'text-abyss/85' : 'text-meta'}`}>
                          Histórico {pct(ds.byClass[c])} · Modelo {pct(whatIf.pclass[c])}
                        </span>
                      </span>
                    </Option>
                  )
                })}
              </div>
            </Card>

            {/* Família */}
            <Card className="p-space-md md:p-space-lg">
              <SectionHeader
                icon="diversity_1"
                title={<><span className="sm:hidden">Família a bordo</span><span className="hidden sm:inline">Laços familiares a bordo</span></>}
                meta={<span className="tabular text-gold-light">{form.family === 0 ? 'Viajando sozinho (0)' : `${form.family === 6 ? '6+' : form.family} parente${form.family > 1 ? 's' : ''}`}</span>}
              />
              <p className="mt-2 text-body-sm text-cream">Soma de cônjuge, irmãos, pais e filhos (SibSp + Parch).</p>
              <div role="radiogroup" aria-label="Familiares a bordo" className="mt-space-md grid grid-cols-7 gap-1.5 md:gap-space-sm">
                {FAMILY_OPTIONS.map((n) => (
                  <Option key={n} checked={form.family === n} onSelect={() => set({ family: n })} label={`${n} parentes`} className="tabular flex h-12 items-center justify-center text-label-lg">
                    {n === 6 ? '6+' : n}
                  </Option>
                ))}
              </div>
              <FieldNote icon="groups">Famílias pequenas (1 a 3 parentes) registraram maior taxa de agrupamento; famílias numerosas enfrentaram extrema dificuldade nos portões.</FieldNote>
            </Card>

            {/* Porto */}
            <Card className="p-space-md md:p-space-lg">
              <SectionHeader icon="anchor" title="Porto de embarque" meta={<span className="hidden sm:inline">Rota transatlântica</span>} />
              <div role="radiogroup" aria-label="Porto de embarque" className="mt-space-md grid grid-cols-3 gap-space-sm md:gap-space-md">
                {['S', 'C', 'Q'].map((code) => {
                  const port = PORTS[code]
                  const on = form.embarked === code
                  return (
                    <Option key={code} checked={on} onSelect={() => set({ embarked: code })} label={port.name} className="p-2.5 text-center md:p-4 md:text-left">
                      <span className="flex items-start justify-center gap-2 md:justify-between">
                        <span className="hidden font-serif text-headline-sm font-medium leading-tight md:block">{port.name}</span>
                        <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-sm font-serif text-[1.15rem] md:h-6 md:w-6 md:text-label-md md:font-sans ${on ? 'bg-abyss text-gold-light' : 'border border-gold/25 text-gold'}`}>
                          {code}
                        </span>
                      </span>
                      <span className="mt-1.5 block text-[0.625rem] font-bold uppercase tracking-[0.03em] md:hidden">{port.name}</span>
                      <span className={`mt-0.5 block text-[0.6875rem] md:mt-1 md:text-body-sm ${on ? 'text-abyss/75' : 'text-cream'}`}>
                        {port.date}<span className="hidden md:inline"> · {port.time}</span>
                      </span>
                      <span className={`tabular mt-2 hidden text-label-sm uppercase md:block ${on ? 'text-abyss/85' : 'text-meta'}`}>
                        {port.note}
                      </span>
                    </Option>
                  )
                })}
              </div>
            </Card>

            <GildedButton type="submit" className="h-14 w-full px-4 text-label-lg md:h-16">
              <Icon name="explore" className="text-[22px]" />
              <span className="whitespace-nowrap sm:hidden">Calcular sobrevivência</span>
              <span className="hidden whitespace-nowrap sm:inline">Calcular probabilidade de sobrevivência</span>
              <Icon name="arrow_forward" className="hidden text-[20px] sm:inline-block" />
            </GildedButton>
            <p className="-mt-1 text-center text-label-sm uppercase text-meta">
              Inferência em tempo real · {MODEL.trees.length} árvores de decisão
            </p>
          </form>

          {/* ── Resultado ──────────────────────────────────── */}
          <aside ref={resultRef} className="scroll-mt-20 min-w-0 lg:col-span-5">
            <div className="flex flex-col gap-space-md lg:gap-space-lg">
              <ShipPlate className="hidden lg:block" />
              <ResultPanel form={form} result={result} stamp={stamp} />
            </div>
          </aside>
        </div>
      </div>
    </>
  )
}
