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
