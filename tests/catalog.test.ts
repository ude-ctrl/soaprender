import { expect, test } from 'vitest';
import raw from '../seduc-ma-bundle.json';
import { catalog, createCatalog } from '../src/content/catalog';

test('valida o conteúdo e a cobertura do edital SEDUC-MA', () => {
  expect(catalog.disciplines).toHaveLength(6);
  expect(catalog.units.size).toBe(45);
  const items = Array.from(catalog.items.values());
  expect(items.filter(item => item.kind === 'question')).toHaveLength(raw.resumo_cobertura.total_questoes);
  expect(items.filter(item => item.kind === 'card')).toHaveLength(raw.resumo_cobertura.total_flashcards);
  expect(items.every(item => item.unit.status === 'em_auditoria')).toBe(true);
  expect(items.every(item => item.kind !== 'question' || ['inedita_padrao_fcc', 'autoral_legado_em_adaptacao', 'inedita_autoral_em_auditoria'].includes(item.data.origem))).toBe(true);
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

 test('Cartografia expandida preserva o acervo anterior e as 19 missões', () => {
  const unit = catalog.units.get('CE-GEO-02')!;
  expect(unit.teoria_md.match(/^# .+/gm)).toHaveLength(19);
  expect(unit.questoes).toHaveLength(58);
  expect(unit.flashcards).toHaveLength(132);
  expect(unit.status).toBe('em_auditoria');
  for (let i=1; i<=5; i++) expect(catalog.items.has('CE-GEO-02-Q'+String(i).padStart(3,'0'))).toBe(true);
  for (let i=1; i<=6; i++) expect(catalog.items.has('CE-GEO-02-FC'+String(i).padStart(3,'0'))).toBe(true);
  expect(unit.teoria_md.match(/!\[[^\]]+\]\(\.\/media\/cartografia\/[^)]+\.svg\)/g)).toHaveLength(7);
});

 test('Geografia Física integra o lote de três unidades, sem perder Cartografia', () => {
  for (const [id, q, c, missions] of [['CE-GEO-03',13,39,10],['CE-GEO-10',12,18,8],['CE-GEO-11',12,18,8]] as const) {
    const unit = catalog.units.get(id)!;
    expect(unit.questoes).toHaveLength(q);
    expect(unit.flashcards).toHaveLength(c);
    expect(unit.teoria_md.match(/^# .+/gm)).toHaveLength(missions);
    expect(unit.status).toBe('em_auditoria');
  }
  expect(catalog.units.get('CE-GEO-02')!.questoes).toHaveLength(58);
});

 test('Geografia Humana integra geopolítica, indústria e globalização sem alterar o lote anterior', () => {
  for (const id of ['CE-GEO-04','CE-GEO-05','CE-GEO-06']) {
    const unit = catalog.units.get(id)!;
    expect(unit.teoria_md.match(/^# .+/gm)).toHaveLength(8);
    expect(unit.questoes).toHaveLength(13);
    expect(unit.flashcards).toHaveLength(20);
    expect(unit.status).toBe('em_auditoria');
    for(let i=1;i<=5;i++) expect(catalog.items.has(id+'-Q'+String(i).padStart(3,'0'))).toBe(true);
    for(let i=1;i<=6;i++) expect(catalog.items.has(id+'-FC'+String(i).padStart(3,'0'))).toBe(true);
  }
});
