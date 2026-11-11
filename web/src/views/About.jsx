import { Card, Icon, SectionHeader } from '../components/ui.jsx'
import PageHero from '../components/PageHero.jsx'
import { MODEL } from '../model/inference.js'

const pct = (v, d = 1) => `${(v * 100).toFixed(d).replace('.', ',')}%`

const FEATURE_INFO = {
  Sex: { label: 'Gênero', desc: 'female = 0 · male = 1' },
  Age: { label: 'Idade', desc: 'Anos; ausentes imputados pela mediana do título (Mr, Mrs, Miss, Master)' },
  Pclass: { label: 'Classe do bilhete', desc: '1, 2 ou 3' },
  FamilySize: { label: 'Tamanho da família', desc: 'SibSp + Parch + 1' },
  Embarked: { label: 'Porto de embarque', desc: 'C = 0 · Q = 1 · S = 2' },
}

const PIPELINE = [
  { icon: 'cleaning_services', title: 'Saneamento do manifesto', text: 'Idades em texto livre (“Age 38”, “~3 yo”) convertidas em número; valores negativos e acima de 100 anos descartados; registros duplicados removidos.' },
  { icon: 'badge', title: 'Imputação por título', text: 'Títulos extraídos do nome completam gênero e idade ausentes com a mediana de cada grupo (Mr, Mrs, Miss, Master, Rare).' },
  { icon: 'family_restroom', title: 'Engenharia de atributos', text: 'SibSp e Parch são resumidos em FamilySize; porto e gênero recebem codificação ordinal adequada a árvores.' },
  { icon: 'account_tree', title: 'Gradient Boosted Trees', text: 'Árvores rasas treinadas em sequência, cada uma corrigindo os resíduos da anterior (scikit-learn).' },
  { icon: 'deployed_code', title: 'Exportação para o navegador', text: 'As árvores são serializadas em JSON e percorridas em JavaScript: a inferência é instantânea e não depende de servidor.' },
]

