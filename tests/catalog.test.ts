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
