# Design do SOaprender — Inteligência Editorial

## 1. Direção artística

Plataforma autoral de preparação para concursos, exclusivamente FCC, inicialmente SEDUC-MA. Combinar autoridade acadêmica, elegância editorial, tecnologia contemporânea e progressão estratégica. A estética serve à aprendizagem, não ao espetáculo.

Referências de princípios (não copiar marcas, layouts ou ativos): Linear — precisão e consistência; Brilliant — explicações visuais e interatividade; Readwise Reader e Apple Books — leitura e tipografia editorial; Duolingo — continuidade e progresso, sem estética infantil.

Evitar aparência de template gerado por IA: hero gigante decorativo, cards repetitivos, excesso de bordas e arredondamentos, gradientes roxo/azul genéricos, sombras pesadas, emojis como ícones, métricas fictícias e desperdício de espaço. Cada elemento deve ter uma função.

## 2. Composição e hierarquia

- Composição editorial com alinhamentos claros, ritmo vertical, espaço negativo intencional, títulos expressivos e agrupamento por significado. Usar listas, divisores e superfícies somente quando úteis.
- Leitura e prática: coluna confortável de até 760 px, texto teórico aproximadamente 60–75 caracteres por linha. Home e navegação podem aproveitar largura maior no desktop, sem sidebars pesadas ou excesso de painéis. Cabeçalho compacto de 56 px; navegação inferior abaixo de 640 px; alvos de toque de pelo menos 44 px.
- Home: ação principal de estudo (próxima missão, motivo, duração estimada quando disponível); revisões devidas, progresso de cobertura e domínio separados, desempenho com amostra suficiente; disciplinas organizadas por prioridade fundamentada e estado real. Contexto estratégico do edital sem banners decorativos. Para novos usuários, oferecer início claro em vez de números artificiais.
- Unidade: objetivo, teoria estruturada, exemplos, comparações, visuais instrutivos quando necessários, recuperação ativa e prática FCC. Um modelo reutilizável para todas as unidades.
- Questões: foco no enunciado e alternativas legíveis, feedback explicativo e análise de distratores. Flashcards: pergunta antes da resposta, autoavaliação clara. Revisões e erros: filas acionáveis.

## 3. Tipografia — proposta para prototipagem

- Manrope: títulos e identidade; Source Sans 3: navegação e interface; Source Serif 4: leitura teórica prolongada. Usar fallbacks adequados, poucos pesos e carregamento eficiente. Confirmar com amostras reais em português antes de adoção definitiva.
- Referências iniciais: corpo teórico 17–19 px e entrelinha 1,6–1,8; interface 15–16 px; títulos com hierarquia clara e pesos moderados. Evitar texto diminuto, excesso de caixa alta e bold indiscriminado.
- Preferir fontes auto-hospedadas quando viável e licença permitir. Testar acentos, números, zoom, contraste e desempenho; não presumir que uma família tipográfica melhora retenção por si só.

## 4. Paleta — proposta para prototipagem

| Token | Claro editorial | Escuro imersivo |
|---|---|---|
| Fundo | #F7F6F2 | #101214 |
| Superfície | #FFFFFF | #1B2024 |
| Texto principal | #192320 | #E8E8E3 |
| Identidade | #17594D | #62B9A3 |
| Conquista | #B48B48 | #D4AE68 |

Verde profundo como identidade; neutros dominantes. Dourado/âmbar como acento restrito, nunca texto pequeno sem contraste suficiente. Coral para erro acompanhado de ícone e texto. Verificar contraste em cada combinação; buscar WCAG 2.2 AA. Não depender apenas de cor para transmitir significado.

## 5. Ciência, psicologia e ética

