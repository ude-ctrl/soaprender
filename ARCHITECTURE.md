# Arquitetura do SOaprender

A aplicação React usa TypeScript strict, Vite com base relativa, Tailwind CSS, Zustand, Lucide React e Framer Motion. GitHub Pages serve o build estático.

- `seduc-ma-bundle.json` contém o edital, a matriz estratégica, o perfil FCC e o conteúdo. `src/content/` valida o formato e indexa unidades e exercícios pelos identificadores originais.
- `src/engine/` calcula revisões, domínio, XP e sequência diária a partir das tentativas. `StorageAdapter` abstrai a persistência. `LocalStorageAdapter` e a importação compartilham a validação do formato versionado.
- `src/store/` liga o motor ao Zustand. A interface confirma uma mudança de progresso depois que o armazenamento local aceita a gravação.
- `src/components/` contém a trilha, teoria em Markdown, sínteses, prática, revisões e configurações. Disciplinas, unidades, alternativas e referências são renderizadas a partir dos dados.

O domínio divide a soma das evidências pelo total de questões da unidade. Um acerto sem chute vale meia evidência. Uma recuperação correta após pelo menos 24 horas desde a tentativa anterior completa a evidência do item. Erro ou chute anulam a evidência daquele item. Flashcards alimentam a revisão e o XP. A agenda usa uma adaptação do SM-2 com retorno em 10 minutos após erro e intervalos em dias após recuperação.
