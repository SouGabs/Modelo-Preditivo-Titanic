import { useEffect, useState } from 'react'
import { Icon, StatusDot } from './components/ui.jsx'
import Simulator from './views/Simulator.jsx'
import Records from './views/Records.jsx'
import About from './views/About.jsx'
import { MODEL } from './model/inference.js'

const TABS = [
  { id: 'simulador', label: 'Manifesto de Inferência', short: 'Simulador', icon: 'tune' },
  { id: 'registros', label: 'Registros Históricos', short: 'Registros', icon: 'history_edu' },
  { id: 'modelo', label: 'Métricas do Modelo', short: 'Sobre o Modelo', icon: 'neurology' },
]
const ACCURACY = (MODEL.metrics.cvAccuracy * 100).toFixed(1).replace('.', ',')

/** Aba ativa a partir do hash da URL (#simulador, #registros, #modelo); padrão: simulador. */
const readHash = () => {
  const h = window.location.hash.replace('#', '')
  return TABS.some((t) => t.id === h) ? h : 'simulador'
}

/** Emblema da White Star Line (flâmula + estrela) usado no cabeçalho. */
function Emblem({ className = '' }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden>
      <rect x="0.5" y="0.5" width="39" height="39" rx="3" fill="#111E2E" stroke="rgba(197,160,89,.4)" />
      <path d="M7 12 L33 20 L7 28 Z" fill="none" stroke="#C5A059" strokeWidth="1.2" />
      <path d="M17 15.6l1.5 3.2 3.5.4-2.6 2.3.7 3.4-3.1-1.8-3 1.8.7-3.4-2.6-2.3 3.4-.4z" fill="#E9C176" />
    </svg>
  )
}

/**
 * Raiz da aplicação: cabeçalho, navegação (topo no desktop, barra inferior no mobile)
 * e roteamento simples por hash entre Simulador, Registros e Sobre o Modelo.
 */
export default function App() {
  const [tab, setTab] = useState(readHash)

  useEffect(() => {
    const onHash = () => {
      setTab(readHash())
      window.scrollTo({ top: 0, behavior: 'instant' })
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const go = (id) => {
    if (id === tab) return
    window.location.hash = id
    window.scrollTo({ top: 0, behavior: 'instant' })
  }

  return (
    <div className="flex min-h-[100dvh] flex-col bg-abyss">
      {/* ── Cabeçalho ─────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-gold/15 bg-abyss/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-registry items-center gap-4 px-margin-mobile md:px-8 lg:h-20 lg:gap-8 lg:px-margin">
          <a href="#simulador" onClick={(e) => { e.preventDefault(); go('simulador') }} className="flex min-w-0 items-center gap-3">
            <Emblem className="h-9 w-9 shrink-0 lg:h-10 lg:w-10" />
            <span className="min-w-0">
              <span className="block whitespace-nowrap font-serif text-[1.35rem] font-semibold uppercase leading-none tracking-[0.06em] text-gold-light lg:text-[1.45rem]">
                White Star Line
              </span>
              <span className="mt-1 block truncate text-label-sm uppercase text-meta">
                <span className="lg:hidden">S.S. Titanic · Southampton → NYC</span>
                <span className="hidden lg:inline">Predictive Registry · 1912</span>
              </span>
            </span>
          </a>

          <nav aria-label="Seções" className="ml-auto hidden h-full items-stretch lg:flex">
            {TABS.map((t) => (
              <a
                key={t.id}
                href={`#${t.id}`}
                onClick={(e) => { e.preventDefault(); go(t.id) }}
                aria-current={tab === t.id ? 'page' : undefined}
                className={`relative flex items-center px-4 text-label-md uppercase transition-colors xl:px-5 ${
                  tab === t.id ? 'text-gold-light' : 'text-cream hover:text-parchment'
                }`}
              >
                {t.label}
                {tab === t.id && <span className="absolute inset-x-4 bottom-0 h-0.5 bg-gold xl:inset-x-5" />}
              </a>
            ))}
          </nav>

          <div className="ml-auto flex shrink-0 items-center gap-3 lg:ml-0">
            <span className="hidden items-center gap-2 rounded-sm border border-gold/30 bg-plank px-3 py-2 text-label-sm uppercase text-gold-light shadow-bevel sm:inline-flex">
              <StatusDot />
              <span className="tabular">ML Ativo · {ACCURACY}%</span>
            </span>
            <span className="hidden h-9 items-center gap-1.5 border-l border-gold/15 pl-3 text-label-sm uppercase text-cream xl:inline-flex">
              <Icon name="verified_user" className="text-[18px] text-gold" />
              Archivist Verified
            </span>
          </div>
        </div>
      </header>

      {/* ── Conteúdo ──────────────────────────────────────────── */}
      <main className="flex-1 pb-28 lg:pb-0">
        <div key={tab} className="animate-rise">
          {tab === 'simulador' && <Simulator accuracy={ACCURACY} />}
          {tab === 'registros' && <Records onSimulate={() => go('simulador')} />}
          {tab === 'modelo' && <About />}
        </div>
      </main>

      {/* ── Rodapé (desktop) ──────────────────────────────────── */}
      <footer className="mt-space-xl hidden border-t border-gold/15 bg-surface lg:block">
        <div className="mx-auto grid max-w-registry grid-cols-12 gap-gutter px-margin py-space-xl">
          <div className="col-span-5">
            <p className="font-serif text-headline-sm uppercase tracking-[0.04em] text-gold-light">White Star Line Maritime Intelligence</p>
            <p className="mt-2 text-body-sm text-cream">Harland and Wolff Shipbuilders · Queen's Island, Belfast · Modelo GBT-1912</p>
          </div>
          <ul className="col-span-7 grid grid-cols-4 items-center gap-gutter">
            {['Telemetry Protocol', "Naval Lloyd's Registry", 'Victorian Archival Code', 'Oceanic Navigation AI'].map((t) => (
              <li key={t} className="text-label-sm uppercase text-meta">{t}</li>
            ))}
          </ul>
        </div>
      </footer>

      {/* ── Navegação inferior (mobile/tablet) ────────────────── */}
      <nav
        aria-label="Seções"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-gold/20 bg-abyss/95 backdrop-blur-md lg:hidden"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="mx-auto grid max-w-xl grid-cols-3">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => go(t.id)}
              aria-current={tab === t.id ? 'page' : undefined}
              className={`relative flex min-h-[64px] flex-col items-center justify-center gap-1 text-[0.625rem] font-bold uppercase tracking-[0.1em] transition-colors ${
                tab === t.id ? 'text-gold-light' : 'text-meta'
              }`}
            >
              {tab === t.id && <span className="absolute inset-x-6 top-0 h-0.5 bg-gold" />}
              <Icon name={t.icon} fill={tab === t.id} className="text-[22px]" />
              <span className="whitespace-nowrap">{t.short}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}
