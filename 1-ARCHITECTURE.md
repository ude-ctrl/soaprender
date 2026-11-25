# ARCHITECTURE.md — Arquitetura de Software e Dados

## 1. Stack Tecnológica (Otimizada para GitHub Pages)
* **Core:** React 18+ com TypeScript (strict mode ativado).
* **Build Tool:** Vite (configurado com `base: './'` ou `base: '/nome-do-repo/'` para deploy direto no GitHub Pages).
* **Estilização:** Tailwind CSS + CSS Variables (para alternância instantânea entre os 3 temas: Claro, Escuro e Gamer).
* **Ícones e Animações:** `lucide-react` (ícones limpos) e `framer-motion` (animações de combo, virada de flashcard e desbloqueio de nós da trilha).
* **Estado Global:** Zustand (leve, simples para o Codex manter e fácil de integrar com persistência).
* **Áudio (Opcional/Silenciável):** Web Audio API sintetizada (beeps sutis de acerto, combo e level-up sem precisar hospedar arquivos MP3 pesados).

---

## 2. Estrutura de Pastas do Projeto
Separação rigorosa entre **conteúdo (JSON)**, **regras de negócio (engine)** e **interface (components)** para evitar que o código fique monolítico.

```text
src/
├── content/                  # Dados puros (Motor Multi-Edital)
│   ├── subjects.json         # Índice de disciplinas disponíveis (v1: geografia)
│   └── geografia/
│       ├── trail.json        # Ordem e conexões dos nós da trilha
│       ├── cartografia.json  # Flashcards e questões do nó Cartografia
│       ├── fisica.json       # Flashcards e questões de Geografia Física
│       └── ...
├── types/                    # Contratos TypeScript estritos
│   ├── content.ts            # Tipos de Disciplina, Nó, Flashcard e Questão
│   ├── progress.ts           # Tipos de SRS, Histórico, XP, Combo e Analytics
│   └── theme.ts              # 'light' | 'dark' | 'gamer'
├── engine/                   # Lógica pura (sem dependência de React)
│   ├── srs.ts                # Algoritmo SM-2 (Repetição Espaçada)
│   ├── gamification.ts       # Cálculo de XP, Patentes, Combos e Domínio (%)
│   ├── analytics.ts          # Taxa de acerto, tempo médio e caderno de erros
│   └── storage/
│       ├── StorageAdapter.ts # Interface abstrata (Local hoje, Nuvem amanhã)
│       └── LocalStorageAdapter.ts
├── store/
│   └── useStudyStore.ts      # Estado global (Zustand) conectado ao StorageAdapter
├── components/
│   ├── layout/               # Header, Seletor de Temas, Navegação
│   ├── trail/                # Mapa visual de nós conectados e barra de domínio
│   ├── flashcards/           # Card 3D, botões SRS (Errei/Difícil/Bom/Fácil)
│   ├── quiz/                 # Timer regressivo, barra de combo, feedback imediato
│   ├── analytics/            # Painel de desempenho e Caderno de Erros
│   └── common/               # Modal de confirmação de Reset, Botão de Backup
├── App.tsx
└── main.tsx