- Carga cognitiva: minimizar informação irrelevante, segmentar teoria e integrar explicações a seus visuais.
- Gestalt: proximidade, alinhamento, similaridade e hierarquia para tornar relações perceptíveis.
- Autodeterminação: favorecer autonomia, competência e controle; permitir estudo livre e metas realistas.
- Recuperação ativa e repetição espaçada: oportunidades de evocação e revisão com feedback, sem substituir compreensão conceitual.
- Metacognição: mostrar lacunas e evidências de aprendizagem, distinguindo cobertura, acurácia, domínio estimado e XP.
- Feedback formativo: explicar o erro e oferecer oportunidade de recuperação.
- Gamificação adulta: progresso significativo, celebração discreta, sem punição por ausência, pressão compulsiva ou promessas sobre dopamina.
- Princípios científicos orientam hipóteses de design, não comprovam a eficácia desta interface específica. Documentar referências científicas verificadas e testar usabilidade; não inventar citações ou alegações.

## 6. Modos e acessibilidade

Aparência light/dark independente de intensidade focus/arena. Foco remove relógio e HUD durante prática; Arena opcional com combo e timer via transform: scaleX(). Áudio mudo por padrão. Ícones Lucide, foco de teclado visível, movimento reduzido, animações discretas. Diálogos de confirmação e retorno ao controle de origem. Preservar backup, resets e dados reais do navegador.

## 7. Processo e critérios de aceitação

Prototipar home, unidade teórica, questão e flashcard com conteúdo real; validar direção artística com usuário antes do redesign integral. Consolidar alterações em uma tarefa Codex, sem reconstruir motores ou acervo. Priorizar legibilidade, navegação, acessibilidade e ação de estudo; adiar efeitos sofisticados. Validar desktop/mobile, fluxo de estudo, contraste, teclado, persistência e build. Não confundir acabamento visual com validação pedagógica.

O protótipo histórico permanece em docs/design-preview.html; não é especificação normativa. A paleta e famílias tipográficas novas são propostas, sujeitas à validação visual. Até a implementação, a aparência atual permanece funcional.

## 8. Direção visual aprovada — Editorial Tecnológico Premium (25/11/2026)
Aprovados os conceitos claro e escuro com linguagem editorial sofisticada e tecnológica. Mesma arquitetura visual em ambos: navegação lateral compacta e recolhível em desktop, cabeçalho discreto, missão prioritária, trilha visual, disciplinas reais e painel auxiliar de desempenho/revisões quando a largura permitir. No celular, reorganizar em coluna e navegação inferior. Na leitura e prática, minimizar ou ocultar painéis acessórios.
- Claro: papel marfim, verde profundo, dourado pontual, texto escuro de alto contraste. Escuro: carvão com nuances verdes, verde luminoso moderado e dourado pontual, texto claro. Evitar brilho excessivo e gradientes decorativos.
- Títulos editoriais com Source Serif 4 como candidata aprovada para experimentação; interface Source Sans 3 e marca/títulos utilitários Manrope. Ajustar tamanhos e pesos para leitura confortável; testar contraste e fontes reais.
- Iconografia Lucide e ilustrações SVG autorais: globos em linhas, curvas de nível, camadas cartográficas, silhuetas, diagramas geométricos e conceituais. Sem fotos decorativas ou imagens realistas. Ilustrações não devem competir com texto ou controles; separar elementos decorativos dos diagramas didáticos acessíveis.
- Priorizar composição editorial, divisores finos, espaço negativo, poucos cards, alinhamento e dados acionáveis. Não transformar o site em painel genérico ou jogo infantil.
- Protótipos são referências de composição, não fontes de dados: usar os seis grupos de disciplinas do bundle, progresso real, recomendações fundamentadas e estados vazios honestos. Não criar nomes de unidades ou números inexistentes. Busca, metas e demais controles somente se funcionais; omitir ou identificar claramente o que não estiver implementado.
- A direção da home nos dois temas está aprovada. Validar as demais telas com a mesma linguagem, sem reiniciar exploração estética. Referências visuais desta conversa ainda não estão armazenadas no repositório.

