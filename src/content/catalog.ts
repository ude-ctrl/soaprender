import raw from '../../seduc-ma-bundle.json';
import { bundleSchema, type Flashcard, type QuizQuestion, type Unit } from './schema';

export type Item = { id: string; unit: Unit } & (
  | { kind: 'question'; data: QuizQuestion }
  | { kind: 'card'; data: Flashcard }
);

export function createCatalog(input: unknown) {
  const bundle = bundleSchema.parse(input);
  const disciplines = bundle.edital.blocos.flatMap(block => block.disciplinas.map(discipline => ({
    ...discipline, block: block.nome, weight: block.peso_bloco,
  })));
  const units = new Map<string, Unit>();
  const items = new Map<string, Item>();
  const unique = (map: ReadonlyMap<string, unknown>, id: string) => {
    if (map.has(id)) throw new Error(`Identificador duplicado: ${id}`);
  };
  for (const unit of bundle.unidades) {
    unique(units, unit.topico_id);
    units.set(unit.topico_id, unit);
    for (const data of unit.questoes) {
      unique(items, data.questao_id);
      items.set(data.questao_id, { id: data.questao_id, kind: 'question', unit, data });
    }
    for (const data of unit.flashcards) {
      unique(items, data.card_id);
      items.set(data.card_id, { id: data.card_id, kind: 'card', unit, data });
    }
  }

  const covered = new Set<string>();
  const disciplineIds = new Set<string>();
  for (const discipline of disciplines) {
    if (disciplineIds.has(discipline.disciplina_id)) throw new Error('Disciplina duplicada');
    disciplineIds.add(discipline.disciplina_id);
    for (const topic of discipline.unidades) {
      const unit = units.get(topic.id);
      if (!unit || covered.has(topic.id) || unit.disciplina_id !== discipline.disciplina_id ||
        unit.slug !== topic.slug || unit.status !== topic.status) {
        throw new Error(`Vínculo inconsistente com o edital: ${topic.id}`);
      }
      covered.add(topic.id);
    }
  }

  const counts = bundle.resumo_cobertura;
  const questions = [...items.values()].filter(item => item.kind === 'question').length;
  if (covered.size !== units.size || covered.size !== counts.total_unidades_edital ||
    units.size !== counts.unidades_populadas || questions !== counts.total_questoes ||
    items.size - questions !== counts.total_flashcards) {
    throw new Error('A cobertura declarada do bundle diverge dos dados.');
  }
  return { bundle, disciplines, units, items };
}

export const catalog = createCatalog(raw);
