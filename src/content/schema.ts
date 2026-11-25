import { z } from 'zod';

const text = z.string().refine(value => value.trim().length > 0);
const strings = z.array(text);
export const letters = ['A', 'B', 'C', 'D', 'E'] as const;
export type Letter = typeof letters[number];
const letter = z.enum(letters);

const media = {
  mediaUrl: z.string().optional(),
  mediaCaption: z.string().optional(),
  optionExplanations: strings.optional(),
};

const question = z.looseObject({
  questao_id: text,
  origem: text,
  referencia_prova: text,
  enunciado: text,
  alternativas: z.record(letter, text),
  gabarito: letter,
  justificativa_gabarito: text,
  analise_distratores: z.partialRecord(letter, text),
  dificuldade: text,
  subtopico: text,
  ...media,
}).superRefine((item, ctx) => {
  for (const key of letters) {
    if (key !== item.gabarito && !item.analise_distratores[key]) {
      ctx.addIssue({ code: 'custom', message: `Distrator ${key} sem análise` });
    }
  }
});

const flashcard = z.looseObject({
  card_id: text, frente: text, verso: text, tipo: text, tags: strings, ...media,
});

const reference = z.looseObject({
  referencia_abnt: text, tipo: text, nivel_autoridade: z.number(), url: z.string().optional(),
});

const unit = z.looseObject({
  topico_id: text,
  slug: text,
  disciplina_id: text,
  titulo: text,
  status: text,
  origem: text,
  tempo_leitura_min: z.number().positive(),
  edital_subtopicos: strings,
  fontes_primarias: z.array(reference),
  teoria_md: text,
  sintese_fcc: z.looseObject({
    conceitos_nucleares: z.array(z.object({ termo: text, definicao_precisa: text, fonte: text })),
    pegadinhas_fcc: z.array(z.object({ armadilha: text, como_a_fcc_cobra: text, como_desarmar: text })),
    quadro_comparativo: z.array(z.record(text, z.union([text, z.number()]))),
    checklist_revisao: strings,
  }),
  questoes: z.array(question).min(1),
  flashcards: z.array(flashcard).min(1),
});

const discipline = z.looseObject({
  disciplina_id: text,
  nome: text,
  unidades: z.array(z.looseObject({ id: text, slug: text, titulo: text, status: text, prioridade: text })),
});

export const bundleSchema = z.looseObject({
  bundle_version: text,
  resumo_cobertura: z.object({
    total_unidades_edital: z.number().int(),
    unidades_populadas: z.number().int(),
    total_questoes: z.number().int(),
    total_flashcards: z.number().int(),
  }),
  edital: z.looseObject({
    identificacao: z.looseObject({ edital_numero: text, banca_organizadora: text, site_oficial: text }),
    blocos: z.array(z.looseObject({
      bloco_id: text, nome: text, questoes_bloco: z.number(), peso_bloco: z.number(),
      disciplinas: z.array(discipline),
    })),
  }),
  perfil_banca_fcc: z.looseObject({
    fontes_verificadas: z.array(z.object({ titulo: text, tipo: text, url: text })),
    anatomia_questoes_objetivas: z.record(text, z.unknown()),
  }),
  matriz_pesos_estrategia: z.looseObject({
    matematica_objetiva: z.looseObject({ formula: text, conclusao_objetiva: text }),
  }),
  unidades: z.array(unit).min(1),
});

export type Unit = z.infer<typeof unit>;
export type QuizQuestion = z.infer<typeof question>;
export type Flashcard = z.infer<typeof flashcard>;
export type Discipline = z.infer<typeof discipline>;
