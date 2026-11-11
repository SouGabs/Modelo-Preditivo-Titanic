# %% Bibliotecas necessárias
  
import pandas as pd
from sklearn.preprocessing import StandardScaler
import numpy as np
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score
import matplotlib.pyplot as plt
from kneed import KneeLocator
from sklearn.model_selection import train_test_split
import seaborn as sns
from imblearn.over_sampling import SMOTE

# %% Função parar carregar os arquivos
def carregar_dados(caminho_arquivo):
    """
    Carrega os dados de um arquivo CSV e retorna um DataFrame do pandas.

    """
    try:
        dados = pd.read_csv(caminho_arquivo)
        return dados
    except Exception as e:
        print(f"Erro ao carregar o arquivo: {e}")
        return None

# Carregando os dados 
df = carregar_dados('Titanic-Dataset-Modificado.csv').drop_duplicates().reset_index(drop=True)

df.head(5)


# %% 
# 2) Formatação de cada coluna (OBS: de cada coluna que utilizarei)

def para_numerico(serie):
    """
    Converte texto sujo (vírgula decimal, letras, espaços) em número; o que não der vira NaN.
    """
    return pd.to_numeric(serie
                         .astype(str)
                         .str.replace(",", ".")
                         .str.extract(r"(-?\d+\.?\d*)")[0], errors="coerce"
                         )

for col in ["Age", "Fare", "SibSp", "Parch"]:
    df[col] = para_numerico(df[col])
    df.loc[df[col] < 0, col] = np.nan   # valores negativos não fazem sentido

df.loc[(df["Age"] > 100), "Age"] = np.nan # Idades maiores que 100 também serão retiradas

df.loc[~df["Pclass"].isin([1, 2, 3]), "Pclass"] = np.nan

df["Fare_log"] = np.log1p(df["Fare"])

df['Sex'] = (df['Sex']
             .str.strip()
             .str.lower()
             .map({'female': 0, 'male': 1}))

df["Embarked"] = (df['Embarked']
                          .str.strip()
                          .str.upper()
                          .map({'C': 0, 'Q': 1, 'S': 2}))





# %% 
# Tratando outlier de Fare

colunas_para_tratar = ['Fare']

#  Aplicando a técnica de Capping (Winsorização baseada em percentis)
for col in colunas_para_tratar:
    if col in df.columns:
        # Definir os limites inferior (1%) e superior (99%) convertendo para float
        limite_inferior = float(df[col].quantile(0.01))
        limite_superior = float(df[col].quantile(0.99))
        
        # Aplicar o limite restritivo (clip)
        df[col] = df[col].clip(lower=limite_inferior, upper=limite_superior)

print("Tratamento de outliers concluído com sucesso!")
print(df[colunas_para_tratar].describe())

# %% 


"""
Apliccando o one-hot encoding para a coluna "Embarked" e 
criando uma nova coluna "FamilySize" que é a soma de "SibSp" e "Parch" mais 1 
(para incluir o próprio passageiro). Também extraindo títulos dos nomes e aplicando 
one-hot encoding para a coluna "Title" e assim poder prever com mais acertividade o genero dos passageiros. 
Por fim, aplicando one-hot encoding para a coluna "Pclass".
"""
df['Embarked_encoded'] = df["Embarked"] 

df = pd.get_dummies(df, columns=["Embarked_encoded"], prefix="Embarked", dtype=float)

df["FamilySize"] = df["SibSp"] + df["Parch"] + 1

df["Title"] = df["Name"].str.extract(r",\s*([^\.]+)\.")[0].str.strip()

df["Title"] = df["Title"].replace({
    "Mlle": "Miss", "Ms": "Miss", "Mme": "Mrs",
    "Lady": "Rare", "the Countess": "Rare", "Countess": "Rare", "Dona": "Rare",
    "Capt": "Rare", "Col": "Rare", "Major": "Rare", "Dr": "Rare",
    "Rev": "Rare", "Don": "Rare", "Sir": "Rare", "Jonkheer": "Rare",
})
df = pd.get_dummies(df, columns=["Title"], prefix="T", dtype=float)

df["Pclass_encoded"] = df["Pclass"].astype(float)
df = pd.get_dummies(df, columns=["Pclass_encoded"], prefix="P", dtype=float)

list(df.columns)

# %% 

df = df.drop(columns=["Name","PassengerId", "Ticket", "Cabin",
                      "cost", "budget", "day", "month", "year", "time"])

for col in ["Sex", "Pclass", "Embarked", "FamilySize"]:
    sns.barplot(data=df, x=col, y="Survived"); plt.title(f"Taxa de sobrevivência por {col}"); plt.show()

titulos = [c for c in df.columns if c.startswith("T_")]
print(df.groupby(df[titulos].idxmax(axis=1))["Survived"].mean())

sns.histplot(data=df, x="Age", hue="Survived", kde=True); plt.show()
sns.boxplot(data=df, x="Survived", y="Fare_log"); plt.show()

