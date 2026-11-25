# AGENTS.md — Diretrizes Obrigatórias para o Codex

Antes de criar ou editar qualquer arquivo, leia e siga rigorosamente `PRD.md`, `ARCHITECTURE.md` e `DESIGN.md`.

## 1. Regra de Ouro do Layout (Base v1 Limpa)
* **Estrutura:** Coluna única centralizada (`max-width: 760px`), limpa e focada. **NÃO** crie sidebars pesadas, painéis laterais múltiplos ou dashboards com excesso de caixas.
* **Cabeçalho:** Altura fixa (`56px`), minimalista, contendo apenas a marca, status compacto (Streak/XP) e controles discretos.
* **Mobile (`< 640px`):** Navegação inferior limpa na zona do polegar, alvos de toque mínimos de `44px` e áudio iniciando mudo por padrão.

## 2. Regras Visuais e Anti-Genérico
* **Proibido:** Gradientes roxo/azul genéricos, sombras pesadas (`shadow-xl`), emojis como ícones de UI (use apenas `lucide-react`) e `transition: all`.
* **Sistema de 2 Eixos:**
  * `data-appearance="light" | "dark"` (Claro em `#F6F5F1` / Escuro anti-halation em `#0E1014` com texto `#E4E8EF`).
  * `data-intensity="focus" | "arena"` (Foco = leitura limpa sem timer/glow e HUD oculto durante a questão; Arena = prática com timer GPU, combo e feedback rico).
* **Erro Informativo:** Use coral (`#C25E44` / `#E07A5F`) em vez de vermelho saturado, sempre com ícone + texto explicativo.
* **Performance:** Barra de timer animada exclusivamente com `transform: scaleX(...)` (GPU). Respeitar `prefers-reduced-motion` e `:focus-visible`.

## 3. Sincronização de Tipos e Arquitetura
* **Stack:** React + TypeScript (`strict: true`), Vite (`base: './'` para GitHub Pages), Tailwind CSS, Zustand, `lucide-react`, `framer-motion`.
* **Separação estrita:** Toda lógica de SRS (SM-2), cálculo de domínio, seleção calibrada de sessão e persistência (`StorageAdapter` / `LocalStorageAdapter`) deve ficar isolada em `src/engine/`, sem mistura com componentes React.
* **Campos obrigatórios nos tipos:**
  * `UserProgress`: `appearance: 'light' | 'dark'`, `intensity: 'focus' | 'arena'`, `streakFreezes: number`.
  * `Flashcard` e `QuizQuestion`: suporte opcional a `mediaUrl?: string`, `mediaCaption?: string` e `optionExplanations?: string[]`.
  * `StudyAttempt`: `confidence?: 'know' | 'think' | 'guess'` e `wasRecovery: boolean`.

## 4. Disciplina de Código
* Nunca gere arquivos gigantes (>300 linhas). Quebre em componentes pequenos e bem nomeados.
* Todo conteúdo de Geografia deve vir de arquivos JSON em `src/content/geografia/`, nunca hardcoded dentro dos componentes.
* Botões de **Reset Local** (por módulo) e **Reset Geral** (trilha inteira) devem sempre exigir modal de confirmação explícita.