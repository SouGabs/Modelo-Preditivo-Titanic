"""
Treina o Gradient Boosted Trees usado pela aplicação web e exporta as árvores
para JSON (web/src/model/model.json), permitindo inferência 100% no navegador.

Uso (a partir da raiz do projeto):
    python ml/treinar_modelo.py
"""
import json
from pathlib import Path

import numpy as np
import pandas as pd
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.metrics import accuracy_score, roc_auc_score, precision_score, recall_score, f1_score
from sklearn.model_selection import StratifiedKFold, cross_val_score, train_test_split

RAIZ = Path(__file__).resolve().parents[1]
CSV = RAIZ / "Titanic-Dataset-Modificado.csv"
SAIDA = RAIZ / "web" / "src" / "model" / "model.json"

FEATURES = ["Sex", "Age", "Pclass", "FamilySize", "Embarked"]  # mesmas variáveis do formulário
EMBARKED = {"C": 0, "Q": 1, "S": 2}


def para_numerico(serie):
    """Mesmo tratamento de modelo.py: extrai o número de texto sujo ('Age 38', '~3 yo')."""
    return pd.to_numeric(
        serie.astype(str).str.replace(",", ".").str.extract(r"(-?\d+\.?\d*)")[0], errors="coerce"
    )


def preparar(df):
    """
    Limpa e imputa o dataset bruto, deixando-o pronto para o treino.

    - Remove duplicatas e converte Age/Fare/SibSp/Parch de texto sujo para número.
    - Descarta valores impossíveis (negativos, idade > 100, classe fora de 1-3).
    - Codifica Sex (female=0, male=1), Embarked (C=0, Q=1, S=2) e Survived (0/1).
    - Imputa Sex e Age pelo título do nome (Mr, Mrs, Miss, Master, Rare); o restante
      pela moda/mediana global.
    - Cria FamilySize = SibSp + Parch + 1.

    Parâmetros:
        df (pd.DataFrame): dados brutos lidos de Titanic-Dataset-Modificado.csv.

    Retorna:
        Novo DataFrame sem nulos nas FEATURES, apenas com linhas de Survived conhecido.
    """
    df = df.drop_duplicates().reset_index(drop=True).copy()
    for col in ["Age", "Fare", "SibSp", "Parch"]:
        df[col] = para_numerico(df[col])
        df.loc[df[col] < 0, col] = np.nan
    df.loc[df["Age"] > 100, "Age"] = np.nan
    df.loc[~df["Pclass"].isin([1, 2, 3]), "Pclass"] = np.nan
    df["Sex"] = df["Sex"].str.strip().str.lower().map({"female": 0, "male": 1})
    df["Embarked"] = df["Embarked"].str.strip().str.upper().map(EMBARKED)
    df["Survived"] = df["Survived"].astype(str).str.lower().map({"true": 1, "false": 0, "1": 1, "0": 0})

    # Título extraído do nome -> imputação de gênero e idade mais fiel
    titulo = df["Name"].str.extract(r",\s*([^\.]+)\.")[0].str.strip()
    titulo = titulo.replace({"Mlle": "Miss", "Ms": "Miss", "Mme": "Mrs"})
    titulo = titulo.where(titulo.isin(["Mr", "Mrs", "Miss", "Master"]), "Rare")
    df["Sex"] = df["Sex"].fillna(titulo.map({"Mr": 1, "Master": 1, "Mrs": 0, "Miss": 0}))
    df["Age"] = df["Age"].fillna(df.groupby(titulo)["Age"].transform("median"))

    df["SibSp"] = df["SibSp"].fillna(0)
    df["Parch"] = df["Parch"].fillna(0)
    df["FamilySize"] = df["SibSp"] + df["Parch"] + 1
    df["Pclass"] = df["Pclass"].fillna(df["Pclass"].mode()[0])
    df["Embarked"] = df["Embarked"].fillna(df["Embarked"].mode()[0])
    df["Sex"] = df["Sex"].fillna(df["Sex"].mode()[0])
    df["Age"] = df["Age"].fillna(df["Age"].median())
    return df.dropna(subset=["Survived"])