sns.heatmap(df.select_dtypes("number").corr(), cmap="coolwarm", center=0); plt.show()

# %%


"""
Separando as features a serem usadas no kmeans, 
dividindo o dataframe em commpletos (sem nnulos) e incompletos(com nulos)
no final o objetivo é ter o dataset2 sem nulos e balanceado
"""

features = (["FamilySize","P_1.0","P_2.0","P_3.0", "Sex", "Age", "Fare_log","Parch","SibSp",
             "T_Master","T_Miss","T_Mr","T_Mrs","T_Rare","Embarked_0.0",
             "Embarked_1.0","Embarked_2.0" ])

a_imputar = ["Age", "Pclass", "Sex", "Embarked"]  # Moda
numericas = ["Age"]   # imputadas pela mediana; as demais pela moda

# Cada coluna imputada -> as dummies dela que entram no K-means
dummies_de = {
    "Pclass":   ["P_1.0", "P_2.0", "P_3.0"],
    "Embarked": ["Embarked_0.0", "Embarked_1.0", "Embarked_2.0"],
}

def mascarar_dummies(dados):
    """
    Onde a coluna original é NaN, as dummies dela também viram NaN.
    Sem isso, o get_dummies deixa 0,0,0 e o K-means interpreta
    esses zeros como informação observada.
    """
    dados = dados.copy()
    
    for origem, dums in dummies_de.items():
        dados.loc[dados[origem].isna(), dums] = np.nan

    return dados# Cada coluna imputada -> as dummies dela que entram no K-means

dummies_de = {
    "Pclass":   ["P_1.0", "P_2.0", "P_3.0"],
    "Embarked": ["Embarked_0.0", "Embarked_1.0", "Embarked_2.0"],
}



incompletos = df[a_imputar].isna().any(axis=1)

dataset2 = df[~incompletos].copy()
atributo_alvo = df[incompletos].copy()
atributo_alvo = mascarar_dummies(atributo_alvo) 

# Garantia: o K-Means não aceita NaN, então nenhuma feature pode ter ficado de fora da separação
nulos_features = dataset2[features].isna().sum()
assert nulos_features.sum() == 0, f"Features com NaN nos completos:\n{nulos_features[nulos_features > 0]}"
# %% 
def outliers_boxplot(data):   
    plt.figure(figsize=(8, 5))
    sns.boxplot(x=data['Fare'])
    plt.title(f'Identificação de Outliers com Boxplot ')
    plt.xlabel('Valores')
    plt.show()
    return 

outliers_boxplot(dataset2)
outliers_boxplot(atributo_alvo)

# %% 

"""
Escolha do k de forma dinamica
usando a biblioteca kneed para identificar o melhor valor para k
"""

def avaliar_k(X, titulo, ks=range(2, 11)):

    X_scaled = StandardScaler().fit_transform(X) 

    inercias, silhuetas = [], []

    for k in ks:

        km = KMeans(n_clusters=k, n_init=10, random_state=42)

        labels = km.fit_predict(X_scaled)

        inercias.append(km.inertia_)

        silhuetas.append(silhouette_score(X_scaled, labels))



    fig, ax = plt.subplots(1, 2, figsize=(12, 4))

    fig.suptitle(titulo)

    ax[0].plot(ks, inercias, "o-"); ax[0].set_title("Cotovelo (inércia)")

    ax[1].plot(ks, silhuetas, "o-"); ax[1].set_title("Silhueta")

    plt.show()

    cotovelo = KneeLocator(list(ks), inercias, curve="convex", direction="decreasing").elbow

    return cotovelo if cotovelo is not None else list(ks)[int(np.argmax(silhuetas))]

k_otimo =  avaliar_k(dataset2[features], "Escolha do k para K-Means")
print("k escolhido:", k_otimo)
# %%


def imputar_por_cluster(completos, incompletos, k):
    completos, incompletos = completos.copy(), incompletos.copy()

    scaler = StandardScaler()
    X_comp = scaler.fit_transform(completos[features])          # fit SÓ nos completos
    km = KMeans(n_clusters=k, n_init=10, random_state=42)
    completos["cluster"] = km.fit_predict(X_comp)
    centroides = km.cluster_centers_

    X_inc = scaler.transform(incompletos[features])             # NaN são preservados
    def cluster_parcial(linha):
        obs = ~np.isnan(linha)
        dist = ((centroides[:, obs] - linha[obs]) ** 2).sum(axis=1) / obs.sum()
        return dist.argmin()
    incompletos["cluster"] = [cluster_parcial(l) for l in X_inc]

    stats = completos.groupby("cluster").agg(
        Age=("Age", "median"),
        Pclass=("Pclass", lambda s: s.mode()[0]),
        Sex=("Sex", lambda s: s.mode()[0]),
        Embarked=("Embarked", lambda s: s.mode()[0]),
        
        
    )
    for col in a_imputar:
        faltando = incompletos[col].isna()
        incompletos[f"{col}_imputado"] = faltando
        incompletos.loc[faltando, col] = incompletos.loc[faltando, "cluster"].map(stats[col])

    return completos, incompletos

