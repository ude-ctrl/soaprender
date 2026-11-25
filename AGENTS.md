# Diretrizes do SOaprender

Leia PRD.md, ARCHITECTURE.md e DESIGN.md antes de alterar a aplicação. A missão inicial tem janela de sete dias. Priorize uma entrega funcional, verificações essenciais e correção de bloqueios de uso e publicação.

- Banca exclusiva FCC. Concurso prioritário SEDUC-MA, Professor de Geografia, código 17.
- Use o bundle original e preserve identificadores, fontes e estados editoriais. Identifique questões inéditas e sinalize material em auditoria. Não atribua incidência histórica à FCC sem evidência.
- Use React, TypeScript strict, Vite, Tailwind CSS, Zustand, Lucide React e Framer Motion. Isole o motor de aprendizagem e o StorageAdapter em `src/engine/`. Mantenha arquivos abaixo de 300 linhas.
- Preserve os eixos independentes de aparência `light | dark` e intensidade `focus | arena`. Foco sem relógio e com HUD oculto durante prática. Arena opcional. Use `transform: scaleX()` na barra do timer, respeite movimento reduzido e indique foco de teclado.
- Use coluna central de 760 px, cabeçalho de 56 px, navegação inferior em telas menores que 640 px e alvos de toque de 44 px. Use Lucide, cor coral com ícone e texto, e evite brilho ou sombras pesadas. Áudio silenciado por padrão.
- Fundamente domínio em respostas e recuperação espaçada. Preserve independência de XP, tempo e leitura. Resets local e geral exigem confirmação explícita.
- Valide alterações de conteúdo, TypeScript, testes essenciais e build antes de preparar o PR. Atualize docs/STATUS.md quando houver pendências relevantes.
