import { Card, GildedButton, Icon, SectionHeader } from '../components/ui.jsx'
import PageHero, { RateRow } from '../components/PageHero.jsx'
import ShipPlate from '../components/ShipPlate.jsx'
import { MODEL } from '../model/inference.js'

const KPIS = [
  { label: 'Almas a bordo', value: '2.224', note: 'Passageiros e tripulação' },
  { label: 'Sobreviventes', value: '≈ 710', note: '≈ 32% do total', gold: true },
  { label: 'Vítimas', value: '≈ 1.500', note: 'Atlântico Norte, −2 °C', oxide: true },
  { label: 'Botes salva-vidas', value: '20', note: 'Capacidade para 1.178' },
]

const TIMELINE = [
  { date: '10 Abr', time: '12:00', event: 'Partida de Southampton', detail: 'Início da viagem inaugural rumo a Nova York.' },
  { date: '10 Abr', time: '18:30', event: 'Escala em Cherbourg', detail: 'Embarque de passageiros pela França, muitos de 1ª classe.' },
  { date: '11 Abr', time: '11:30', event: 'Escala em Queenstown', detail: 'Último porto; maioria emigrantes irlandeses de 3ª classe.' },
  { date: '14 Abr', time: '23:40', event: 'Colisão com o iceberg', detail: 'Cinco compartimentos estanques de proa são rompidos.', critical: true },
  { date: '15 Abr', time: '00:05', event: 'Ordem de descobrir os botes', detail: 'Capitão Smith ordena o preparo das embarcações.' },
  { date: '15 Abr', time: '00:45', event: 'Bote 7 é o primeiro lançado', detail: 'Parte com 28 ocupantes, para 65 lugares.' },
  { date: '15 Abr', time: '02:05', event: 'Dobrável D, último lançado', detail: 'Ainda restavam mais de 1.500 pessoas a bordo.' },
  { date: '15 Abr', time: '02:20', event: 'Afundamento final', detail: 'O navio parte-se ao meio e submerge.', critical: true },
  { date: '15 Abr', time: '04:10', event: 'Chegada do RMS Carpathia', detail: 'Início do resgate dos botes à deriva.' },
]

const CLASS_LABEL = { 1: '1ª Classe', 2: '2ª Classe', 3: '3ª Classe' }
const PORT_LABEL = { 0: 'Cherbourg', 1: 'Queenstown', 2: 'Southampton' }

/**
 * Registros históricos: números do naufrágio, linha do tempo e taxas de sobrevivência do dataset.
 * @param {{onSimulate: () => void}} props Callback do botão que leva ao simulador.
 */