completos_c, incompletos_c = imputar_por_cluster(dataset2, atributo_alvo, k_otimo)
df_imputado = pd.concat([completos_c, incompletos_c]).sort_index()
flags = [f"{c}_imputado" for c in a_imputar]
df_imputado[flags] = df_imputado[flags].fillna(False).astype(bool)

print(df_imputado[a_imputar].isna().sum())   # tudo deve dar 0

# %%

treino, teste = train_test_split(dataset2, test_size=0.2, random_state=42)

resultados = {}   # guarda real × imputado de cada coluna para os gráficos

for col in a_imputar:
    teste_mask = teste.copy()
    teste_mask[col] = np.nan                    
    teste_mask = mascarar_dummies(teste_mask)  
    treino_c, teste_imp = imputar_por_cluster(treino, teste_mask, k_otimo)
    resultados[col] = {"real": teste[col], "imputado": teste_imp[col]}

    if col in numericas:
        baseline = treino[col].median()
        erro_c = (teste[col] - teste_imp[col]).abs().mean()
        erro_b = (teste[col] - baseline).abs().mean()
        resultados[col].update(baseline=baseline, metrica_c=erro_c, metrica_b=erro_b)
        print(f"{col}: MAE cluster {erro_c:.2f} | MAE mediana global {erro_b:.2f}")
    else:
        baseline = treino[col].mode()[0]
        acc_c = (teste[col] == teste_imp[col]).mean()
        acc_b = (teste[col] == baseline).mean()
        resultados[col].update(baseline=baseline, metrica_c=acc_c, metrica_b=acc_b)
        print(f"{col}: acurácia cluster {acc_c:.1%} | acurácia moda global {acc_b:.1%}")

    if col == "Sex":
        # Pontuação para a ROC: proporção de homens no cluster em que cada passageiro caiu
        prop_male = treino_c.groupby("cluster")["Sex"].mean()
        resultados[col]["score"] = teste_imp["cluster"].map(prop_male)


        # %%
        """
Verificado no inicio do pipeline, tratamento do df, onde apliquei a técnica de 
Capping (Winsorização baseada em percentis) para a coluna 'Fare'.
"""

# 2) Reescalar os dados

"""
Possuimos algumas colunas desatualizadas, será nencessário removelas e transformar 
as colunas categoricas em numéricas novamente, para então reescalar os dados. 
"""
colunas_para_remover = (
    [c for c in df_imputado.columns if c.startswith(("Embarked_", "P_"))]  # dummies antigas
    + [c for c in df_imputado.columns if c.endswith("_imputado")]           # flags
    + ["cluster",                # artefato do K-means
       "Fare",                   # mantenho Fare_log (menos assimétrica)
       "SibSp", "Parch"]         # resumidas em FamilySize
)

dataset2 = df_imputado.drop(columns=colunas_para_remover, errors="ignore")

# Aqui estou Garantindo que 'Sex' volte temporariamente aos nomes originais para o get_dummies gerar 'Sex_female' e 'Sex_male'

dataset2["Sex"] = dataset2["Sex"].map({0: "female", 1: "male"})
dataset2["Survived"] = dataset2["Survived"].astype(int)

# aplica o get_dummies nas colunas categóricas principais, agora atualizadas imputadas
dataset2 = pd.get_dummies(
    dataset2, 
    columns=["Embarked", "Sex"], 
    dtype=float
)



#  Split estratificado ANTES de escalar (evita vazamento de dados)
X = dataset2.drop(columns=["Survived"])
y = dataset2["Survived"]
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y)

# 4) Reescala: fit só no treino, transforma no teste
scaler = StandardScaler()
X_train_scaled = pd.DataFrame(scaler.fit_transform(X_train), columns=X.columns, index=X_train.index)
X_test_scaled  = pd.DataFrame(scaler.transform(X_test),      columns=X.columns, index=X_test.index)

X_train_scaled.describe().loc[["mean", "std"]].round(2)  # média ~0, desvio ~1

# %%
# SMOTE só no treino (o teste mantém a proporção real)
print("Antes:\n", y_train.value_counts())
X_train_bal, y_train_bal = SMOTE(random_state=42).fit_resample(X_train_scaled, y_train)
print("Depois:\n", y_train_bal.value_counts())

#  Montar e salvar
treino_final = X_train_bal.assign(Survived=y_train_bal.values)
teste_final  = X_test_scaled.assign(Survived=y_test.values)

treino_final.to_csv("titanic_treino_final.csv", index=False)
teste_final.to_csv("titanic_teste_final.csv", index=False)

import joblib
joblib.dump(scaler, "scaler.pkl")

print(treino_final.shape, teste_final.shape)

# %%

