# Diretrizes do SOaprender

Leia PRD.md, ARCHITECTURE.md e DESIGN.md antes de alterar a aplicação. A missão inicial tem janela de sete dias. Priorize uma entrega funcional, verificações essenciais e correção de bloqueios de uso e publicação.

- Banca exclusiva FCC. Concurso prioritário SEDUC-MA, Professor de Geografia, código 17.
- Use o bundle original e preserve identificadores, fontes e estados editoriais. Identifique questões inéditas e sinalize material em auditoria. Não atribua incidência histórica à FCC sem evidência.
- Use React, TypeScript strict, Vite, Tailwind CSS, Zustand, Lucide React e Framer Motion. Isole o motor de aprendizagem e o StorageAdapter em `src/engine/`. Mantenha arquivos abaixo de 300 linhas.
- Preserve os eixos independentes de aparência `light | dark` e intensidade `focus | arena`. Foco sem relógio e com HUD oculto durante prática. Arena opcional. Use `transform: scaleX()` na barra do timer, respeite movimento reduzido e indique foco de teclado.
- Use largura responsiva conforme DESIGN.md (leitura até 760 px; home e navegação podem aproveitar desktop), cabeçalho de 56 px, navegação inferior em telas menores que 640 px e alvos de toque de 44 px. Use Lucide, cor coral com ícone e texto, e evite brilho ou sombras pesadas. Áudio silenciado por padrão.
- Fundamente domínio em respostas e recuperação espaçada. Preserve independência de XP, tempo e leitura. Resets local e geral exigem confirmação explícita.
- Valide alterações de conteúdo, TypeScript, testes essenciais e build antes de preparar o PR. Atualize docs/STATUS.md quando houver pendências relevantes.

## Direção artística obrigatória — Inteligência Editorial

- SOaprender deve ter identidade autoral, acadêmica contemporânea, elegante e motivadora. Evite aparência de template de IA: hero decorativo, grades de cards idênticos, excesso de caixas, bordas, pills, gradientes genéricos, sombras pesadas e espaços desperdiçados.
- Leia DESIGN.md como contrato de experiência. Priorize hierarquia tipográfica, composição editorial, ritmo, contraste e alinhamento antes de efeitos. Referências: Linear (precisão), Brilliant (interatividade didática), Readwise Reader e Apple Books (leitura), Duolingo (progressão adulta, sem copiar estética).
- A home deve responder o que estudar agora, por quê, o que revisar e como o estudante evolui. Use apenas dados reais; ausência de dados deve ser explícita. Não invente prioridades históricas FCC nem indicadores.
- Aplique carga cognitiva, agrupamento visual, autonomia, competência, recuperação ativa, revisão espaçada e feedback formativo. Distinga evidência científica de hipótese de design; não prometa aprendizagem por tipografia, cores, XP ou estímulos de dopamina. Sem padrões manipulativos.
- Preserve conteúdos, IDs, progresso, backup, acessibilidade, motores e funcionalidades existentes. Não refatore por estética. Uma interface reutilizável para todas as unidades.
- Prototipe as telas principais antes do redesign integral; valide direção visual com o usuário. Use DESIGN.md para decisões técnicas simples, sem novas rodadas de planejamento. Teste leitura, teclado, contraste, responsividade e fluxos essenciais.
- Trabalhe com agilidade e precisão: ChatGPT para estratégia/conteúdo, Codex para implementação, GitHub como fonte oficial. Não usar Work. Não duplicar documentação nem realizar verificações redundantes. Entregas incrementais; manter a meta de primeira semana sem sacrificar qualidade científica.

## Identidade visual aprovada em 25/11/2026
Adotar Editorial Tecnológico Premium nos temas claro e escuro, com a mesma hierarquia e estrutura. Proibidas fotografias decorativas: usar SVG autoral, silhuetas, curvas de nível, diagramas e representações conceituais leves. Menu lateral compacto no desktop, recolhível, e navegação adaptada ao celular. Painel auxiliar de desempenho apenas quando houver espaço, sem poluir leitura. Não reproduzir indicadores, unidades, nomes ou funcionalidades fictícias dos protótipos. Todas as seis disciplinas reais devem aparecer. Preservar motores e dados; implementar redesign incremental.

## Ambiente de leitura aprovado
Implementar três layouts de leitura: integrado (sumário esquerdo, teoria central, ferramentas pedagógicas à direita), expandido (painéis recolhíveis independentemente) e Foco Total (ocultar navegação, HUD, XP, notificações e painéis acessórios; manter saída acessível). Foco Total é uma preferência de layout independente dos eixos aparência e intensidade Foco/Arena. Preservar posição de leitura, progresso e preferência; oferecer controles visíveis, teclado e retorno ao layout anterior. Manter largura confortável de parágrafos mesmo em tela expandida; permitir diagramas e tabelas mais largos. Aplicar a todas as unidades via componente reutilizável, sem criar conteúdo ou funcionalidades fictícias.
