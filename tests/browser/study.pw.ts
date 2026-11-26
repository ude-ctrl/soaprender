import { expect, test, type Page } from '@playwright/test';
import type { UserProgress } from '../../src/engine/progress';

const button = (page: Page, name: string) => page.getByRole('button', { name, exact: true });
const question = (page: Page, index: number) => page.getByRole('heading', { name: `Questão ${index} de 5` });
const feedback = (page: Page) => page.getByRole('heading', { name: 'Análise dos distratores' });

async function backup(page: Page): Promise<UserProgress> {
  await button(page, 'Ajustes').click();
  const pending = page.waitForEvent('download');
  await button(page, 'Exportar progresso').click();
  const file = await (await pending).createReadStream();
  if (!file) throw new Error('Backup sem conteúdo');
  const chunks = [];
  for await (const part of file) chunks.push(part);
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

async function selectAnswer(page: Page, alternative: string) {
  await page.locator(`label.option:has(input[value="${alternative}"])`).click();
}

test('duas abas preservam o histórico v1 e serializam tentativas e preferências concorrentes', async ({ context, page }) => {
  test.setTimeout(60_000);
  const legacy: UserProgress = { version: 1, appearance: 'light', intensity: 'focus', streakFreezes: 0, attempts: [{ itemId: 'CE-GEO-01-Q001', at: 1000, rating: 'good', wasRecovery: false }] };
  await context.addInitScript(progress => {
    if (!localStorage.getItem('soaprender.progress.v1')) {
      localStorage.setItem('soaprender.progress.v1', JSON.stringify(progress));
    }
  }, legacy);

  const second = await context.newPage();
  await Promise.all([page.goto('/'), second.goto('/')]);
  await Promise.all([button(page, 'Questões FCC').click(), button(second, 'Flashcards').click()]);
  await selectAnswer(page, 'A');
  await button(page, 'Confirmar resposta').click();
  await expect(feedback(page)).toBeVisible();
  await button(second, 'Usar aparência escura').click();
  await expect(page.locator('html')).toHaveAttribute('data-appearance', 'dark');

  await button(page, 'Próximo item').click();
  await selectAnswer(page, 'B');
  await button(second, 'Mostrar resposta').click();
  await Promise.all([
    button(page, 'Confirmar resposta').click(),
    second.getByRole('button', { name: /^Bom em / }).click(),
  ]);
  await expect(feedback(page)).toBeVisible();
  await expect(second.getByText(/Próxima revisão em/).first()).toBeVisible();

  await expect.poll(async () => (await backup(page)).attempts.length).toBe(4);
  const saved = await backup(second);
  expect(saved.appearance).toBe('dark');
  expect(saved.attempts).toContainEqual(legacy.attempts[0]);
  expect(new Set(saved.attempts.map(attempt => attempt.submissionId)).size).toBe(4);

  await second.getByLabel('Importar progresso').setInputFiles({
    name: 'legado.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(legacy)),
  });
  await button(second, 'Substituir').click();
  await expect(second.getByText('Progresso importado.')).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('data-appearance', 'light');
  expect(await backup(page)).toEqual(legacy);
});

test('retoma questão e flashcard após recarga, com rascunho e sem duplicar resposta', async ({ page }) => {
  await page.goto('/');
  await button(page, 'Questões FCC').click();
  await expect(question(page, 1)).toBeVisible();
  await selectAnswer(page, 'B');
  await button(page, 'Eliminar alternativa C').click();
  await page.reload();
  await expect(question(page, 1)).toBeVisible();
  await expect(page.locator('input[value="B"]')).toBeChecked();
  await expect(button(page, 'Restaurar alternativa C')).toBeVisible();
  await expect(feedback(page)).toHaveCount(0);

  await button(page, 'Confirmar resposta').click();
  await expect(feedback(page)).toBeVisible();
  await page.reload();
  await expect(feedback(page)).toBeVisible();
  await button(page, 'Próximo item').click();
  await expect(question(page, 2)).toBeVisible();

  await button(page, 'Flashcards').click();
  await expect(page.locator('.card-position')).toHaveText('1 / 6');
  await expect(page.getByRole('heading', { name: 'Resposta', exact: true })).toHaveCount(0);
  await button(page, 'Mostrar resposta').click();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Resposta', exact: true })).toBeVisible();

  await button(page, 'Questões FCC').click();
  await expect(question(page, 2)).toBeVisible();
  expect((await backup(page)).attempts).toHaveLength(1);
});

test('mobile tem atalhos de prática, títulos completos e revisões disponíveis', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 760 });
  await page.goto('/');
  const titles = page.locator('.trail-name');
  await expect(titles).toHaveCount(6);
  await page.evaluate(() => document.fonts.ready);
  const overflowing = await titles.evaluateAll(nodes => nodes.filter(node => {
    const range = document.createRange();
    range.selectNodeContents(node);
    const bounds = node.closest('button')!.getBoundingClientRect();
    return getComputedStyle(node).webkitLineClamp !== 'none' ||
      Array.from(range.getClientRects()).some(line =>
        line.left < bounds.left - 1 || line.right > bounds.right + 1 || line.bottom > bounds.bottom + 1);
  }).map(node => node.textContent));
  expect(overflowing).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(320);
  await button(page, 'Questões FCC').click();
  await expect(question(page, 1)).toBeVisible();
  await button(page, 'Revisões').click();
  await expect(button(page, 'Disponíveis (0)')).toBeVisible();
});
