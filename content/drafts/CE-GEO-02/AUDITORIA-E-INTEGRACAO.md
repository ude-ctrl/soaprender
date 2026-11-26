# Cartografia — auditoria de cobertura e integração
25/11/2026 — etapa de triagem, não homologação científica. Unidade original CE-GEO-02 preservada. Referência curricular provisória: edital_subtopicos no seduc-ma-bundle.json; texto oficial específico do anexo ainda precisa ser confrontado.

| Escopo registrado no bundle | Material candidato | Achado / ação |
|---|---|---|
| Conceitos e histórico | linguagem-cartografica + 02-historia-cartografia.md | História sem missão própria no legado; nova missão adicionada. Aprofundar tradições, Brasil e fontes específicas. |
| Coordenadas e movimentos | orientacao-azimute, coordenadas-gms + 03-movimentos-terra.md | Movimentos não têm missão própria; nova missão adicionada antes dos fusos. Verificar eixos, estações, dia solar/sideral, longitude. |
| Fusos | fusos-utc-data | Conferir hora civil, datas, legislação Lei 12.876/2013, mapa IBGE e fronteiras. |
| Escalas | escalas-e-medidas | Conferir conversões, áreas quadráticas, escala gráfica, generalização e precisão. |
| Projeções | projecoes-propriedades, mercator-peters-utm | Conferir conformidade local, equivalência, equidistância restrita; UTM não é datum. |
| Cartografia temática | semiologia-tematica, graficos-perfis-relevo, leitura-critica-integrada | Corrigir erro no bundle: mapa coroplético deve usar grandezas relativas/normalizadas quando apropriado; curvas de nível são assunto distinto. Conferir simbologia, classificação, legendas, perfis e vieses. |
| Sensoriamento remoto | sensores-espectro, resolucoes-indices-classificacao | Conferir sensores ativos/passivos, quatro resoluções, índices, classificação, imagens Landsat e limites interpretativos. |
| GPS/SIG | gnss-referenciais, sig-modelos-operacoes, geoprocessamento-dados-digitais | Conferir GNSS versus GPS, referenciais, vetor/raster, operações espaciais e precisão. |
| Aplicações e ensino | amazonia-monitoramento, cartografia-escolar | Adaptar Pará para Maranhão, sem apagar exemplos científicos universais; conferir recorte dos sistemas INPE. Ensino de cartografia complementar ou cruzado com unidade pedagógica conforme edital. |

## Triagem automática dos originais
161 questões: 110 com quatro alternativas e 51 com cinco; todos os IDs de gabarito apontam para exatamente uma opção, sem IDs duplicados entre os três pacotes. Isso não comprova correção científica nem unicidade semântica. Distribuição de dificuldade original: nível 1 = 125; nível 2 = 20; nível 3 = 14; nível 4 = 2. 120 cards sem IDs repetidos. As classificações não são calibradas para FCC.

## Evidência de prova
FCC, SEDU-ES, Professor de Geografia, 2022, item indexado Q2400150: https://www.qconcursos.com/questoes-de-concursos/provas/fcc-2022-sedu-es-professor-mapb-ensino-fundamental-e-medio-geografia/questoes?page=3
Consulta 25/11/2026. Questão combina juízo de afirmativas sobre seletividade cartográfica, escala topográfica e propriedades de projeção. Usar o formato como referência para questões inéditas interligadas; não reproduzir enunciado, não inferir incidência de uma ocorrência. Gabarito oficial e caderno original ainda precisam ser conferidos. Ampliar corpus FCC antes de afirmar frequência.

## Integração incremental (Codex)
Usar a branch mais recente do redesign conciliada com main e importar apenas commits de conteúdo. Não substituir o bundle inteiro. Manter CE-GEO-02 como unidade e IDs atuais; as 19 missões propostas (17 legadas + duas novas) são núcleos internos, não novas unidades do edital. Criar adaptador tipado para conteúdo modular, seção de leitura e referências; manter fallback do bundle. Não renderizar HTML bruto de fonte, sanitizar/transformar para componentes seguros preservando tabelas e SVGs validados. Não carregar imagens externas sem conferir licença e segurança. Separar banco de fixação de quatro opções de treino FCC de cinco opções: não preencher quinta alternativa artificialmente; adaptar e revisar individualmente antes de migrar. IDs estáveis e mapeamento de proveniência; preservar progresso. Não rotular pacote legado como aprovado no SOaprender.
Sequência sugerida: linguagem → história → orientação → coordenadas → movimentos → fusos → escalas → projeções → Mercator/Peters/UTM → semiologia → gráficos/relevo → leitura integrada → sensores → resoluções → GNSS → SIG → geoprocessamento → monitoramento → ensino. Evitar redundância e antecipação de conceitos; validar pré-requisitos. Manter síntese de revisão separada. 
Pendências bloqueadoras de conclusão: obter anexo oficial, revisar cada seção e questão, verificar referências primárias e imagens, acrescentar exercícios avançados, auditar de novo as alterações, integrar e testar no app. Publicar apenas com estado editorial honesto. Não criar novo sistema de progresso nem aguardar expansão das demais 44 unidades.
