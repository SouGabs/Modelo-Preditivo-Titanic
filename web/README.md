# White Star Line · Simulador de Sobrevivência

Aplicação React + Vite + Tailwind seguindo o design system **Transatlantic Oceanic Registry**
([`design/DESIGN.md`](../design/DESIGN.md)).

## Rodar

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # gera dist/
```

## Modelo

O Gradient Boosted Trees é treinado em `../ml/treinar_modelo.py` (scikit-learn) sobre
`Titanic-Dataset-Modificado.csv` e exportado para `src/model/model.json`. A inferência
(`src/model/inference.js`) percorre as árvores no navegador e reproduz exatamente o
`predict_proba` do sklearn. Para retreinar:

```bash
python ml/treinar_modelo.py   # a partir da raiz do projeto
```

- Variáveis: `Sex`, `Age`, `Pclass`, `FamilySize` (SibSp + Parch + 1), `Embarked`.
- Pesos por variável: atribuição por caminho nas árvores (aproximação de SHAP), em pontos percentuais.
- "Bote provável": camada narrativa sobre a probabilidade — não é saída do modelo.

## Estrutura

- `src/App.jsx`: cabeçalho, navegação (topo no desktop, barra inferior no mobile) e rotas por hash.
- `src/views/Simulator.jsx` + `ResultPanel.jsx`: formulário e resultado em tempo real.
- `src/views/Records.jsx`: registros históricos · `src/views/About.jsx`: métricas do modelo.
- `src/components/`: componentes atômicos (`ui.jsx`), `Gauge`, `ShipPlate`, `PageHero`.
