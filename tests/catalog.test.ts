import { expect, test } from 'vitest';
import raw from '../seduc-ma-bundle.json';
import { catalog, createCatalog } from '../src/content/catalog';

test('valida o conteúdo e a cobertura do edital SEDUC-MA', () => {
  expect(catalog.disciplines).toHaveLength(6);
  expect(catalog.units.size).toBe(45);
  const items = Array.from(catalog.items.values());
  expect(items.filter(item => item.kind === 'question')).toHaveLength(225);
  expect(items.filter(item => item.kind === 'card')).toHaveLength(270);
  expect(items.every(item => item.unit.status === 'em_auditoria')).toBe(true);
  expect(items.every(item => item.kind !== 'question' || item.data.origem === 'inedita_padrao_fcc')).toBe(true);
});

test('rejeita alternativas ausentes e referências divergentes do edital', () => {
  const invalid = structuredClone(raw);
  const question = invalid.unidades[0].questoes[0];
  question.alternativas.E = '';
  expect(() => createCatalog(invalid)).toThrow();
  question.alternativas.E = raw.unidades[0].questoes[0].alternativas.E;
  invalid.unidades[0].slug = 'outro-slug';
  expect(() => createCatalog(invalid)).toThrow(/Vínculo inconsistente/);
});

test.each([
  ['CG-POR-01-Q001', 'A', 'frequência'],
  ['CG-POR-01-Q005', 'D', 'condição necessária'],
  ['CG-POR-03-Q003', 'D', 'uso substantivado'],
  ['CG-POR-06-Q001', 'D', 'pronome apassivador'],
  ['CG-POR-06-Q005', 'E', 'ver ou presenciar'],
  ['CG-POR-07-Q005', 'E', 'objetiva direta'],
  ['CG-POR-08-Q004', 'C', 'preposição vem antes'],
  ['RED-FCC-02-Q003', 'B', 'uma causa'],
  ['RED-FCC-04-Q001', 'E', 'fica no singular'],
])('mantém o gabarito e a explicação revisada de %s', (id, letter, keyConcept) => {
  const item = catalog.items.get(id);
  if (item?.kind !== 'question') throw new Error(`Questão ausente: ${id}`);
  expect(item.data.gabarito).toBe(letter);
  expect(item.data.justificativa_gabarito).toContain(keyConcept);
  expect(item.data.justificativa_gabarito).not.toMatch(/\b(?:alternativa|em)\s+[A-E]\b(?=[,.;:])/);
});