export default function Records({ onSimulate }) {
  const ds = MODEL.dataset
  return (
    <>
      <PageHero chip="Arquivo histórico" eyebrow="14–15 de Abril de 1912 · 41°43′N 49°56′W" title="Registros Históricos do Naufrágio">
        O contexto real das 2.224 almas a bordo, a cronologia da evacuação e as taxas de sobrevivência observadas no manifesto que
        alimenta o modelo preditivo.
      </PageHero>

      <div className="mx-auto max-w-registry px-margin-mobile pt-space-lg md:px-8 lg:px-margin lg:pt-space-xl">
        <dl className="grid grid-cols-2 gap-space-sm md:gap-space-md lg:grid-cols-4 lg:gap-gutter">
          {KPIS.map((k) => (
            <Card key={k.label} as="div" className="p-space-md lg:p-space-lg">
              <dt className="text-label-sm uppercase text-meta">{k.label}</dt>
              <dd className={`tabular mt-2 font-serif text-headline-md leading-none lg:text-headline-lg ${k.oxide ? 'text-oxide-soft' : k.gold ? 'text-gold-light' : 'text-parchment'}`}>
                {k.value}
              </dd>
              <dd className="mt-2 text-body-sm text-cream">{k.note}</dd>
            </Card>
          ))}
        </dl>

        <div className="mt-space-lg grid gap-space-lg lg:mt-gutter lg:grid-cols-12 lg:gap-gutter">
          {/* Cronologia */}
          <Card className="p-space-md md:p-space-lg min-w-0 lg:col-span-7">
            <SectionHeader icon="history_edu" title="Cronologia da travessia" meta={<span className="hidden sm:inline">Horário de bordo</span>} />
            <ol className="mt-space-md">
              {TIMELINE.map((t, i) => (
                <li key={i} className="group relative grid grid-cols-[4.25rem_1fr] gap-3 border-b border-gold/[0.08] py-3 last:border-0 md:grid-cols-[6.5rem_1fr] md:gap-space-md">
                  <div className="tabular">
                    <p className={`text-label-lg ${t.critical ? 'text-oxide-soft' : 'text-gold-light'}`}>{t.time}</p>
                    <p className="text-label-sm uppercase text-meta">{t.date}</p>
                  </div>
                  <div>
                    <p className="flex items-center gap-2 font-serif text-[1.2rem] font-medium leading-snug text-parchment">
                      {t.critical && <Icon name="warning" fill className="text-[16px] text-oxide-soft" />}
                      {t.event}
                    </p>
                    <p className="text-body-sm text-cream">{t.detail}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Card>

          <div className="flex flex-col gap-space-lg min-w-0 lg:col-span-5">
            <ShipPlate caption="Registro visual histórico" title="Harland & Wolff · Belfast" badge="1909–1912" />

            <Card className="p-space-md md:p-space-lg">
              <SectionHeader icon="groups" title="Sobrevivência no manifesto" meta={`${ds.rows} registros`} />
              <p className="mt-space-md text-label-sm uppercase text-meta">Por gênero</p>
              <ul className="mt-1 divide-y divide-gold/[0.08]">
                <RateRow label="Feminino" value={ds.bySex['0']} />
                <RateRow label="Masculino" value={ds.bySex['1']} tone="oxide" />
              </ul>
              <p className="mt-space-md text-label-sm uppercase text-meta">Por classe</p>
              <ul className="mt-1 divide-y divide-gold/[0.08]">
                {['1', '2', '3'].map((c) => (
                  <RateRow key={c} label={CLASS_LABEL[c]} sub={`${ds.countByClass[c]} pass.`} value={ds.byClass[c]} tone={ds.byClass[c] < 0.35 ? 'oxide' : 'gold'} />
                ))}
              </ul>
              <p className="mt-space-md text-label-sm uppercase text-meta">Por porto</p>
              <ul className="mt-1 divide-y divide-gold/[0.08]">
                {['2', '0', '1'].map((e) => (
                  <RateRow key={e} label={PORT_LABEL[e]} sub={`${ds.countByEmbarked[e]} pass.`} value={ds.byEmbarked[e]} tone={ds.byEmbarked[e] < 0.35 ? 'oxide' : 'gold'} />
                ))}
              </ul>
            </Card>
          </div>
        </div>

        <Card tier="instrument" className="mt-space-lg flex flex-col gap-space-md p-space-md md:flex-row md:items-center md:justify-between md:p-space-lg lg:mt-gutter">
          <div>
            <p className="font-serif text-headline-sm font-medium text-gold-light">Botes lançados abaixo da capacidade</p>
            <p className="mt-1 max-w-3xl text-body-sm text-cream">
              A arquitetura de conveses e as barreiras entre classes influenciaram decisivamente o tempo de evacuação. O Bote 1 partiu
              com apenas 12 ocupantes para 40 lugares — capacidade ociosa que o modelo não enxerga, mas o manifesto registra.
            </p>
          </div>
          <GildedButton onClick={onSimulate} className="h-12 shrink-0 px-6">
            <Icon name="tune" className="text-[18px]" /> Simular um passageiro
          </GildedButton>
        </Card>
      </div>
    </>
  )
}
