/**
 * Motor de inferência do Gradient Boosted Trees treinado em ml/treinar_modelo.py.
 * As árvores do scikit-learn são exportadas para model.json e percorridas aqui,
 * no navegador — a probabilidade é idêntica à de modelo.predict_proba().
 *
 * Contribuições por variável: atribuição por caminho (Saabas) em cada árvore,
 * aditiva no espaço log-odds e reescalada para pontos percentuais — uma aproximação
 * leve dos valores SHAP (TreeSHAP exato exigiria o algoritmo completo).
 */
import model from './model.json'

export const MODEL = model
export const FEATURES = model.features // ["Sex","Age","Pclass","FamilySize","Embarked"]
export const EMBARKED_CODE = { C: 0, Q: 1, S: 2 }

const sigmoid = (z) => 1 / (1 + Math.exp(-z))
export const BASE_PROBABILITY = sigmoid(model.init)

// Os nós internos do sklearn guardam a média dos resíduos, não o valor pós line-search das folhas.
// Recalculamos cada nó interno como a média ponderada (por amostras) das folhas abaixo dele,
// o que torna a atribuição por caminho exatamente aditiva.
function hydrate(tree) {
  const value = tree.v.slice()
  const fill = (i) => {
    if (tree.l[i] === -1) return value[i]
    const L = tree.l[i], R = tree.r[i]
    const vl = fill(L), vr = fill(R)
    value[i] = (vl * tree.n[L] + vr * tree.n[R]) / (tree.n[L] + tree.n[R])
    return value[i]
  }
  fill(0)
  return { ...tree, value }
}
const TREES = model.trees.map(hydrate)

/**
 * Converte o formulário em vetor de features na mesma ordem e codificação do treino.
 * @param {{sex: string, age: number|string, pclass: number|string, family: number|string, embarked: string}} passenger
 * @returns {number[]} Vetor alinhado a FEATURES.
 */
export function toVector({ sex, age, pclass, family, embarked }) {
  const row = {
    Sex: sex === 'male' ? 1 : 0,
    Age: Number(age),
    Pclass: Number(pclass),
    FamilySize: Number(family) + 1, // SibSp + Parch + o próprio passageiro
    Embarked: EMBARKED_CODE[embarked],
  }
  return FEATURES.map((f) => row[f])
}

/**
 * Calcula a probabilidade de sobrevivência e a contribuição de cada variável.
 *
 * @param {{sex: 'male'|'female', age: number, pclass: 1|2|3, family: number, embarked: 'C'|'Q'|'S'}} passenger
 *   Dados do formulário (`family` = parentes a bordo, sem contar o passageiro).
 * @returns {{probability: number, logit: number, contributions: {feature: string, logit: number, points: number}[]}}
 *   `probability` em [0, 1]; `points` em pontos percentuais, somando (probability − BASE_PROBABILITY) × 100.
 */
export function predict(passenger) {
  const x = toVector(passenger)
  const lr = model.learningRate
  let logit = model.init
  const contrib = new Array(FEATURES.length).fill(0)

  for (const t of TREES) {
    let node = 0
    while (t.l[node] !== -1) {
      const f = t.f[node]
      const next = x[f] <= t.t[node] ? t.l[node] : t.r[node]
      contrib[f] += lr * (t.value[next] - t.value[node])
      node = next
    }
    logit += lr * t.value[0] // valor esperado da árvore
  }
  const pathSum = contrib.reduce((a, b) => a + b, 0)
  logit += pathSum

  const probability = sigmoid(logit)
  // Reescala log-odds → pontos percentuais preservando a soma (p − p_base)
  const scale = Math.abs(pathSum) > 1e-9 ? (probability - BASE_PROBABILITY) / pathSum : 0
  const contributions = FEATURES.map((feature, i) => ({ feature, logit: contrib[i], points: contrib[i] * scale * 100 }))

  return { probability, logit, contributions }
}

/**
 * Faixa de risco usada no medidor e nos rótulos do resultado.
 * @param {number} p Probabilidade de sobrevivência em [0, 1].
 * @returns {{label: string, tone: 'oxide'|'amber'|'gold', short: string}}
 */