## 9. Ambiente de aprendizagem aprovado (25/11/2026)
Referência: leitor editorial premium com sumário de conceitos à esquerda, teoria central serifada, diagramas SVG didáticos integrados e painel direito de ferramentas (síntese, conceito-chave, recuperação ativa e prática, conforme recursos reais). Três layouts: integrado; leitura expandida com ambos os painéis recolhíveis independentemente; Foco Total sem menus, métricas, XP ou notificações, com controle de saída discreto e acessível. Foco Total é independente da intensidade Foco/Arena e da aparência claro/escuro. Persistir preferências, conservar posição de leitura e progresso ao alternar, restaurar layout anterior; oferecer atalhos sem conflitar com controles de prática, foco de teclado e alternativa móvel. Limitar texto a medida confortável de aproximadamente 60–75 caracteres por linha; diagramas/tabelas podem ocupar largura maior. Painéis móveis em gavetas ou seções sob demanda. Não tratar leitura concluída como domínio; não incluir controles sem implementação. Reutilizar o mesmo leitor nas 45 unidades. Protótipo visual aprovado na conversa, ainda não anexado ao repositório.

### Refinamento aprovado: leitura imersiva
A instrução anterior de três layouts não exige seletor de três modos. O Foco Total deve ser um recurso auxiliar e discreto de leitura, acionado por pequeno ícone de expansão com nome acessível, especialmente útil em textos longos. Ocultar cabeçalhos, menus, painéis e HUD, deixando apenas conteúdo, diagramas e mapas, com controle discreto de saída e tecla Escape. Preservar posição de leitura e restaurar layout anterior. Permitir recolher painéis independentemente no layout normal. Manter medida confortável dos parágrafos, mesmo com área de tela inteira disponível. Não confundir com intensidade Foco/Arena.

**Controle de imersão:** exibir somente o ícone Lucide Maximize/Minimize, sem rótulo textual permanente. Tooltip discreto “Leitura imersiva” ao passar o mouse ou receber foco de teclado; no estado ativo, “Sair da leitura imersiva”. Manter nome acessível (aria-label), alvo de toque de 44 px e saída via Escape. Esta regra prevalece sobre exemplos anteriores com texto visível.

## Ambiente de questões FCC aprovado
Adotar composição Editorial Tecnológico Premium: enunciado e cinco alternativas A–E legíveis, seleção seguida de confirmação explícita, eliminação reversível de alternativas sem revelar gabarito, navegação de sessão e feedback somente após confirmar. Exibir justificativa do gabarito e análise individual dos distratores conforme dados reais; indicar corretamente questões inéditas no padrão FCC e estado editorial. Não inventar origem, estatísticas ou links. Modo Foco sem cronômetro e combos; Arena opcional com timer e gamificação. Painel de feedback recolhível, disponível após resposta, e ícone discreto de imersão com tooltip acessível. Em telas pequenas, feedback abaixo da questão. Preservar respostas, progresso, teclado e acessibilidade; não confundir velocidade ou XP com domínio. Protótipo aprovado como referência de composição, não como fonte de dados.

## Flashcards inteligentes — protótipo aprovado
Adotar o primeiro protótipo de flashcards da conversa como referência visual: composição Editorial Tecnológico Premium, cartão central espaçoso, tipografia editorial legível, navegação lateral recolhível, painel auxiliar opcional de progresso e revisão. Pergunta isolada inicialmente; resposta e pistas que revelem o gabarito devem permanecer ocultas até ação explícita (Mostrar resposta ou atalho acessível). Após revelação, oferecer Errei, Difícil, Bom e Fácil; mostrar intervalos calculados pelo motor real de repetição espaçada, nunca fixos ou fictícios. Autoavaliação não equivale a acerto objetivo. Preservar progresso, acessibilidade, navegação por teclado, temas claro/escuro, ícone discreto de imersão e responsividade. Evitar controles redundantes e fotografias decorativas. Usar dados e conteúdo reais do bundle. Prototipagem das quatro telas principais concluída; próxima etapa: implementação consolidada no Codex, sem reconstruir motores, acervo ou persistência. Os protótipos gráficos ainda não estão anexados ao repositório.
