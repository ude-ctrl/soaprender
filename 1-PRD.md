# PRD.md — Plataforma de Estudos Gamificada (Motor Multi-Edital)

## 1. Visão do Produto
Uma aplicação web de alto desempenho focada em retenção de longo prazo para concursos públicos, baseada em métodos comprovados da Ciência Cognitiva e mecânicas de gamificação orientadas a foco e recompensa visual.

* **Foco da Versão 1 (MVP):** Geografia para Concursos Públicos.
* **Escalabilidade:** Motor universal orientado a dados (JSON). A adição de novas disciplinas (ex: Português, Legislação, Pedagogia) deve ocorrer apenas inserindo novos arquivos de conteúdo, sem alterar o código da interface.

---

## 2. Pilares Pedagógicos (Ciência Cognitiva)
A plataforma aplica quatro mecanismos de alta eficácia:
1. **Recuperação Ativa (Active Recall):** O usuário é constantemente desafiado a puxar a informação da memória (flashcards e questões) em vez de apenas reler textos passivos.
2. **Repetição Espaçada (SRS):** Flashcards e questões erradas retornam em intervalos crescentes baseados na dificuldade relatada pelo usuário.
3. **Efeito de Teste sob Pressão (Testing Effect):** Quizzes rápidos cronometrados treinam a velocidade de resgate de memória e a resistência emocional para o dia da prova.
4. **Feedback Imediato e Explicativo:** Toda resposta (certa ou errada) exibe justificativa curta e objetiva para corrigir lacunas na hora.

---

## 3. Fluxos de Navegação e Modos de Estudo

### 3.1. Trilha Conectada (Modo Campanha)
* Os tópicos de Geografia são organizados em um mapa visual de nós conectados em sequência lógica (ex: *Cartografia → Geografia Física → Geografia Humana → Geopolítica → Geografia do Brasil*).
* Cada nó exibe seu percentual de domínio (0% a 100%), status (*Bloqueado/Disponível/Dominado*) e barra de progresso.
* Completar sessões dentro de um nó desbloqueia conquistas visuais e acende a conexão para o próximo estágio.

### 3.2. Estudo Livre (Modo Sandbox)
* Acesso irrestrito a qualquer tópico, flashcard ou quiz fora da ordem da trilha, usando filtros por assunto, dificuldade ou apenas questões erradas.

### 3.3. Controles de Reset (Obrigatório)
* **Reset Local (Página/Módulo):** Botão acessível dentro de cada módulo ou nó da trilha para zerar apenas o progresso daquela página/tópico específico.
* **Reset Geral (Trilha Completa):** Botão nas configurações para zerar toda a trilha, XP e histórico.
* **Segurança:** Ambos os botões exigem um modal de confirmação explícita antes de apagar os dados.

---

## 4. Módulos do MVP (v1)

1. **Mapa da Trilha (Home):** Visão geral da jornada, meta diária, ofensiva (streak), nível/XP atual e acesso rápido aos nós.
2. **Flashcards Inteligentes (SRS):**
   * Frente (conceito/pergunta) e Verso (resposta direta + bizu de concurso).
   * Autoavaliação em 4 níveis (*Errei / Difícil / Bom / Fácil*) que recalcula a próxima data de revisão.
3. **Quiz Rápido Cronometrado (Time Attack):**
   * Bateria curta (ex: 5 a 10 questões) com barra de tempo regressiva por questão.
   * Multiplicador de combo por acertos seguidos, feedback visual instantâneo e resumo final com XP ganho.
4. **Caderno de Erros Automático:**
   * Toda questão errada no Quiz ou marcada como "Errei" no Flashcard vai automaticamente para uma fila de revisão prioritária até ser acertada novamente.
5. **Painel de Learning Analytics:**
   * Taxa de acerto por tópico, total de itens dominados, tempo médio de resposta e destaque visual dos pontos fracos.

---

## 5. Sistema de Gamificação (Foco e Dopamina)
* **XP e Patentes:** Ganho de pontos por acerto, conclusão de sessão e bônus de velocidade/combo, evoluindo o nível do estudante.
* **Combos em Tempo Real:** Sequências de acertos ativam multiplicadores (2x, 3x, 5x) com micro-animações e feedback visual crescente.
* **Ofensiva Diária (Streak):** Contador de dias consecutivos cumprindo a meta mínima diária.
* **Recompensas Visuais:** Animações de conclusão de nó, barras de progresso fluidas, selos de domínio (Bronze, Prata, Ouro) e efeitos sonoros sutis (com opção de silenciar).

---

## 6. Identidade Visual e Sistema de Temas (3 Modos)
Alternância instantânea no cabeçalho com persistência da preferência:
1. **Tema Claro (Editorial):** Fundo off-white de alto conforto visual para leitura prolongada.
2. **Tema Escuro (Foco):** Fundo escuro fosco com contraste equilibrado para estudo noturno.
3. **Tema Gamer (Desafios):** Estética de alta estimulação visual voltada para dopamina e sessões intensas — fundo escuro profundo, acentos vibrantes (neon/ciano/âmbar), brilho sutil em combos, barras de energia e feedback de recompensa amplificado.

---

## 7. Dados, Persistência e Futuro
* **Persistência v1 (Local-First):** Todos os dados de progresso, SRS, XP e preferências salvos no `localStorage`.
* **Portabilidade:** Botões de **Exportar Backup (.json)** e **Importar Backup (.json)** para o usuário transferir o progresso entre celular e PC.
* **Preparação para Nuvem:** Toda leitura e escrita de dados deve passar por uma camada abstrata (`StorageAdapter`), permitindo conectar um banco em nuvem (ex: Supabase) no futuro sem refatorar a interface.