def exportar_arvore(estimador):
    """
    Serializa uma DecisionTreeRegressor do GBT no formato compacto lido por web/src/model/inference.js.

    Cada chave é uma lista indexada pelo id do nó: f (feature, -2 = folha), t (limiar),
    l/r (filho esquerdo/direito, -1 = folha), v (valor do nó) e n (amostras no nó).

    Parâmetros:
        estimador (DecisionTreeRegressor): uma árvore de `modelo.estimators_`.

    Retorna:
        dict serializável em JSON.
    """
    t = estimador.tree_
    return {
        "f": t.feature.tolist(),               # índice da feature (-2 = folha)
        "t": np.round(t.threshold, 6).tolist(),
        "l": t.children_left.tolist(),
        "r": t.children_right.tolist(),
        "v": np.round(t.value[:, 0, 0], 6).tolist(),  # valor do nó (inclusive internos, p/ atribuição)
        "n": t.n_node_samples.tolist(),
    }


def main():
    """
    Treina, avalia e exporta o modelo.

    1. Validação cruzada estratificada (5 folds) para a acurácia média.
    2. Hold-out de 20% para precisão, recall, F1 e ROC-AUC.
    3. Modelo final treinado com todos os registros e exportado para SAIDA (model.json),
       junto com métricas, importâncias e estatísticas do dataset exibidas na web.
    """
    bruto = pd.read_csv(CSV)
    df = preparar(bruto)
    X, y = df[FEATURES].astype(float), df["Survived"].astype(int)

    params = dict(n_estimators=150, learning_rate=0.05, max_depth=3, subsample=0.9, random_state=42)
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    acc_cv = cross_val_score(GradientBoostingClassifier(**params), X, y, cv=cv, scoring="accuracy")

    X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    holdout = GradientBoostingClassifier(**params).fit(X_tr, y_tr)
    pred, proba = holdout.predict(X_te), holdout.predict_proba(X_te)[:, 1]

    modelo = GradientBoostingClassifier(**params).fit(X, y)  # modelo final: todos os registros

    base = float(modelo.init_.class_prior_[1])
    agrupado = lambda col: {str(int(k)): round(float(v), 4) for k, v in df.groupby(col)["Survived"].mean().items()}

    saida = {
        "features": FEATURES,
        "learningRate": params["learning_rate"],
        "init": float(np.log(base / (1 - base))),
        "trees": [exportar_arvore(e[0]) for e in modelo.estimators_],
        "importances": dict(zip(FEATURES, np.round(modelo.feature_importances_, 4).tolist())),
        "params": params,
        "metrics": {
            "cvAccuracy": round(float(acc_cv.mean()), 4),
            "cvStd": round(float(acc_cv.std()), 4),
            "holdoutAccuracy": round(float(accuracy_score(y_te, pred)), 4),
            "precision": round(float(precision_score(y_te, pred)), 4),
            "recall": round(float(recall_score(y_te, pred)), 4),
            "f1": round(float(f1_score(y_te, pred)), 4),
            "rocAuc": round(float(roc_auc_score(y_te, proba)), 4),
        },
        "dataset": {
            "rows": int(len(df)),
            "rawRows": int(len(bruto)),
            "survivalRate": round(float(y.mean()), 4),
            "meanAge": round(float(df["Age"].mean()), 1),
            "bySex": agrupado("Sex"),
            "byClass": agrupado("Pclass"),
            "byEmbarked": agrupado("Embarked"),
            "countByClass": {str(int(k)): int(v) for k, v in df["Pclass"].value_counts().sort_index().items()},
            "countByEmbarked": {str(int(k)): int(v) for k, v in df["Embarked"].value_counts().sort_index().items()},
        },
    }
    SAIDA.parent.mkdir(parents=True, exist_ok=True)
    SAIDA.write_text(json.dumps(saida, separators=(",", ":")), encoding="utf-8")
    print(f"Registros: {len(df)} | CV acc: {acc_cv.mean():.3f} ± {acc_cv.std():.3f} | holdout: {saida['metrics']}")
    print("Importâncias:", saida["importances"])
    print("Exportado em", SAIDA)


if __name__ == "__main__":
    main()