export function riskBand(p) {
  if (p < 0.15) return { label: 'Risco Extremo de Naufrágio', tone: 'oxide', short: 'Extremo' }
  if (p < 0.35) return { label: 'Risco Elevado de Naufrágio', tone: 'oxide', short: 'Elevado' }
  if (p < 0.55) return { label: 'Risco Moderado', tone: 'amber', short: 'Moderado' }
  if (p < 0.75) return { label: 'Chance Favorável de Resgate', tone: 'gold', short: 'Favorável' }
  return { label: 'Resgate Altamente Provável', tone: 'gold', short: 'Provável' }
}

/**
 * Bote provável — camada narrativa sobre a probabilidade do modelo,
 * inspirada na ordem real de lançamento dos botes (não é saída do GBT).
 * @param {number} p Probabilidade de sobrevivência em [0, 1].
 * @param {{sex: string, age: number, pclass: number}} passenger
 * @returns {{boat: string, note: string, side: string|null}}
 */
export function probableLifeboat(p, { sex, age, pclass }) {
  if (p < 0.25) return { boat: 'Nenhum', note: 'Esgotamento da coberta', side: null }
  if (p < 0.45) return { boat: 'Dobrável A', note: 'Engelhardt · arrastado ao mar às 02:15', side: 'Estibordo' }
  const child = age <= 14
  if (p < 0.65) {
    if (pclass === 3) return { boat: 'Bote 15', note: 'Lançado à 01:41 · popa', side: 'Estibordo' }
    return { boat: 'Dobrável C', note: 'Engelhardt · lançado às 01:40', side: 'Estibordo' }
  }
  if (child) return { boat: 'Bote 13', note: 'Lançado à 01:40 · popa', side: 'Estibordo' }
  if (pclass === 1) return sex === 'female'
    ? { boat: 'Bote 6', note: 'Lançado à 00:55 · proa', side: 'Bombordo' }
    : { boat: 'Bote 7', note: 'Primeiro lançado · 00:45', side: 'Estibordo' }
  if (pclass === 2) return { boat: 'Bote 14', note: 'Lançado à 01:30 · popa', side: 'Bombordo' }
  return { boat: 'Bote 16', note: 'Lançado à 01:35 · popa', side: 'Bombordo' }
}

/** Rótulo legível de cada variável, montado a partir dos dados do passageiro. */
export const FEATURE_LABEL = {
  Sex: (p) => (p.sex === 'male' ? 'Gênero Masculino' : 'Gênero Feminino'),
  Age: (p) => `Idade (${p.age} anos)`,
  Pclass: (p) => `${p.pclass}ª Classe`,
  FamilySize: (p) => (p.family === 0 ? 'Viajando Sozinho' : `Família a Bordo (${p.family})`),
  Embarked: (p) => `Porto de ${PORTS[p.embarked].name}`,
}

/** Metadados de exibição dos portos de embarque (chave = código de Embarked). */
export const PORTS = {
  S: { name: 'Southampton', date: '10 de Abril', time: 'Manhã', note: '70% do contingente total', fare: 'Inglaterra' },
  C: { name: 'Cherbourg', date: '10 de Abril', time: 'Entardecer', note: 'Alta proporção de 1ª classe', fare: 'França' },
  Q: { name: 'Queenstown', date: '11 de Abril', time: 'Irlanda', note: 'Maioria emigrantes 3ª classe', fare: 'Irlanda' },
}

/** Metadados de exibição de cada classe do bilhete (chave = Pclass). */
export const CLASSES = {
  1: { title: '1ª Classe', name: 'Salões Nobres', decks: 'Conveses A, B, C', deckShort: 'A-C', desc: 'Salões nobres, acesso direto aos botes', fare: '£ 60 6s', berth: 'Conveses A-C (Salões Nobres)', icon: 'stars' },
  2: { title: '2ª Classe', name: 'Intermediária', decks: 'Conveses D, E', deckShort: 'D-E', desc: 'Acomodações intermediárias de passagem', fare: '£ 14 5s', berth: 'Conveses D/E (Meia-nau)', icon: 'chair' },
  3: { title: '3ª Classe', name: 'Terceira Classe', decks: 'Conveses F, G (Casco)', deckShort: 'F-G', desc: 'Casco inferior e passadiços distantes', fare: '£ 7 5s', berth: 'Conveses F/G (Berço Inferior)', icon: 'luggage' },
}