export default function About() {
  const m = MODEL.metrics
  const ds = MODEL.dataset
  const imp = Object.entries(MODEL.importances).sort((a, b) => b[1] - a[1])
  const metricCards = [
    { label: 'Acurácia (validação cruzada 5×)', value: pct(m.cvAccuracy), note: `± ${pct(m.cvStd)} entre dobras`, main: true },
    { label: 'Acurácia hold-out (20%)', value: pct(m.holdoutAccuracy), note: 'Conjunto de teste estratificado' },
    { label: 'ROC-AUC', value: m.rocAuc.toFixed(3).replace('.', ','), note: 'Capacidade de ordenação' },
    { label: 'Precisão', value: pct(m.precision), note: 'Sobreviventes previstos corretos' },
    { label: 'Recall', value: pct(m.recall), note: 'Sobreviventes reais detectados' },
    { label: 'F1-score', value: pct(m.f1), note: 'Média harmônica' },
  ]

  return (
    <>
      <PageHero chip="Ficha técnica" eyebrow={`Modelo GBT-1912 · ${MODEL.trees.length} árvores`} title="Sobre o Modelo Preditivo">
        Como a probabilidade é calculada: dados de origem, tratamento, hiperparâmetros e métricas medidas sobre passageiros que o
        modelo não viu durante o treino.
      </PageHero>

      <div className="mx-auto max-w-registry px-margin-mobile pt-space-lg md:px-8 lg:px-margin lg:pt-space-xl">
        <dl className="grid grid-cols-2 gap-space-sm md:grid-cols-3 md:gap-space-md lg:grid-cols-6 lg:gap-gutter">
          {metricCards.map((c) => (
            <Card key={c.label} as="div" tier={c.main ? 'instrument' : 'plank'} className="flex flex-col p-space-md">
              <dt className="text-label-sm uppercase text-meta">{c.label}</dt>
              <dd className={`tabular mt-auto pt-3 font-serif text-headline-md leading-none ${c.main ? 'text-gold-light' : 'text-parchment'}`}>{c.value}</dd>
              <dd className="mt-1.5 text-body-sm text-cream">{c.note}</dd>
            </Card>
          ))}
        </dl>

        <div className="mt-space-lg grid gap-space-lg lg:mt-gutter lg:grid-cols-12 lg:gap-gutter">
          <div className="flex flex-col gap-space-lg min-w-0 lg:col-span-7">
            <Card className="p-space-md md:p-space-lg">
              <SectionHeader icon="account_tree" title="Pipeline de treinamento" meta="ml/treinar_modelo.py" />
              <ol className="mt-space-md">
                {PIPELINE.map((s, i) => (
                  <li key={s.title} className="grid grid-cols-[2.5rem_1fr] gap-3 border-b border-gold/[0.08] py-3 last:border-0">
                    <span className="grid h-10 w-10 place-items-center rounded-sm border border-gold/25 bg-instrument">
                      <Icon name={s.icon} className="text-[20px] text-gold" />
                    </span>
                    <div>
                      <p className="font-serif text-[1.2rem] font-medium text-parchment">
                        <span className="tabular mr-2 text-label-md text-gold">{String(i + 1).padStart(2, '0')}</span>
                        {s.title}
                      </p>
                      <p className="text-body-sm text-cream">{s.text}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </Card>

            <Card className="p-space-md md:p-space-lg">
              <SectionHeader icon="table_rows" title="Variáveis de entrada" meta="Ledger de features" />
              <div className="mt-space-md overflow-x-auto">
                <table className="w-full min-w-[460px] text-left">
                  <thead>
                    <tr className="border-b border-gold/30 text-label-md uppercase text-cream">
                      <th className="py-2 pr-3 font-semibold">Coluna</th>
                      <th className="py-2 pr-3 font-semibold">Descrição</th>
                      <th className="py-2 text-right font-semibold">Importância</th>
                    </tr>
                  </thead>
                  <tbody>
                    {imp.map(([f, v]) => (
                      <tr key={f} className="group border-b border-gold/[0.08] transition-colors hover:bg-instrument">
                        <td className="relative py-2.5 pl-3 pr-3">
                          <span className="absolute left-0 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-gold opacity-0 group-hover:opacity-100" />
                          <code className="text-body-sm font-semibold text-gold-light">{f}</code>
                          <span className="block text-body-sm text-parchment">{FEATURE_INFO[f].label}</span>
                        </td>
                        <td className="py-2.5 pr-3 text-body-sm text-cream">{FEATURE_INFO[f].desc}</td>
                        <td className="tabular py-2.5 text-right text-label-lg text-parchment">{pct(v)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          <div className="flex flex-col gap-space-lg min-w-0 lg:col-span-5">
            <Card tier="instrument" className="p-space-md md:p-space-lg">
              <SectionHeader icon="leaderboard" title="Importância global" meta="Redução de impureza" />
              <ul className="mt-space-md space-y-3">
                {imp.map(([f, v]) => (
                  <li key={f}>
                    <div className="flex items-baseline justify-between text-body-sm">
                      <span className="text-parchment">{FEATURE_INFO[f].label}</span>
                      <span className="tabular text-label-md text-gold-light">{pct(v)}</span>
                    </div>
                    <div className="mt-1.5 h-1.5 rounded-sm bg-[#283646]">
                      <div className="h-full rounded-sm bg-gold" style={{ width: `${(v / imp[0][1]) * 100}%` }} />
                    </div>
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="p-space-md md:p-space-lg">
              <SectionHeader icon="settings" title="Hiperparâmetros" meta="scikit-learn" />
              <dl className="mt-space-md divide-y divide-gold/[0.08]">
                {[
                  ['n_estimators', MODEL.params.n_estimators],
                  ['learning_rate', MODEL.params.learning_rate],
                  ['max_depth', MODEL.params.max_depth],
                  ['subsample', MODEL.params.subsample],
                  ['random_state', MODEL.params.random_state],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between py-2">
                    <dt className="font-mono text-body-sm text-cream">{k}</dt>
                    <dd className="tabular text-body-sm font-semibold text-parchment">{v}</dd>
                  </div>
                ))}
              </dl>
            </Card>

            <Card className="p-space-md md:p-space-lg">
              <SectionHeader icon="database" title="Dataset" meta="Titanic-Dataset-Modificado.csv" />
              <dl className="mt-space-md grid grid-cols-2 gap-3">
                <div>
                  <dt className="text-label-sm uppercase text-meta">Linhas brutas</dt>
                  <dd className="tabular mt-1 text-title-md text-parchment">{ds.rawRows.toLocaleString('pt-BR')}</dd>
                </div>
                <div>
                  <dt className="text-label-sm uppercase text-meta">Após deduplicação</dt>
                  <dd className="tabular mt-1 text-title-md text-parchment">{ds.rows}</dd>
                </div>
                <div>
                  <dt className="text-label-sm uppercase text-meta">Taxa de sobrevivência</dt>
                  <dd className="tabular mt-1 text-title-md text-gold-light">{pct(ds.survivalRate)}</dd>
                </div>
                <div>
                  <dt className="text-label-sm uppercase text-meta">Idade média</dt>
                  <dd className="tabular mt-1 text-title-md text-parchment">{String(ds.meanAge).replace('.', ',')} anos</dd>
                </div>
              </dl>
              <p className="mt-space-md flex gap-2 border-t border-gold/10 pt-space-md text-body-sm text-meta">
                <Icon name="info" className="mt-0.5 text-[16px] text-gold/70" />
                Os pesos exibidos no simulador são atribuições por caminho nas árvores (aproximação dos valores SHAP). O “bote provável”
                é uma camada narrativa sobre a probabilidade, não uma saída do modelo.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </>
  )
}
